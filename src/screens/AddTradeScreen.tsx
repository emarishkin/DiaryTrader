import { use, useState } from "react"
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { calculateRiskReward, generateId, todayString } from "../utils/tradeUtils"
import { Trade } from "../types"
import { StorageService } from "../storage/storage"

const AddTradeScreen = () => {

    const [market,setMarket] = useState<'spot' | 'futures'>('spot')
    const [direction,setDirection] = useState<'long' | 'short'>('long')
    const [symbol,setSymbol] = useState('')
    const [quantity,setQuantity] = useState('')
    const [entryDate,setEntryDate] = useState(todayString())
    const [entryPrice,setEntryPrice] = useState('')
    const [currency,setCurrency] = useState('RUB')
    const [stopLoss,setStopLoss] = useState('')
    const [takeProfit,setTakeProfit] = useState('')
    const [exitDate,setExitDate] = useState('')
    const [exitPrice,setExitPrice] = useState('')
    const [notes,setNotes] = useState('')
    
    const ep = parseFloat(entryPrice)
    const sl = parseFloat(stopLoss)
    const tp = parseFloat(takeProfit)

    const rrDisplay = !isNaN(ep) && !isNaN(sl) && !isNaN(tp) ? calculateRiskReward(ep,sl,tp,direction) : '—'

    const cycleCurrency = () => {
        const list = ['RUB','USD','EUR','USDT']
        const next = list[(list.indexOf(currency)+1)%list.length]
        setCurrency(next)
    }

    const clearForm = () => {
        setMarket('spot');
        setDirection('long');
        setSymbol('');
        setQuantity('');
        setEntryDate(todayString());
        setEntryPrice('');
        setStopLoss('');
        setTakeProfit('');
        setCurrency('RUB');
        setExitDate('');
        setExitPrice('');
        setNotes('');
    }

    async function handleSave(){

        if(!symbol.trim()) return Alert.alert('Ошибка', 'Введите символ')
        if(!entryPrice) return Alert.alert('Ошибка', 'Введите цену входа')
        if(!quantity) return Alert.alert('Ошибка', 'Введите количество')

        const hasExit = exitPrice && !isNaN(parseFloat(exitPrice))

        const trade:Trade = {
            id:generateId(),
            market,
            direction,
            symbol:symbol.trim().toUpperCase(),
            quantity:parseFloat(quantity),
            entryDate,
            entryPrice:parseFloat(entryPrice),
            stopLoss:stopLoss ? parseFloat(stopLoss) : undefined,
            takeProfit:takeProfit ? parseFloat(takeProfit) : undefined,
            currency,
            exitDate:exitDate || undefined,
            exitPrice:hasExit ? parseFloat(exitPrice) : undefined,
            notes:notes || undefined,
            status:hasExit ? 'close' : 'open',
            createdAt: new Date().toISOString()
        }

        if(hasExit) {
            const qty = trade.quantity
            trade.profit = trade.direction === 'long' ? (trade.exitPrice! - trade.entryPrice) * qty : (trade.entryPrice  - trade.exitPrice!) * qty
        }

        await StorageService.saveTrade(trade)
        Alert.alert('✅ Сохранено', `Сделка ${trade.symbol} сохранена`, [
        { text: 'OK', onPress: clearForm },
        ])

    }

    return(
        <SafeAreaView style={styles.root}>
            <KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <Text style={styles.title}>Добавить сделку</Text>
                <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps='handled' showsVerticalScrollIndicator={false}>

                    <Text style={styles.groupLabel}>Тип Рынка</Text>
                    
                    <View style={styles.toggleRow}>
                        <TouchableOpacity style={[styles.toggleBtn, market === 'spot' && styles.toggleBtnActive]} onPress={()=>setMarket('spot')}>
                            <Text style={[styles.toggleText, market === 'spot' && styles.toggleTextActive]}>Спот</Text>
                        </TouchableOpacity>
                    
                        <TouchableOpacity style={[styles.toggleBtn, market === 'futures' && styles.toggleBtnActive]} onPress={()=>setMarket('futures')}>
                            <Text style={[styles.toggleText, market === 'futures' && styles.toggleTextActive]}>Фьючерс</Text>
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.groupLabel}>Направление</Text>

                    <View style={styles.toggleRow}>
                        <TouchableOpacity style={[styles.toggleBtn, direction === 'long' && styles.toggleLong]} onPress={()=>setDirection('long')}>
                            <Text style={[styles.toggleText, direction === 'long' && styles.toggleTextActive]}>▲ Лонг</Text>
                        </TouchableOpacity>
                    
                        <TouchableOpacity style={[styles.toggleBtn, direction === 'short' && styles.toggleShort]} onPress={()=>setDirection('short')}>
                            <Text style={[styles.toggleText, direction === 'short' && styles.toggleTextActive]}>▼ Шорт</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.row2}>
                        <View style={{flex:1}}>
                            <Text style={styles.fieldLabel}>Символ</Text>
                            <TextInput
                                style={styles.input}
                                value={symbol}
                                onChangeText={setSymbol}
                                placeholder="SBER, BTC..."
                                placeholderTextColor='#BDBDBD'
                            />
                        </View>
                        <View style={styles.currencyBox}>
                            <Text style={styles.fieldLabel}>Валюта</Text>
                            <TouchableOpacity style={styles.currencyPill} onPress={cycleCurrency}>
                                <Text style={styles.currencyText}>{currency}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <Text style={styles.fieldLabel}>Количество</Text>
                    <TextInput
                        style={styles.input}
                        value={quantity}
                        onChangeText={setQuantity}
                        placeholder="0"
                        placeholderTextColor='#BDBDBD'
                        keyboardType='decimal-pad'
                    />

                    <View style={styles.row2}>
                        <View style={{flex:1}}>
                            <Text style={styles.fieldLabel}>Дата входа:</Text>
                            <TextInput
                                style={styles.input}
                                value={entryDate}
                                onChangeText={setEntryDate}
                                placeholder="DD.MM.YYYY"
                                placeholderTextColor='#BDBDBD'
                            />
                        </View>
                        <View style={{flex:1}}>
                            <Text style={styles.fieldLabel}>Цена входа:</Text>
                            <TextInput
                                style={styles.input}
                                value={entryPrice}
                                onChangeText={setEntryPrice}
                                placeholder="0.00"
                                placeholderTextColor='#BDBDBD'
                                keyboardType="decimal-pad"
                            />
                        </View>
                    </View>

                    <View style={styles.row2}>
                        <View style={{flex:1}}>
                            <Text style={styles.fieldLabel}>Стоп-лосс</Text>
                            <TextInput 
                                style={styles.input}
                                value={stopLoss}
                                onChangeText={setStopLoss}
                                placeholder="0.00"
                                placeholderTextColor="#BDBDBD"
                                keyboardType="decimal-pad"
                            />
                        </View>

                        <View style={{flex:1}}>
                            <Text style={styles.fieldLabel}>Тейк-профит</Text>
                            <TextInput 
                                style={styles.input}
                                value={takeProfit}
                                onChangeText={setTakeProfit}
                                placeholder="0.00"
                                placeholderTextColor="#BDBDBD"
                                keyboardType="decimal-pad"
                            />
                        </View>
                    </View>

                    <View style={styles.rrRow}>
                        <Text style={styles.rrLabel}>Соотношение риск/прибыль:</Text>
                        <Text style={[styles.rrValue, rrDisplay !== '—' && styles.rrAccent ]}>{rrDisplay}</Text>
                    </View>

                    <Text style={styles.sectionDivider}>Закрытие сделки (опционально)</Text>
                    <View style={styles.row2}>
                        <View style={{flex:1}}>
                            <Text style={styles.fieldLabel}>Дата выхода:</Text>
                            <TextInput 
                                style={styles.input}
                                value={exitDate}
                                onChangeText={setExitDate}
                                placeholder="DD.MM.YYYY"
                                placeholderTextColor="#BDBDBD"
                            />
                        </View>

                        <View style={{flex:1}}>
                            <Text style={styles.fieldLabel}>Цена выхода:</Text>
                            <TextInput 
                                style={styles.input}
                                value={exitPrice}
                                onChangeText={setExitPrice}
                                placeholder="0.00"
                                placeholderTextColor="#BDBDBD"
                                keyboardType="decimal-pad"
                            />
                        </View>
                    </View>

                    <Text style={styles.fieldLabel}>Заметки</Text>  
                    <TextInput 
                        style={[styles.input, styles.inputMultiline]}
                        value={notes}
                        onChangeText={setNotes}
                        placeholder="Ваши наблюдения..."
                        placeholderTextColor="#BDBDBD"
                        multiline
                    />

                    <View style={styles.btnRow}>
                        <TouchableOpacity style={styles.clearBtn} onPress={()=>{clearForm()}}>
                            <Text style={styles.clearBtnText}>Очистить</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.saveBtn} onPress={()=>{handleSave()}}>
                            <Text style={styles.saveBtnText}>Сохранить сделку</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={{height:80}} />
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    )
  }

