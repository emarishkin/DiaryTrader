import { use, useState } from "react"
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { todayString } from "../utils/tradeUtils"

const AddTradeScreen = () => {

    const [market,setMarket] = useState<'spot' | 'futures'>('spot')
    const [direction,setDirection] = useState<'long' | 'short'>('long')
    const [symbol,setSymbol] = useState('')
    const [quantity,setQuantity] = useState('')
    const [entryDate,setEnrtyDate] = useState(todayString())
    const [entryPrice,setEntryPrice] = useState('')
    const [currency,setCurrency] = useState('RUB')

    const cycleCurrency = () => {
        const list = ['RUB','USD','EUR','USDT']
        const next = list[(list.indexOf(currency)+1)%list.length]
        setCurrency(next)
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
                            <Text style={styles.groupLabel}>Символ</Text>
                            <TextInput
                                style={styles.input}
                                value={symbol}
                                onChangeText={setSymbol}
                                placeholder="SBER, BTC..."
                                placeholderTextColor='#BDBDBD'
                            />
                        </View>
                        <View style={styles.currencyBox}>
                            <Text style={styles.groupLabel}>Валюта</Text>
                            <TouchableOpacity style={styles.currencyPill} onPress={cycleCurrency}>
                                <Text style={styles.currencyText}>{currency}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <Text style={styles.groupLabel}>Количество</Text>
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
                            <Text style={styles.groupLabel}>Дата входа:</Text>
                            <TextInput
                                style={styles.input}
                                value={entryDate}
                                onChangeText={setEnrtyDate}
                                placeholder="DD.MM.YYYY"
                                placeholderTextColor='#BDBDBD'
                            />
                        </View>
                        <View style={{flex:1}}>
                            <Text style={styles.groupLabel}>Цена входа:</Text>
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

                    <View style={{height:100}} />
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
})

export default AddTradeScreen