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

    const closedWithPlan = closed.filter(t => t.followedPlan !== undefined)
    const followedWithPlan = closed.filter(t => t.followedPlan === true)
    const followedPlanRate = closedWithPlan.length > 0 
    ? (followedWithPlan.length / closedWithPlan.length) * 100 
    : 0

    const emotionStats = (['fear', 'neutral', 'greed'] as const).map(emotion => {
        const trades = closed.filter(t => t.emotion === emotion)
        const wins = trades.filter(t=>(t.profit ?? 0)>0)
        return {
            emotion,
            count: trades.length,
            winRate: trades.length > 0 ? (wins.length / trades.length) * 100 : 0
        }
    }).filter(e => e.count > 0)

    const confidenceStats = (['low', 'medium', 'high'] as const).map(conf => {
        const trades = closed.filter(t => t.confidence === conf)
        const wins = trades.filter(t=>(t.profit ?? 0)>0)
        return {
            confidence: conf,
            count: trades.length,
            winRate: trades.length > 0 ? (wins.length / trades.length) * 100 : 0
        }
    }).filter(c => c.count > 0)

    const strategyStats = (()=>{

        const map:Record<string, {
            name:string,
            total:number,
            wins:number,
            losses:number,
            pnl:number,
            currency:string
        }> = {}

        closed.forEach(t=>{
            if(!t.setupName) return
            if(!map[t.setupName]){
                map[t.setupName] = {
                    name:t.setupName,
                    total:0,
                    wins:0,
                    losses:0,
                    pnl:0,
                    currency:t.currency
                }
            }
            map[t.setupName].total += 1
            map[t.setupName].pnl += (t.profit ?? 0)
            if ((t.profit ?? 0) > 0 ) map[t.setupName].wins += 1
            else map[t.setupName].losses +=1
        })
        return Object.values(map).sort((a,b)=>(b.wins / b.total) - (a.wins / a.total))
    })()

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
                                    {formatMoney(avgWin, wins[0]?.currency ?? 'RUB')}
                                </Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Средний убыток</Text>
                                <Text style={[styles.infoValue, styles.red]}>
                                    {formatMoney(-avgLoss, losses[0]?.currency ?? 'USDT')}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>🏆 Лучшая/ Худшая сделка</Text>
                            {wins.length > 0 && (
                                <View style={[styles.extremeRow,styles.winRow]}>
                                    <Text style={styles.psychLabel}>
                                        🟢 {wins.sort((a,b) => (b.profit ?? 0) - (a.profit ?? 0))[0].symbol}
                                    </Text>
                                    <Text style={[styles.extremeVal, styles.green]}>
                                        {formatMoney(wins[0].profit ?? 0, wins[0].currency)}
                                    </Text>
                                </View>
                            )}
                            {losses.length > 0 && (
                                <View style={[styles.extremeRow,styles.lossRow]}>
                                    <Text style={styles.psychLabel}>
                                        🔴 {losses.sort((a,b) => (a.profit ?? 0) - (b.profit ?? 0))[0].symbol}
                                    </Text>
                                    <Text style={[styles.extremeVal,styles.red]}>
                                        {formatMoney(losses[0].profit ?? 0, losses[0].currency)}
                                    </Text>
                                </View>
                            )}
                        </View>

                        {(closedWithPlan.length > 0 || emotionStats.length > 0 || confidenceStats.length > 0) && (
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>🧠 Психологический анализ</Text>

                                {closedWithPlan.length > 0 && (
                                    <View style={styles.infoRow}>
                                        <Text style={styles.infoLabel}>Соблюдение плана</Text>
                                        <Text style={[styles.infoValue, followedPlanRate >= 70 ? styles.green : styles.red]}>
                                            {followedPlanRate.toFixed(0)}%
                                        </Text>
                                    </View>
                                )}

                                {emotionStats.length > 0 && (
                                    <View style={styles.psychBlock}>
                                        <Text style={styles.psychTitle}>Винрейт по эмоциям</Text>
                                        {emotionStats.map(e => (
                                            <View style={styles.psychRow} key={e.emotion}>
                                                <Text style={styles.psychLabel}>
                                                    {
                                                        e.emotion === 'fear' ? '😨 Страх' :
                                                        e.emotion === 'neutral' ? '😐 Нейтрально' :
                                                        '🤑 Жадность'
                                                    }
                                                </Text>
                                                <View style={styles.psychBarTrack}>
                                                    <View
                                                        style={[
                                                            styles.psychBarFill,
                                                            {
                                                                width: `${e.winRate}%`,
                                                                backgroundColor:
                                                                    e.emotion === 'fear' ? '#C62828' :
                                                                    e.emotion === 'neutral' ? '#1565C0' :
                                                                    '#6A1B9A'
                                                            }
                                                        ]}
                                                    />
                                                </View>
                                                <Text style={[styles.psychPercent, e.winRate >= 50 ? styles.green : styles.red]}>
                                                    {e.winRate.toFixed(0)}%
                                                </Text>
                                            </View>
                                        ))}
                                    </View>
                                )}

                                {confidenceStats.length > 0 && (
                                    <View style={styles.psychBlock}>
                                        <Text style={styles.psychTitle}>Винрейт по уверенности</Text>
                                        {confidenceStats.map(c => (
                                            <View style={styles.psychRow} key={c.confidence}>
                                                <Text style={styles.psychLabel}>
                                                    {
                                                        c.confidence === 'low' ? '😟 Низкая' :
                                                        c.confidence === 'medium' ? '😐 Средняя' :
                                                        '💪 Высокая'
                                                    }
                                                </Text>
                                                <View style={styles.psychBarTrack}>
                                                    <View style={[
                                                        styles.psychBarFill,
                                                            {
                                                              width: `${c.winRate}%`,
                                                              backgroundColor:
                                                                c.confidence === 'low' ? '#C62828' :
                                                                c.confidence === 'medium' ? '#1565C0' :
                                                                '#2E7D32'
                                                            }
                                                        ]} 
                                                    />
                                                </View>
                                                <Text style={[styles.psychPercent, c.winRate >= 50 ? styles.green : styles.red]}>
                                                    {c.winRate.toFixed(0)}%
                                                </Text>
                                            </View>
                                        ))}
                                    </View>
                                )}

                            </View>
                        )}

                        {strategyStats.length > 0 && (
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>📋 Эффективность стратегий</Text>
                                <Text style={styles.stratSubtitle}>Отсортировано по винрейту</Text>

                                {strategyStats.map((s,index)=>{
                                    const winRate = (s.wins / s.total) * 100
                                    const isPositive = s.pnl >= 0
                                    const currencySymbol = s.currency === 'RUB' ? '₽' :
                                        s.currency === 'USD' ? '$' :
                                        s.currency === 'EUR' ? '€' : s.currency 

                                    return (
                                        <View key={s.name} style={[styles.stratCard, index === 0 && styles.stratCardBest]}>

                                            <View style={styles.stratCardTop}>
                                                <View style={styles.stratCardLeft}>
                                                    {index === 0 && (
                                                        <Text style={styles.stratBestBadge}>🏆 Лучшая</Text>
                                                    )}
                                                    <Text style={styles.stratName}>{s.name}</Text>
                                                </View>
                                                <Text style={[styles.stratPnl, isPositive ? styles.green : styles.red]}>
                                                    {isPositive ? '+' : ''}{s.pnl.toLocaleString('ru-RU', { maximumFractionDigits: 2 })} {currencySymbol}
                                                </Text>
                                            </View>

                                            <View style={styles.stratBarRow}>
                                                <View style={styles.stratBarTrack}>
                                                    <View style={[
                                                        styles.stratBarFill,
                                                        {
                                                            width: `${winRate}%`,
                                                            backgroundColor: winRate >= 50 ? '#2E7D32' : '#C62828'
                                                        }
                                                    ]} />
                                                </View>
                                                <Text style={[styles.stratWinRate, winRate >= 50 ? styles.green : styles.red]}>
                                                    {winRate.toFixed(0)}%
                                                </Text>
                                            </View>

                                            <View style={styles.stratDetails}>
                                                <Text style={styles.stratDetail}>
                                                    📊 {s.total} сделок
                                                </Text>
                                                <Text style={styles.stratDetail}>
                                                    ✅ {s.wins} побед
                                                </Text>
                                                <Text style={styles.stratDetail}>
                                                    ❌ {s.losses} убытков
                                                </Text>
                                            </View>

                                        </View>
                                    )
                                })}

                            </View>
                        )}

                    </>
                )}

                <View style={{ height: 100 }} />
            </ScrollView>
        </SafeAreaView>
    )
  }

  const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#1d1d29' },
  content: { paddingHorizontal: 16 },
  title: { paddingHorizontal: 16, fontSize: 26, fontWeight: '700', color: '#FFFFFF', paddingTop: 18, paddingBottom: 16 },
  emptyBox: { backgroundColor: '#1A1A24', borderRadius: 16, padding: 40, alignItems: 'center', marginTop: 20, borderWidth: 1, borderColor: '#2A2A38' },
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: '#FFFFFF', marginBottom: 8 },
  emptyHint: { fontSize: 13, color: '#555577', textAlign: 'center', lineHeight: 18 },
  section: { backgroundColor: '#1A1A24', borderRadius: 16, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: '#2A2A38' },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#FFFFFF', marginBottom: 12 },
  tilesRow: { flexDirection: 'row', gap: 8 },
  tile: { flex: 1, alignItems: 'center', backgroundColor: '#13131C', borderRadius: 12, paddingVertical: 12, borderWidth: 1, borderColor: '#2A2A38' },
  tileVal: { fontSize: 20, fontWeight: '800', color: '#FFFFFF', marginBottom: 4 },
  tileLabel: { fontSize: 10, color: '#555577', textAlign: 'center' },
  green: { color: '#4CAF50' },
  red: { color: '#F44336' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#2A2A38' },
  infoLabel: { fontSize: 14, color: '#555577' },
  infoValue: { fontSize: 14, fontWeight: '700' },
  extremeRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10, marginBottom: 8 },
  winRow: { backgroundColor: '#0D2E1A' },
  lossRow: { backgroundColor: '#2E0D0D' },
  extremeSymbol: { fontSize: 14, fontWeight: '600', color: '#FFFFFF' },
  extremeVal: { fontSize: 14, fontWeight: '700' },
  strategiesBtn: { backgroundColor: '#1A1A24', borderRadius: 14, paddingVertical: 16, paddingHorizontal: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6, borderWidth: 1, borderColor: '#2A2A38' },
  strategiesBtnLeft: { fontSize: 15, fontWeight: '600', color: '#FFFFFF' },
  strategiesBtnRight: { fontSize: 13, color: '#2979FF', fontWeight: '500' },
  psychBlock: {
  marginTop: 12,
  },
  psychTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#555577',
    textTransform: 'uppercase',
    marginBottom: 10,
    letterSpacing: 0.4,
  },
  psychRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  psychLabel: {
    width: 110,
    fontSize: 13,
    color: '#AAAACC',
  },
  psychBarTrack: {
    flex: 1,
    height: 8,
    backgroundColor: '#13131C',
    borderRadius: 4,
    overflow: 'hidden',
  },
  psychBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  psychPercent: {
    width: 36,
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'right',
  },
  stratSubtitle: {
  fontSize: 11,
  color: '#555577',
  marginBottom: 12,
  marginTop: -8,
  },
  stratCard: {
    backgroundColor: '#13131C',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#2A2A38',
  },
  stratCardBest: {
    borderColor: '#2E7D32',
    borderWidth: 1.5,
  },
  stratCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  stratCardLeft: {
    flex: 1,
  },
  stratBestBadge: {
    fontSize: 11,
    color: '#4CAF50',
    fontWeight: '600',
    marginBottom: 4,
  },
  stratName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
  },
  stratPnl: {
    fontSize: 16,
    fontWeight: '800',
    marginLeft: 8,
  },
  stratBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  stratBarTrack: {
    flex: 1,
    height: 10,
    backgroundColor: '#1d1d29',
    borderRadius: 5,
    overflow: 'hidden',
  },
  stratBarFill: {
    height: '100%',
    borderRadius: 5,
  },
  stratWinRate: {
    fontSize: 12,
    fontWeight: '700',
    width: 40,
    textAlign: 'right',
  },
  stratDetails: {
    flexDirection: 'row',
    gap: 12,
  },
  stratDetail: {
    fontSize: 12,
    color: '#555577',
  },
  });
  

export default StatisticsScreen