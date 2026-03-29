import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TextInput, TouchableOpacity, 
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Trade } from '../types';
import { StorageService } from '../storage/storage';
import { formatMoney } from '../utils/tradeUtils';
import { SafeAreaView } from 'react-native-safe-area-context';

type Filter = 'all' | 'open' | 'closed' | 'long' | 'short';
type SortBy = 'date_new' | 'date_old' | 'profit_high' | 'profit_low';

const FILTERS: { label: string; value: Filter }[] = [
  { label: 'Все', value: 'all' },
  { label: 'Открытые', value: 'open' },
  { label: 'Закрытые', value: 'closed' },
  { label: 'Лонг', value: 'long' },
  { label: 'Шорт', value: 'short' },
];

const TradeHistoryScreen = () => {

  const navigation = useNavigation<any>()

  const [trades, setTrades] = useState<Trade[]>([]);
  const [filter, setFilter] = useState<Filter>('all');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('date_new')
  const [showSortMenu,setShowSortMenu] = useState(false)

  useFocusEffect(useCallback(() => {
    StorageService.getTrades().then(setTrades);
  }, []));

  const filtered = trades.filter(t => {
    const matchFilter =
      filter === 'all' ? true :
      filter === 'open' ? t.status === 'open' :
      filter === 'closed' ? t.status === 'close' :
      filter === 'long' ? t.direction === 'long' :
      t.direction === 'short';
    const matchSearch = search
      ? t.symbol.toLowerCase().includes(search.toLowerCase())
      : true;
    return matchFilter && matchSearch;
  });

  const totalPnL = filtered
    .filter(t => t.status === 'close')
    .reduce((s, t) => s + (t.profit ?? 0), 0);
  
  const sorted = [...filtered].sort((a,b)=>{
    switch(sortBy){
      case 'date_new':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      case 'date_old':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      case 'profit_high':
        return (b.profit ?? 0) - (a.profit ?? 0)
      case 'profit_low':
        return (a.profit ?? 0) - (b.profit ?? 0)
    }
  })

  return (
    <SafeAreaView style={styles.root}>

      <View style={styles.header}>
        <View>
          <Text style={styles.title}>История сделок</Text>
          <Text style={styles.subtitle}>{trades.length} сделок</Text>
        </View>
        <TouchableOpacity style={styles.sortBtn} onPress={()=>setShowSortMenu(!showSortMenu)} activeOpacity={0.8}>
          <Text style={styles.sortBtnText}>⇅ Сортировка</Text>
        </TouchableOpacity>
      </View>

      {showSortMenu && (
        <View style={styles.sortMenu}>
          {([
            { label: '📅 Сначала новые', value: 'date_new' },
            { label: '📅 Сначала старые', value: 'date_old' },
            { label: '💰 Сначала прибыльные', value: 'profit_high' },
            { label: '💸 Сначала убыточные', value: 'profit_low' },
          ] as const).map(opt => (
            <TouchableOpacity 
              key={opt.value} 
              style={[
                styles.sortItem,
                sortBy === opt.value && styles.sortItemActive
              ]}
              onPress={()=>{setSortBy(opt.value),setShowSortMenu(false)}}
            >
              <Text style={[styles.sortItemText, sortBy === opt.value && styles.sortItemTextActive]}>
                {opt.label}
              </Text>  
              {sortBy === opt.value && (
                <Text style={styles.sortCheck}>✓</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={styles.searchBox}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Поиск по символу..."
          placeholderTextColor="#BDBDBD"
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Text style={styles.clearX}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.filterRow}>
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f.value}
            style={[styles.filterBtn, filter === f.value && styles.filterBtnActive]}
            onPress={() => setFilter(f.value)}
          >
            <Text style={[styles.filterText, filter === f.value && styles.filterTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {filtered.some(t => t.status === 'close') && (
        <View style={styles.summaryRow}>
          <Text style={styles.summaryText}>Найдено: {filtered.length}</Text>
          <Text style={[styles.summaryPnL, totalPnL >= 0 ? styles.green : styles.red]}>
            P&L: {formatMoney(totalPnL)}
          </Text>
        </View>
      )}

      <FlatList
        data={sorted}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.row} onPress={()=>navigation.navigate('TradeDetail', {tradeId: item.id})} activeOpacity={0.75}>
            <View style={[styles.dirDot, item.direction === 'long' ? styles.dotLong : styles.dotShort]} />
            <View style={styles.rowMiddle}>
              <Text style={styles.rowSymbol}>{item.symbol}</Text>
              <Text style={styles.rowMeta}>
                {item.market === 'spot' ? 'Спот' : 'Фьючерс'} · {item.direction === 'long' ? 'Лонг' : 'Шорт'}
              </Text>
              <Text style={styles.rowDate}>{item.entryDate}</Text>
            </View>
            <View style={styles.rowRight}>
              {item.status === 'close' ? (
                <Text style={[(item.profit ?? 0) >= 0 ? styles.green : styles.red, styles.rowProfit]}>
                  {formatMoney(item.profit ?? 0, item.currency)}
                </Text>
              ) : (
                <View style={styles.openChip}>
                  <Text style={styles.openChipText}>Открыта</Text>
                </View>
              )}
              <Text style={styles.rowPrice}>Вход: {item.entryPrice}</Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyText}>Нет сделок</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#1d1d29' },
  header: { paddingHorizontal: 16, paddingTop: 18, paddingBottom: 10 },
  title: { fontSize: 26, fontWeight: '700', color: '#FFFFFF' },
  subtitle: { fontSize: 13, color: '#555577', marginTop: 2 },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A1A24', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, marginHorizontal: 16, marginBottom: 12, borderWidth: 1, borderColor: '#2A2A38' },
  searchIcon: { fontSize: 14, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14, color: '#FFFFFF' },
  clearX: { fontSize: 13, color: '#555577', paddingLeft: 8 },
  filterRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 10 },
  filterBtn: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, backgroundColor: '#1A1A24', borderWidth: 1, borderColor: '#2A2A38' },
  filterBtnActive: { backgroundColor: '#2979FF', borderColor: '#2979FF' },
  filterText: { fontSize: 12, fontWeight: '600', color: '#555577' },
  filterTextActive: { color: '#FFF' },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 8 },
  summaryText: { fontSize: 13, color: '#555577' },
  summaryPnL: { fontSize: 13, fontWeight: '700' },
  green: { color: '#4CAF50' },
  red: { color: '#F44336' },
  list: { paddingHorizontal: 16, paddingBottom: 100 },
  row: { backgroundColor: '#1A1A24', borderRadius: 16, padding: 14, marginBottom: 10, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#2A2A38' },
  dirDot: { width: 4, height: 50, borderRadius: 2, marginRight: 12 },
  dotLong: { backgroundColor: '#4CAF50' },
  dotShort: { backgroundColor: '#F44336' },
  rowMiddle: { flex: 1 },
  rowSymbol: { fontSize: 16, fontWeight: '700', color: '#FFFFFF', marginBottom: 3 },
  rowMeta: { fontSize: 12, color: '#555577', marginBottom: 2 },
  rowDate: { fontSize: 11, color: '#3A3A50' },
  rowRight: { alignItems: 'flex-end', gap: 5 },
  rowProfit: { fontSize: 14, fontWeight: '700' },
  rowPrice: { fontSize: 11, color: '#555577' },
  openChip: { backgroundColor: '#1A2A4A', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  openChipText: { fontSize: 11, color: '#2979FF', fontWeight: '600' },
  empty: { paddingVertical: 60, alignItems: 'center' },
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  emptyText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
  sortBtn: {
  backgroundColor: '#1A1A24',
  paddingHorizontal: 12,
  paddingVertical: 8,
  borderRadius: 20,
  borderWidth: 1,
  borderColor: '#2A2A38',
  },
  sortBtnText: {
    fontSize: 12,
    color: '#AAAACC',
    fontWeight: '600',
  },
  sortMenu: {
    backgroundColor: '#1A1A24',
    borderRadius: 14,
    marginHorizontal: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#2A2A38',
    overflow: 'hidden',
  },
  sortItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#13131C',
  },
  sortItemActive: {
    backgroundColor: '#13131C',
  },
  sortItemText: {
    fontSize: 14,
    color: '#AAAACC',
  },
  sortItemTextActive: {
    color: '#2979FF',
    fontWeight: '600',
  },
  sortCheck: {
    fontSize: 14,
    color: '#2979FF',
    fontWeight: '700',
  },

});

export default TradeHistoryScreen;