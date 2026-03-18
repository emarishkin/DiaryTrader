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
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { TradeHistoryScreen } from './TradeHistoryScreen';


const DashboardScreen = () => {
 
    const [trades,setTrades] = useState<Trade[]>([])
    const [search,setSearch] = useState('')
    const [refreshing,setRefreshing] = useState(false)

    useFocusEffect(useCallback(()=>{
      StorageService.getTrades().then(setTrades)
    }, []))

    const navigation = useNavigation()

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
                      <View style={styles.card} key={t.id}>
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
                      </View>
                    ))
                )}

                <TouchableOpacity style={styles.historyBtn} activeOpacity={0.8} >
                    <Text style={styles.historyBtnLeft}>📋  История сделок</Text>
                    <Text style={styles.historyBtnRight}>{trades.length} сделок  →</Text>
                </TouchableOpacity>
                
                <View style={{ height: 100 }} />

            </ScrollView>
        </SafeAreaView>
    )
  }

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F8F9FA' },
  content: { paddingHorizontal: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 18, paddingBottom: 14 },
  greeting: { fontSize: 13, color: '#757575', marginBottom: 2 },
  title: { fontSize: 26, fontWeight: '700', color: '#1A1A1A' },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#1E88E5', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 11, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  searchIcon: { fontSize: 15, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14, color: '#1A1A1A' },
  clearBtn: { fontSize: 13, color: '#9E9E9E', paddingLeft: 8 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  statCard: { flex: 1, backgroundColor: '#FFF', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 8, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 },
  statGreen: { backgroundColor: '#E8F5E9' },
  statRed: { backgroundColor: '#FFEBEE' },
  statVal: { fontSize: 17, fontWeight: '700', color: '#1A1A1A', marginBottom: 3 },
  statLabel: { fontSize: 10, color: '#9E9E9E', textAlign: 'center' },
  green: { color: '#2E7D32' },
  red: { color: '#C62828' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sectionTitle: { fontSize: 17, fontWeight: '600', color: '#1A1A1A' },
  sectionCount: { fontSize: 13, color: '#9E9E9E' },
  emptyBox: { backgroundColor: '#FFF', borderRadius: 14, padding: 32, alignItems: 'center', marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  emptyIcon: { fontSize: 36, marginBottom: 10 },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: '#1A1A1A', marginBottom: 6 },
  emptyHint: { fontSize: 13, color: '#9E9E9E', textAlign: 'center' },
  card: { backgroundColor: '#FFF', borderRadius: 14, padding: 14, marginBottom: 10, flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  dirBadge: { paddingHorizontal: 8, paddingVertical: 5, borderRadius: 8, marginRight: 10 },
  longBg: { backgroundColor: '#E8F5E9' },
  shortBg: { backgroundColor: '#FFEBEE' },
  dirText: { fontSize: 10, fontWeight: '700' },
  longColor: { color: '#2E7D32' },
  shortColor: { color: '#C62828' },
  cardMid: { flex: 1 },
  symbol: { fontSize: 16, fontWeight: '700', color: '#1A1A1A' },
  subtext: { fontSize: 11, color: '#BDBDBD', marginTop: 2 },
  cardRight: { alignItems: 'flex-end', gap: 4 },
  priceLabel: { fontSize: 11, color: '#9E9E9E' },
  priceValue: { fontWeight: '600', color: '#424242' },
  openChip: { backgroundColor: '#E3F2FD', paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6 },
  openChipText: { fontSize: 10, fontWeight: '600', color: '#1E88E5' },
  historyBtn: { backgroundColor: '#FFF', borderRadius: 14, paddingVertical: 16, paddingHorizontal: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6, borderWidth: 1.5, borderColor: '#E3F2FD' },
  historyBtnLeft: { fontSize: 15, fontWeight: '600', color: '#1A1A1A' },
  historyBtnRight: { fontSize: 13, color: '#1E88E5', fontWeight: '500' },
});

export default DashboardScreen