const styles = StyleSheet.create({
    root:{
        flex:1,
        backgroundColor:'#F8F9FA'
    },
    content:{
        paddingHorizontal:16
    },
    title:{
        paddingHorizontal:16,
        fontSize:26,
        fontWeight:'700',
        color:'#1A1A1A',
        paddingTop:18,
        paddingBottom:16
    },
    groupLabel:{
        fontSize:12,
        fontWeight:'600',
        color:'#757575',
        marginBottom:8,
        textTransform:'uppercase'
    },
    fieldLabel: { 
        fontSize: 12, 
        fontWeight: '600', 
        color: '#757575', 
        marginBottom: 5, 
        textTransform: 'uppercase' 
    },
    toggleRow:{
        flexDirection:'row',
        gap:8,
        marginBottom:16
    },
    toggleBtn:{
        flex:1,
        paddingVertical:10,
        borderRadius:10,
        alignItems:'center',
        backgroundColor:'#F0F0F0',
        borderWidth:1,
        borderColor:'#E0E0E0'
    },
    toggleBtnActive: {
        backgroundColor: '#1E88E5',
        borderColor: '#1E88E5' 
    },
    toggleLong: { 
        backgroundColor: '#2E7D32', 
        borderColor: '#2E7D32' 
    },
    toggleShort: { 
        backgroundColor: '#C62828', 
        borderColor: '#C62828' 
    },
    toggleText: { 
        fontSize: 14, 
        fontWeight: '600', 
        color: '#757575' 
    },
    toggleTextActive: { 
        color: '#FFF' 
    },
    row2: { 
        flexDirection: 'row', 
        gap: 12 
    },
    input: {
        backgroundColor: '#FFF', 
        borderRadius: 10, 
        borderWidth: 1, 
        borderColor: '#E0E0E0',
        paddingHorizontal: 12, 
        paddingVertical: Platform.OS === 'ios' ? 12 : 8,
        fontSize: 15, 
        color: '#1A1A1A', 
        marginBottom: 12,
    },
    currencyBox: { 
        width: 90 
    },
    currencyPill: {
        backgroundColor: '#FFF', 
        borderRadius: 10, 
        borderWidth: 1, 
        borderColor: '#E0E0E0',
        paddingHorizontal: 12, 
        paddingVertical: Platform.OS === 'ios' ? 12 : 9, 
        marginBottom: 12,
    },
    currencyText: { 
        fontSize: 15, 
        fontWeight: '600', 
        color: '#1A1A1A' 
    },
    rrRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F0F4FF',
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 10,
        marginBottom: 12,
    },
    rrLabel: { 
        fontSize: 13, 
        color: '#546E7A', 
        flex: 1 
    },
    rrValue: { 
        fontSize: 15, 
        fontWeight: '700', 
        color: '#9E9E9E' 
    },
    rrAccent: { 
        color: '#1E88E5' 
    },
    sectionDivider: {
        fontSize: 12, fontWeight: '600', color: '#9E9E9E',
        textTransform: 'uppercase', marginVertical: 12,
        borderTopWidth: 1, borderTopColor: '#EEEEEE', paddingTop: 14,
    },
    inputMultiline: { 
        height: 80, 
        textAlignVertical: 'top' 
    },
    btnRow: { 
        flexDirection: 'row', 
        gap: 12, 
        marginTop: 8 
    },
    clearBtn: {
        flex: 1, 
        backgroundColor: '#FFEBEE', 
        borderRadius: 12,
        paddingVertical: 15, 
        alignItems: 'center',
        borderWidth: 1, 
        borderColor: '#FFCDD2',
    },
    clearBtnText: { 
        color: '#C62828', 
        fontSize: 15, 
        fontWeight: '700' 
    },
    saveBtn: { 
        flex: 2, 
        backgroundColor: '#2E7D32', 
        borderRadius: 12, 
        paddingVertical: 15, 
        alignItems: 'center' 
    },
    saveBtnText: { 
        color: '#FFF', 
        fontSize: 15, 
        fontWeight: '700' 
    },
})

export default AddTradeScreen