import { useCallback, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Trade } from "../types";
import { useFocusEffect } from "@react-navigation/native";
import { StorageService } from "../storage/storage";

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