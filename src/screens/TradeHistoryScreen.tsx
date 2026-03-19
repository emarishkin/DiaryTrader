import { useCallback, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Trade } from "../types";
import { useFocusEffect } from "@react-navigation/native";
import { StorageService } from "../storage/storage";
import { FlatList, TextInput } from "react-native-gesture-handler";
import { formatMoney } from "../utils/tradeUtils";

type Filter = 'all' |'open' | 'closed' | 'long' | 'short'

const FILTERS: {label:string, value:Filter}[] = [
    {label:'Все',value:'all'},
    {label:'Открытые',value:'open'},
    {label:'Закрытые',value:'closed'},
    {label:'Лонг',value:'long'},
    {label:'Шорт',value:'short'},
]

export const TradeHistoryScreen = () => {

    const [trades,setTrades] = useState<Trade[]>([])
    const [filter,setFilter] = useState<Filter>('all')
    const [search,setSearch] = useState('')

    useFocusEffect(useCallback(()=>{
        StorageService.getTrades().then(setTrades)
    },[]))

    const filtred = trades.filter(t => {
        const matchFilter = 
            filter === 'all' ? true :
            filter === 'open' ? t.status === 'open':
            filter === 'closed' ? t.status === 'close':
            filter === 'long' ? t.direction === 'long':
            t.direction === 'short'
        const matchSearch = search ? t.symbol.toLowerCase().includes(search.toLowerCase()) : true
        return matchFilter && matchSearch
    })

    const totalPnL = filtred.filter(t => t.status === 'close').reduce((s,t)=> s + (t.profit ?? 0),0)

    return (
        <SafeAreaView style={styles.root}>

            <View style={styles.header}>
                <Text style={styles.title}>История сделок</Text>
                <Text style={styles.subtitle}>{trades.length}</Text>
            </View>

            <View style={styles.searchBox}>
                <Text style={styles.searchIcon}>🔍</Text>
                <TextInput 
                    style={styles.searchInput}
                    placeholder="Поиск по символу..."
                    placeholderTextColor='#BDBDBD'
                    value={search}
                    onChangeText={setSearch}
                />
                {search.length > 0 && (
                    <TouchableOpacity onPress={()=>setSearch('')}>
                        <Text style={styles.clearX}>✕</Text>
                    </TouchableOpacity>
                )}
            </View>

            <View style={styles.filterRow}>
                {FILTERS.map(f => (
                    <TouchableOpacity key={f.value} style={[styles.filterBtn, filter === f.value && styles.filterBtnActive]} onPress={()=>setFilter(f.value)}>
                        <Text style={[styles.filterText, filter === f.value && styles.filterText]}>{f.label}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {filtred.some(t => t.status === 'close') && (
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryText}>Найдено: {filtred.length}</Text>
                    <Text style={[styles.summaryPnL, totalPnL > 0 ? styles.green : styles.red]}>P&L: {formatMoney(totalPnL)}</Text>
                </View>
            )}

            <FlatList 
                data={filtred}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
                renderItem={({item})=>(
                    <View style={styles.row}>
                        <View style={[styles.dirDot, item.direction === 'long' ? styles.dotLong : styles.dotShort]}>
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
                                <Text style={styles.rowPrice}>Вход:{item.entryPrice}</Text>
                            </View>
                        </View>
                    </View>
                )}
                ListEmptyComponent={
                    <View style={styles.empty}>
                      <Text style={styles.emptyIcon}>📭</Text>
                      <Text style={styles.emptyText}>Нет сделок</Text>
                    </View>
                } 
            />

        </SafeAreaView>
    )
}
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { paddingHorizontal: 16, paddingTop: 18, paddingBottom: 10 },
  title: { fontSize: 26, fontWeight: '700', color: '#1A1A1A' },
  subtitle: { fontSize: 13, color: '#9E9E9E', marginTop: 2 },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, marginHorizontal: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3, elevation: 2 },
  searchIcon: { fontSize: 14, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14, color: '#1A1A1A' },
  clearX: { fontSize: 13, color: '#9E9E9E', paddingLeft: 8 },
  filterRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 10 },
  filterBtn: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, backgroundColor: '#F0F0F0', borderWidth: 1, borderColor: '#E0E0E0' },
  filterBtnActive: { backgroundColor: '#1E88E5', borderColor: '#1E88E5' },
  filterText: { fontSize: 12, fontWeight: '600', color: '#757575' },
  filterTextActive: { color: '#FFF' },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 8 },
  summaryText: { fontSize: 13, color: '#9E9E9E' },
  summaryPnL: { fontSize: 13, fontWeight: '700' },
  green: { color: '#2E7D32' },
  red: { color: '#C62828' },
  list: { paddingHorizontal: 16, paddingBottom: 100 },
  row: { backgroundColor: '#FFF', borderRadius: 14, padding: 14, marginBottom: 10, flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 },
  dirDot: { width: 4, height: 50, borderRadius: 2, marginRight: 12 },
  dotLong: { backgroundColor: '#2E7D32' },
  dotShort: { backgroundColor: '#C62828' },
  rowMiddle: { flex: 1 },
  rowSymbol: { fontSize: 16, fontWeight: '700', color: '#1A1A1A', marginBottom: 3 },
  rowMeta: { fontSize: 12, color: '#9E9E9E', marginBottom: 2 },
  rowDate: { fontSize: 11, color: '#BDBDBD' },
  rowRight: { alignItems: 'flex-end', gap: 5 },
  rowProfit: { fontSize: 14, fontWeight: '700' },
  rowPrice: { fontSize: 11, color: '#9E9E9E' },
  openChip: { backgroundColor: '#E3F2FD', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  openChipText: { fontSize: 11, color: '#1E88E5', fontWeight: '600' },
  empty: { paddingVertical: 60, alignItems: 'center' },
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  emptyText: { fontSize: 16, fontWeight: '600', color: '#1A1A1A' },
});