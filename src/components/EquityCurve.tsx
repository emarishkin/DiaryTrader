import { useCallback, useState } from "react"
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { Balance, Transaction } from "../types"
import { useFocusEffect } from "@react-navigation/native"
import { StorageService } from "../storage/storage"
import { LineChart } from "react-native-chart-kit"

const SCREEN_WIDTH = Dimensions.get('window').width

interface EquityCurveProps {
    title?:string
    showHeader?:boolean
}

export const EquityCurve = ({title = 'Кривая капитала', showHeader = true}:EquityCurveProps) => {

    const [transactions,setTransactions] = useState<Transaction[]>([])
    const [balance,setBalance] = useState<Balance | null>(null)
    const [period,setPeriod] = useState<'week' | 'month' | 'all'>('month')
    
    useFocusEffect(useCallback(()=>{
        StorageService.getTransactions().then(setTransactions)
        StorageService.getBalance().then(setBalance)
    },[]))

    const currencySymbol = balance?.currency === 'RUB' ? '₽': balance?.currency === 'USD' ? '$': balance?.currency === 'EUR' ? '€' : balance?.currency === 'USDT'? 'USDT': balance?.currency ?? 'USDT';
    
    const now = new Date()
    const filtered = transactions.filter(t => {
        if(period === 'all') return true
        const date = new Date(t.createdAt)
        const days = period === 'week' ? 7 : 30
        const diff = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    })

    const buildChartData = () => {
        const initial = balance?.initialAmount ?? 0
        if (filtered.length === 0) return { labels: ['Старт'], data: [initial] }
    
        const sorted = [...filtered].sort(
            (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        )
    
        let running = initial
        const points: { label: string; value: number }[] = [{ label: 'Старт', value: initial }]
    
        sorted.forEach(t => {
            if (t.type === 'deposit' || t.type === 'trade_profit') running += t.amount
            else running -= t.amount
            const date = new Date(t.createdAt)
            const label = `${date.getDate()}.${date.getMonth() + 1}`
            points.push({ label, value: Math.max(running, 0) })
        })
    
        if (points.length > 8) {
            const step = Math.floor(points.length / 8)
            const sampled = points.filter((_, i) => i % step === 0 || i === points.length - 1)
            return {
                labels: sampled.map(p => p.label),
                data: sampled.map(p => p.value),
            }
        }
    
        return {
            labels: points.map(p => p.label),
            data: points.map(p => p.value),
        }
    }
  
    const chartData = buildChartData()
    const currentValue = chartData.data[chartData.data.length - 1]
    const initialValue = chartData.data[0]
    const change = currentValue - initialValue
    const isPositive = change >= 0

    if (!balance) {
        return (
            <View style={styles.noBalance}>
                <Text style={styles.noBalanceText}>
                    💡 Настройте депозит чтобы увидеть кривую капитала
                </Text>
            </View>
        )
    }

    return (
        <View style={styles.container}>
            {showHeader && (
                <View style={styles.header}>
                    <View>
                        <Text style={styles.title}>{title}</Text>
                        <Text style={[styles.change, isPositive ? styles.green : styles.red]}>{isPositive ? '+' : '-'}{change.toLocaleString('ru-RU',{maximumFractionDigits:2})}{currencySymbol}</Text>
                    </View>
                    <Text style={styles.currentValue}>
                        {currentValue.toLocaleString('ru-RU',{maximumFractionDigits:2})}{currencySymbol}
                    </Text>
                </View>
            )}

            <View style={styles.periodRow}>
                {(['week','month','all'] as const).map(p => (
                    <TouchableOpacity key={p} style={[styles.periodBtn, period === p && styles.periodBtnActive]} onPress={()=>setPeriod(p)}>
                        <Text style={[styles.periodText, period === p && styles.periodTextActive]}>
                            {p === 'week' ? 'Неделя' : p === 'month' ? 'Месяц' : 'Всё время'}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <LineChart
                data={{
                    labels: chartData.labels,
                    datasets: [{ data: chartData.data }],
                }}
                width={SCREEN_WIDTH - 48}
                height={180}
                chartConfig={{
                    backgroundColor: '#1A1A24',
                    backgroundGradientFrom: '#1A1A24',
                    backgroundGradientTo: '#1A1A24',
                    decimalPlaces: 0,
                    color: (opacity = 1) => isPositive
                        ? `rgba(76, 175, 80, ${opacity})`
                        : `rgba(244, 67, 54, ${opacity})`,
                    labelColor: () => '#555577',
                propsForDots: {
                    r: '4',
                    strokeWidth: '2',
                    stroke: isPositive ? '#4CAF50' : '#F44336',
                },
                propsForBackgroundLines: {
                    strokeDasharray: '',
                    stroke: '#2A2A38',
                    strokeWidth: 1,
                },
                }}
                bezier
                style={styles.chart}
                withVerticalLines={false}
                withHorizontalLabels={true}
                fromZero={false}
            />

        </View>
    )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1A1A24',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2A2A38',
    marginBottom: 14,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  change: {
    fontSize: 13,
    fontWeight: '600',
  },
  currentValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  green: { color: '#4CAF50' },
  red: { color: '#F44336' },
  periodRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  periodBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#13131C',
    borderWidth: 1,
    borderColor: '#2A2A38',
  },
  periodBtnActive: {
    backgroundColor: '#2979FF',
    borderColor: '#2979FF',
  },
  periodText: {
    fontSize: 12,
    color: '#555577',
    fontWeight: '600',
  },
  periodTextActive: {
    color: '#FFFFFF',
  },
  chart: {
    borderRadius: 12,
    marginLeft: -16,
  },
  noBalance: {
    backgroundColor: '#1A1A24',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#2A2A38',
    marginBottom: 14,
  },
  noBalanceText: {
    fontSize: 13,
    color: '#555577',
    textAlign: 'center',
    lineHeight: 20,
  },
})