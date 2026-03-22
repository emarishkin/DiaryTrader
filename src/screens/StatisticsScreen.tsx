import { useCallback, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context";
import { Trade } from "../types";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { StorageService } from "../storage/storage";
import { formatMoney } from "../utils/tradeUtils";

const StatisticsScreen = () => {

    const navigation = useNavigation<any>()

    const [trades,setTrades] = useState<Trade[]>([])

    useFocusEffect(useCallback(()=>{
        StorageService.getTrades().then(setTrades)
    },[]))

    const closed = trades.filter(t => t.status === 'close')
    const wins = closed.filter(t => (t.profit ?? 0) > 0)
    const losses = closed.filter(t => (t.profit ?? 0) < 0)
    const winRate = closed.length > 0 ? (wins.length / closed.length) * 100 : 0
    const grossProfit = wins.reduce((s,t)=> s + (t.profit ?? 0), 0)
    const grossLoss = Math.abs(losses.reduce((s,t)=> s + (t.profit ?? 0), 0))
    const netPnl = grossProfit - grossLoss
    const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : 0
    const avgWin = wins.length > 0 ? grossProfit / wins.length : 0
    const avgLoss = losses.length > 0 ? grossLoss / losses.length : 0

    return(
        <SafeAreaView style={styles.root}>
            <Text style={styles.title}>Аналитика</Text>
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {closed.length === 0 && (
                    <View style={styles.emptyBox}>
                        <Text style={styles.emptyIcon}>📊</Text>
                        <Text style={styles.emptyTitle}>Нет данных</Text>
                        <Text style={styles.emptyHint}>Закройте хотябы одну сделку чтобы увидеть статистику</Text>
                    </View>
                )}

                {closed.length > 0 && (
                    <>
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>🎯 Общая статистика</Text>
                            <View style={styles.tilesRow}>
                                <View style={styles.tile}>
                                    <Text style={styles.tileVal}>{closed.length}</Text>
                                    <Text style={styles.tileLabel}>Закрытых</Text>
                                </View>
                                <View style={styles.tile}>
                                    <Text style={[styles.tileVal, styles.green]}>{wins.length}</Text>
                                    <Text style={styles.tileLabel}>Побед</Text>
                                </View>
                                <View style={styles.tile}>
                                    <Text style={[styles.tileVal, styles.red]}>{losses.length}</Text>
                                    <Text style={styles.tileLabel}>Убытков</Text>
                                </View>
                                <View style={styles.tile}>
                                    <Text style={[styles.tileVal,winRate > 50 ? styles.green : styles.red]}>
                                        {winRate.toFixed(0)}%
                                    </Text>
                                    <Text style={styles.tileLabel}>Винрейт</Text>
                                </View>
                            </View>
                        </View>

                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>💰 Финансовый результат</Text>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Чистый P&L</Text>
                                <Text style={[styles.infoValue, netPnl > 0 ? styles.green : styles.red]}>
                                    {formatMoney(netPnl)}
                                </Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Профит-фактор</Text>
                                <Text style={[styles.infoValue, profitFactor >= 1 ? styles.green : styles.red]}>
                                    {profitFactor.toFixed(2)}
                                </Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Средняя прибыль</Text>
                                <Text style={[styles.infoValue, styles.green]}>
                                    +{avgWin.toFixed(0)} ₽
                                </Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Средний убыток</Text>
                                <Text style={[styles.infoValue, styles.red]}>
                                    -{avgLoss.toFixed(0)} ₽
                                </Text>
                            </View>
                        </View>

                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>🏆 Лучшая/ Худшая сделка</Text>
                            {wins.length > 0 && (
                                <View style={[styles.extremeRow,styles.winRow]}>
                                    <Text style={styles.winRow}>
                                        🟢 {wins.sort((a,b) => (b.profit ?? 0) - (a.profit ?? 0))[0].symbol}
                                    </Text>
                                    <Text style={[styles.extremeVal, styles.green]}>
                                        {formatMoney(wins[0].profit ?? 0, wins[0].currency)}
                                    </Text>
                                </View>
                            )}
                            {losses.length > 0 && (
                                <View style={[styles.extremeRow,styles.lossRow]}>
                                    <Text style={styles.lossRow}>
                                        🔴 {losses.sort((a,b) => (a.profit ?? 0) - (b.profit ?? 0))[0].symbol}
                                    </Text>
                                    <Text style={[styles.extremeVal,styles.red]}>
                                        {formatMoney(losses[0].profit ?? 0, losses[0].currency)}
                                    </Text>
                                </View>
                            )}
                        </View>
                    </>
                )}

                <TouchableOpacity style={styles.strategiesBtn} onPress={()=>navigation.navigate('Strategies')} activeOpacity={0.8}>
                    <Text style={styles.strategiesBtnLeft}>📋  Мои стратегии</Text>
                </TouchableOpacity>

                <View style={{ height: 100 }} />
            </ScrollView>
        </SafeAreaView>
    )
  }

  const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F8F9FA' },
  content: { paddingHorizontal: 16 },
  title: { paddingHorizontal: 16, fontSize: 26, fontWeight: '700', color: '#1A1A1A', paddingTop: 18, paddingBottom: 16 },
  emptyBox: { backgroundColor: '#FFF', borderRadius: 16, padding: 40, alignItems: 'center', marginTop: 20 },
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: '#1A1A1A', marginBottom: 8 },
  emptyHint: { fontSize: 13, color: '#9E9E9E', textAlign: 'center', lineHeight: 18 },
  section: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#1A1A1A', marginBottom: 12 },
  tilesRow: { flexDirection: 'row', gap: 8 },
  tile: { flex: 1, alignItems: 'center', backgroundColor: '#F8F9FA', borderRadius: 12, paddingVertical: 12 },
  tileVal: { fontSize: 20, fontWeight: '800', color: '#1A1A1A', marginBottom: 4 },
  tileLabel: { fontSize: 10, color: '#9E9E9E', textAlign: 'center' },
  green: { color: '#2E7D32' },
  red: { color: '#C62828' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  infoLabel: { fontSize: 14, color: '#9E9E9E' },
  infoValue: { fontSize: 14, fontWeight: '700' },
  extremeRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10, marginBottom: 8 },
  winRow: { backgroundColor: '#E8F5E9' },
  lossRow: { backgroundColor: '#FFEBEE' },
  extremeSymbol: { fontSize: 14, fontWeight: '600', color: '#1A1A1A' },
  extremeVal: { fontSize: 14, fontWeight: '700' },
  strategiesBtn: { backgroundColor: '#FFF', borderRadius: 14, paddingVertical: 16, paddingHorizontal: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6, borderWidth: 1.5, borderColor: '#E3F2FD' },
  strategiesBtnLeft: { fontSize: 15, fontWeight: '600', color: '#1A1A1A' },
  strategiesBtnRight: { fontSize: 13, color: '#1E88E5', fontWeight: '500' },
});

export default StatisticsScreen