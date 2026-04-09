import React, { useCallback, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TextInput, TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Trade } from '../types';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { StorageService } from '../storage/storage';
import { formatMoney } from '../utils/tradeUtils';



const DashboardScreen = () => {
 
    const [trades,setTrades] = useState<Trade[]>([])
    const [search,setSearch] = useState('')
    const [refreshing,setRefreshing] = useState(false)

    useFocusEffect(useCallback(()=>{
      StorageService.getTrades().then(setTrades)
    }, []))

   const navigation = useNavigation<any>();

    const onRefresh = async () => {
      setRefreshing(true)
      await StorageService.getTrades().then(setTrades)
      setRefreshing(false)
    }

    const openTrades = trades.filter(t => t.status === 'open')
    const closeTrades = trades.filter(t => t.status === 'close')
    const netPnL = closeTrades.reduce((sum,step) => sum + (step.profit ?? 0),0)
    
    const filtred = search ? openTrades.filter(t => t.symbol.toLowerCase().includes(search.toLowerCase())) : openTrades

    return(
        <SafeAreaView style={styles.root}>
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator = {false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#1E88E5"  />}>
                
                <View style={styles.header}>
                    <View>
                        <Text style={styles.greeting}>Дневник трейдера 📒</Text>
                        <Text style={styles.title}>Главная страница</Text>
                    </View>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>M</Text>
                    </View>
                </View>

                <View style={styles.searchBox}>
                    <Text style={styles.searchIcon}>🔍</Text>
                    <TextInput
                        style={styles.searchInput}
                        placeholder='Поиск открытых сделок...'
                        placeholderTextColor="#BDBDBD"
                        value={search}
                        onChangeText={setSearch}
                    />
                    
                    {search.length > 0 && (
                      <TouchableOpacity onPress={()=>setSearch('')}>
                        <Text style={styles.clearBtn}>✕</Text>
                      </TouchableOpacity>
                    )}

                </View>

                <View style={styles.statsRow}>
                    <View style={styles.statCard}>
                        <Text style={styles.statVal}>{openTrades.length}</Text>
                        <Text style={styles.statLabel}>Открытых</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statVal}>{trades.length}</Text>
                        <Text style={styles.statLabel}>Всего сделок</Text>
                    </View>
                    <View style={[styles.statCard, netPnL > 0 && styles.statGreen, netPnL < 0 && styles.statRed]}>
                        <Text style={[styles.statVal, netPnL > 0 && styles.green, netPnL < 0 && styles.red]}>{netPnL === 0 ? '0 ₽' : formatMoney(netPnL)}</Text>
                        <Text style={styles.statLabel}>Чистый P&L</Text>
                    </View>
                </View>

                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Открытые сделки</Text>
                    <Text style={styles.sectionCount}>{filtred.length}</Text>
                </View>

                {filtred.length === 0 ? (
                    <View style={styles.emptyBox}>
                      <Text style={styles.emptyIcon}>{search ? '🔎' : '📭'}</Text>
                      <Text style={styles.emptyTitle}>{search ? 'Ничего не найдено' : 'Нет открытых сделок'}</Text>
                      <Text style={styles.emptyHint}>{search ? 'Попробуйте изменитб запрос' : 'Добавьте первую сделку через вкладку +'}</Text>
                    </View>
                ) : (
                    filtred.map(t=>(
                      <TouchableOpacity key={t.id} style={styles.card} onPress={()=>navigation.navigate('TradeDetail', {tradeId: t.id})} activeOpacity={0.75}>
                        <View style={[styles.dirBadge, t.direction === 'long' ? styles.longBg : styles.shortBg]}>
                          <Text style={[styles.dirText, t.direction === 'long' ? styles.longColor : styles.shortColor]}>
                            {t.direction === 'long' ? 'ЛОНГ' : 'ШОРТ'}
                          </Text>
                        </View>
                        <View style={styles.cardMid}>
                          <Text style={styles.symbol}>{t.symbol}</Text>
                          <Text style={styles.subtext}>{t.market === 'spot' ? 'Спот' : 'Фьючерс'} · {t.entryDate}</Text>
                        </View>
                        <View style={styles.cardRight}>
                          <Text style={styles.priceLabel}>Вход: <Text style={styles.priceValue}>{t.entryPrice}</Text></Text>
                          <View style={styles.openChip}>
                            <Text style={styles.openChipText}>Открыта</Text>
                          </View>
                        </View>
                      </TouchableOpacity>
                    ))
                )}

                <TouchableOpacity style={styles.historyBtn} activeOpacity={0.8} onPress={() => (navigation as any).navigate('TradeHistory')}>
                    <Text style={styles.historyBtnLeft}>📋  История сделок</Text>
                    <Text style={styles.historyBtnRight}>{trades.length} сделок  →</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.strategiesBtn} activeOpacity={0.8} onPress={()=>navigation.navigate('Strategies')}>
                    <Text style={styles.historyBtnLeft}>📋  Мои стратегии</Text>
                    <Text style={styles.historyBtnRight}>→</Text>
                </TouchableOpacity>
                
                <View style={{ height: 100 }} />

            </ScrollView>
        </SafeAreaView>
    )
  }

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#1d1d29' },
  content: { paddingHorizontal: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 18, paddingBottom: 14 },
  greeting: { fontSize: 13, color: '#555577', marginBottom: 2 },
  title: { fontSize: 26, fontWeight: '700', color: '#FFFFFF' },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#2979FF', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A1A24', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 16, borderWidth: 1, borderColor: '#2A2A38' },
  searchIcon: { fontSize: 15, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14, color: '#FFFFFF' },
  clearBtn: { fontSize: 13, color: '#555577', paddingLeft: 8 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  statCard: { flex: 1, backgroundColor: '#1A1A24', borderRadius: 14, paddingVertical: 14, paddingHorizontal: 8, alignItems: 'center', borderWidth: 1, borderColor: '#2A2A38' },
  statGreen: { backgroundColor: '#0D2E1A', borderColor: '#1B5E35' },
  statRed: { backgroundColor: '#2E0D0D', borderColor: '#5E1B1B' },
  statVal: { fontSize: 17, fontWeight: '700', color: '#FFFFFF', marginBottom: 3 },
  statLabel: { fontSize: 10, color: '#555577', textAlign: 'center' },
  green: { color: '#4CAF50' },
  red: { color: '#F44336' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: '#FFFFFF' },
  sectionCount: { fontSize: 13, color: '#555577' },
  emptyBox: { backgroundColor: '#1A1A24', borderRadius: 16, padding: 32, alignItems: 'center', marginBottom: 12, borderWidth: 1, borderColor: '#2A2A38' },
  emptyIcon: { fontSize: 36, marginBottom: 10 },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: '#FFFFFF', marginBottom: 6 },
  emptyHint: { fontSize: 13, color: '#555577', textAlign: 'center' },
  card: { backgroundColor: '#1A1A24', borderRadius: 16, padding: 14, marginBottom: 10, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#2A2A38' },
  dirBadge: { paddingHorizontal: 8, paddingVertical: 5, borderRadius: 8, marginRight: 10 },
  longBg: { backgroundColor: '#0D2E1A' },
  shortBg: { backgroundColor: '#2E0D0D' },
  dirText: { fontSize: 10, fontWeight: '700' },
  longColor: { color: '#4CAF50' },
  shortColor: { color: '#F44336' },
  cardMid: { flex: 1 },
  symbol: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
  subtext: { fontSize: 11, color: '#555577', marginTop: 2 },
  cardRight: { alignItems: 'flex-end', gap: 4 },
  priceLabel: { fontSize: 11, color: '#555577' },
  priceValue: { fontWeight: '600', color: '#AAAACC' },
  openChip: { backgroundColor: '#1A2A4A', paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6 },
  openChipText: { fontSize: 10, fontWeight: '600', color: '#2979FF' },
  historyBtn: { backgroundColor: '#1A1A24', borderRadius: 14, paddingVertical: 16, paddingHorizontal: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6, borderWidth: 1, borderColor: '#2A2A38' },
  historyBtnLeft: { fontSize: 15, fontWeight: '600', color: '#FFFFFF' },
  historyBtnRight: { fontSize: 13, color: '#2979FF', fontWeight: '500' },
  strategiesBtn: { 
  backgroundColor: '#1A1A24', borderRadius: 14, paddingVertical: 16, 
  paddingHorizontal: 16, flexDirection: 'row', justifyContent: 'space-between', 
  alignItems: 'center', marginTop: 10, borderWidth: 1, borderColor: '#2A2A38' 
  },
});

export default DashboardScreen
