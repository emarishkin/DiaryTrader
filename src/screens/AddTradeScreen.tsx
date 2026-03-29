import { use, useCallback, useEffect, useState } from "react"
import { Alert, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { calculateRiskReward, generateId, todayString } from "../utils/tradeUtils"
import { Strategy, Trade } from "../types"
import { StorageService } from "../storage/storage"
import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native"
import * as ImagePicker from 'expo-image-picker'



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
    const [confidence,setConfidence] = useState<'low'|'medium'|'high'|undefined>(undefined)
    const [emotion,setEmotion] = useState<'fear'|'neutral'|'greed'|undefined>(undefined)
    const [followedPlan,setFollowedPlan] = useState<boolean | undefined>(undefined)
    const [setupName,setSetupName] = useState('')
    const [strategies, setStrategies] = useState<Strategy[]>([])
    const [showStrategyPicker, setShowStrategyPicker] = useState(false)
    const [photos,setPhotos] = useState<string[]>([])

    const route = useRoute<any>()
    const navigation = useNavigation<any>();
    const tradeToEdit:Trade | undefined = route.params?.tradeToEdit
    const isEdit = !!tradeToEdit

    useEffect(() => {
        if (tradeToEdit) {
            setMarket(tradeToEdit.market)
            setDirection(tradeToEdit.direction)
            setSymbol(tradeToEdit.symbol)
            setQuantity(String(tradeToEdit.quantity))
            setEntryDate(tradeToEdit.entryDate)
            setEntryPrice(String(tradeToEdit.entryPrice))
            setStopLoss(tradeToEdit.stopLoss ? String(tradeToEdit.stopLoss) : '')
            setTakeProfit(tradeToEdit.takeProfit ? String(tradeToEdit.takeProfit) : '')
            setCurrency(tradeToEdit.currency)
            setExitDate(tradeToEdit.exitDate ?? '')
            setExitPrice(tradeToEdit.exitPrice ? String(tradeToEdit.exitPrice) : '')
            setNotes(tradeToEdit.notes ?? '')
            setSetupName(tradeToEdit.setupName ?? '')
            setConfidence(tradeToEdit.confidence)
            setEmotion(tradeToEdit.emotion)
            setFollowedPlan(tradeToEdit.followedPlan)
            setPhotos(tradeToEdit.photos ?? [])
        }
    }, [tradeToEdit])
    
    useFocusEffect(useCallback(()=>{
        StorageService.getStrategies().then(setStrategies)
    },[]))

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
        setConfidence(undefined);
        setEmotion(undefined);
        setFollowedPlan(undefined)
        setSetupName('')
        setShowStrategyPicker(false)
        setPhotos([])
    }

    async function handleSave(){

        if(!symbol.trim()) return Alert.alert('Ошибка', 'Введите символ')
        if(!entryPrice) return Alert.alert('Ошибка', 'Введите цену входа')
        if(!quantity) return Alert.alert('Ошибка', 'Введите количество')

        const hasExit = exitPrice && !isNaN(parseFloat(exitPrice))

        const trade:Trade = {
            id:tradeToEdit?.id ?? generateId(),
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
            createdAt: tradeToEdit?.createdAt ?? new Date().toISOString(),
            confidence:confidence || undefined,
            emotion:emotion || undefined,
            followedPlan: followedPlan,
            setupName:setupName || undefined,
            photos: photos.length > 0 ? photos : undefined
        }

        if(hasExit) {
            const qty = trade.quantity
            trade.profit = trade.direction === 'long' ? (trade.exitPrice! - trade.entryPrice) * qty : (trade.entryPrice  - trade.exitPrice!) * qty
        }

        await StorageService.saveTrade(trade)

        if(isEdit){
            Alert.alert('✅ Обновлено', `Сделка ${trade.symbol} обновлена`, [
                { text: 'OK', onPress: () => navigation.goBack() },
            ])
        } else {
            Alert.alert('✅ Сохранено', `Сделка ${trade.symbol} сохранена`, [
                { text: 'OK', onPress: clearForm },
            ])
        }
    }

    const pickImage = async () => {
        if(photos.length >= 4){
            Alert.alert('Максимум', 'Можно прикрепить не более 4 фото')
            return
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes:ImagePicker.MediaTypeOptions.Images,
            allowsEditing:false,
            quality:0.7,
            allowsMultipleSelection:false
        })

        if(!result.canceled && result.assets[0]){
            setPhotos(prev=>[...prev, result.assets[0].uri])
        }
    }

    const removePhoto = (index:number) => {
        setPhotos(prev => prev.filter((_,i)=> i != index))
    }

    return(
        <SafeAreaView style={styles.root}>
            <KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <Text style={styles.title}>{isEdit ? 'Редактировать сделку' : 'Добавить сделку'}</Text>
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

                    <Text style={styles.fieldLabel}>Скриншоты графика</Text>
                    <View style={styles.photosRow}>
                        {photos.map((uri,index)=>(
                            <View style={styles.photoWrapper} key={index}>
                                <Image 
                                    source={{uri}}
                                    style={styles.photoThumb}
                                    resizeMode="cover"
                                />
                                <TouchableOpacity style={styles.photoRemove} onPress={()=>removePhoto(index)}>
                                    <Text style={styles.photoRemoveText}>✕</Text>
                                </TouchableOpacity>
                            </View>
                        ))}
                        {photos.length < 4 && (
                            <TouchableOpacity style={styles.photoAdd} onPress={pickImage} activeOpacity={0.8}>
                                <Text style={styles.photoAddIcon}>📷</Text>
                                <Text style={styles.photoAddText}>Добавить</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    <Text style={styles.fieldLabel}>Стратегия</Text>
                    <TouchableOpacity style={styles.strategyPicker} onPress={()=>setShowStrategyPicker(!showStrategyPicker)} activeOpacity={0.8}>
                        <Text style={setupName ? styles.strategyText : styles.strategyPlaceholder}>
                            {setupName || 'Выберите стратегию...'}
                        </Text>
                        <Text style={styles.strategyArrow}>▼</Text>
                    </TouchableOpacity>
                    {showStrategyPicker && (
                        <View style={styles.strategyDropdown}>
                            <TouchableOpacity style={styles.strategyItem} onPress={()=>{setSetupName(''); setShowStrategyPicker(false)}}>
                                <Text style={styles.strategyItemEmpty}>— Без стратегии —</Text>
                            </TouchableOpacity>
                            {strategies.map(s => (
                                <TouchableOpacity style={styles.strategyItem} key={s.id} onPress={() => {setSetupName(s.name); setShowStrategyPicker(false)}}>
                                    <Text style={styles.strategyItemText}>{s.name}</Text>
                                </TouchableOpacity>
                            ))}
                            {strategies.length === 0 && (
                                <Text style={styles.strategyEmpty}>
                                    Нет стратегий. Добавьте в разделе Аналитика
                                </Text>
                            )}
                        </View>
                    )}

                    <Text style={styles.sectionDivider}>Психология сделки</Text>

                    <Text style={styles.fieldLabel}>Уверенность в сделке</Text>
                    <View style={styles.toggleRow}>
                        {([
                            { label: '😟 Низкая', value: 'low' },
                            { label: '😐 Средняя', value: 'medium' },
                            { label: '💪 Высокая', value: 'high' },
                        ] as const).map(opt=>(
                            <TouchableOpacity key={opt.value} style={[styles.toggleBtn,confidence === opt.value && styles.confidenceActive]} onPress={()=>setConfidence(opt.value)}>
                                <Text style={[styles.toggleText, confidence === opt.value && styles.toggleTextActive]}>{opt.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <Text style={styles.fieldLabel}>Эмоциональное состояние</Text>
                    <View style={styles.toggleRow}>
                        {([
                            { label: '😨 Страх', value: 'fear' },
                            { label: '😐 Нейтрально', value: 'neutral' },
                            { label: '🤑 Жадность', value: 'greed' },
                        ] as const).map(opt=>(
                            <TouchableOpacity style={[styles.toggleBtn, emotion === opt.value && styles.emotionActive]} key={opt.value} onPress={()=>setEmotion(opt.value)}>
                                <Text style={[styles.toggleText,emotion === opt.value && styles.toggleTextActive]}>{opt.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <Text style={styles.fieldLabel}>Соблюдение торгового плана</Text>
                    <View style={styles.planRow}>
                        <Text style={[styles.planLabel,followedPlan === false && styles.planLabelActive]}>Нет</Text>
                        <TouchableOpacity 
                        style={[styles.planTrack,followedPlan && styles.planTrackActive]}
                        onPress={()=>setFollowedPlan(prev => prev === undefined ? true : !prev)}
                        >
                            <View style={[styles.planThumb, followedPlan && styles.planThumbActive]} />
                        </TouchableOpacity>
                        <Text style={[styles.planLabel, followedPlan === true && styles.planLabelActive]}>Да</Text>
                    </View>


                    <View style={styles.btnRow}>
                        <TouchableOpacity style={styles.clearBtn} onPress={()=>{clearForm()}}>
                            <Text style={styles.clearBtnText}>Очистить</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.saveBtn} onPress={()=>{handleSave()}}>
                            <Text style={styles.saveBtnText}>{isEdit ? 'Сохранить изменения' : 'Сохранить сделку'}</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={{height:80}} />
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    )
  }

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#1d1d29' },
  content: { paddingHorizontal: 16 },
  title: { paddingHorizontal: 16,fontSize: 26, fontWeight: '700', color: '#FFFFFF', paddingTop: 18, paddingBottom: 16 },
  groupLabel: { fontSize: 12, fontWeight: '600', color: '#555577', marginBottom: 8, textTransform: 'uppercase' },
  fieldLabel: { fontSize: 12, fontWeight: '600', color: '#555577', marginBottom: 5, textTransform: 'uppercase' },
  toggleRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  toggleBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center', backgroundColor: '#1A1A24', borderWidth: 1, borderColor: '#2A2A38' },
  toggleBtnActive: { backgroundColor: '#2979FF', borderColor: '#2979FF' },
  toggleLong: { backgroundColor: '#0D2E1A', borderColor: '#1B5E35' },
  toggleShort: { backgroundColor: '#2E0D0D', borderColor: '#5E1B1B' },
  toggleText: { fontSize: 14, fontWeight: '600', color: '#555577' },
  toggleTextActive: { color: '#FFF' },
  row2: { flexDirection: 'row', gap: 12 },
  input: {
    backgroundColor: '#1A1A24', borderRadius: 10, borderWidth: 1, borderColor: '#2A2A38',
    paddingHorizontal: 12, paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    fontSize: 15, color: '#FFFFFF', marginBottom: 12,
  },
  inputMultiline: { height: 80, textAlignVertical: 'top' },
  currencyBox: { width: 90 },
  currencyPill: {
    backgroundColor: '#1A1A24', borderRadius: 10, borderWidth: 1, borderColor: '#2A2A38',
    paddingHorizontal: 12, paddingVertical: Platform.OS === 'ios' ? 12 : 9, marginBottom: 12,
  },
  currencyText: { fontSize: 15, fontWeight: '600', color: '#FFFFFF' },
  rrRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#13131C',
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 12,
    borderWidth: 1, borderColor: '#2A2A38',
  },
  rrLabel: { fontSize: 13, color: '#555577', flex: 1 },
  rrValue: { fontSize: 15, fontWeight: '700', color: '#555577' },
  rrAccent: { color: '#2979FF' },
  sectionDivider: {
    fontSize: 12, fontWeight: '600', color: '#555577', textTransform: 'uppercase',
    marginVertical: 12, borderTopWidth: 1, borderTopColor: '#2A2A38', paddingTop: 14,
  },
  btnRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
  clearBtn: {
    flex: 1, backgroundColor: '#2E0D0D', borderRadius: 12, paddingVertical: 15,
    alignItems: 'center', borderWidth: 1, borderColor: '#5E1B1B',
  },
  clearBtnText: { color: '#F44336', fontSize: 15, fontWeight: '700' },
  saveBtn: { flex: 2, backgroundColor: '#0D2E1A', borderRadius: 12, paddingVertical: 15, alignItems: 'center', borderWidth: 1, borderColor: '#1B5E35' },
  saveBtnText: { color: '#4CAF50', fontSize: 15, fontWeight: '700' },
  confidenceActive: { backgroundColor: '#1565C0', borderColor: '#1565C0' },
  emotionActive: { backgroundColor: '#6A1B9A', borderColor: '#6A1B9A' },
  planRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  planLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555577',
    width: 30,
  },
  planLabelActive: {
    color: '#FFFFFF',
  },
  planTrack: {
    width: 56,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#2E0D0D',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1,
    borderColor: '#2A2A38',
  },
  planTrackActive: {
    backgroundColor: '#0D2E1A',
    borderColor: '#1B5E35',
  },
  planThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F44336',
  },
  planThumbActive: {
    backgroundColor: '#4CAF50',
    alignSelf: 'flex-end',
  },
  strategyPicker: {
    backgroundColor: '#1A1A24',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2A2A38',
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 12 : 9,
    marginBottom: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  strategyText: { fontSize: 15, color: '#FFFFFF' },
  strategyPlaceholder: { fontSize: 15, color: '#555577' },
  strategyArrow: { color: '#555577', fontSize: 12 },
  strategyDropdown: {
    backgroundColor: '#1A1A24',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2A2A38',
    marginBottom: 12,
    overflow: 'hidden',
  },
  strategyItem: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#13131C',
  },
  strategyItemText: { fontSize: 14, color: '#FFFFFF' },
  strategyItemEmpty: { fontSize: 14, color: '#555577' },
  strategyEmpty: { padding: 14, color: '#555577', fontSize: 13 },  
  photosRow: {
  flexDirection: 'row',
  gap: 10,
  marginBottom: 12,
  flexWrap: 'wrap',
  },
  photoWrapper: {
    width: 80,
    height: 80,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  photoThumb: {
    width: 80,
    height: 80,
    borderRadius: 10,
  },
  photoRemove: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoRemoveText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
  photoAdd: {
    width: 80,
    height: 80,
    borderRadius: 10,
    backgroundColor: '#1A1A24',
    borderWidth: 1,
    borderColor: '#2A2A38',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  photoAddIcon: { fontSize: 24 },
  photoAddText: { fontSize: 11, color: '#555577', fontWeight: '600' },
  });

export default AddTradeScreen