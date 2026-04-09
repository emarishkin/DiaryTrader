import { useCallback, useState } from "react";
import { Alert, FlatList, Image, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native"
import { Strategy } from "../types";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { StorageService } from "../storage/storage";
import { generateId } from "../utils/tradeUtils";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from 'expo-image-picker'

export const StrategiesScreen = () => {

    const navigation = useNavigation<any>()

    const [strategies, setStrategies] = useState<Strategy[]>([])
    const [modalVisible,setModalVisible] = useState(false)

    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [rules, setRules] = useState('')
    const [timeframe, setTimeframe] = useState('')
    const [market, setMarket] = useState('')
    const [photos,setPhotos] = useState<string[]>([])

    useFocusEffect(useCallback(()=>{
      StorageService.getStrategies().then(setStrategies)
    },[]))

    const clearForm = () => {
        setName('')
        setDescription('')
        setRules('')
        setTimeframe('')
        setMarket('')
        setPhotos([])
    }

    async function handleSave() {
        if(!name.trim()) return Alert.alert('Ошибка', 'Введите название стратегии')

        const strategy:Strategy = {
            id: generateId(),
            name: name.trim(),
            description: description.trim(),
            rules: rules.trim(),
            timeframe: timeframe.trim(),
            market: market.trim(),
            createdAt: new Date().toISOString(),
            photos: photos.length > 0 ? photos : undefined
        }

        await StorageService.saveStrategy(strategy)
        setStrategies(prev => [strategy, ...prev])
        clearForm()
        setModalVisible(false)
    }

    async function handleDelete(id: string, name: string) {
        Alert.alert('Удалить стратегию?', `'${name}' будет удалена`,
            [
                {text:'Отмена', style:'cancel'},
                {text:'Удалить', style: 'destructive' ,onPress: async () => {
                    await StorageService.deleteStrategy(id)
                    setStrategies(prev => prev.filter(s => s.id !== id))
                }}
            ]
        )
    }

    const pickPhoto = async () => {
        if(photos.length >= 4){
            Alert.alert('Максимум', 'Можно прикрепить не более 4 фото')
            return
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes:ImagePicker.MediaTypeOptions.Images,
            quality:0.7,
        })
        if(!result.canceled && result.assets[0]){
            setPhotos(prev => [...prev,result.assets[0].uri])
        }
    }

    return (
        <SafeAreaView style={styles.root}>

            <View style={styles.header}>
                <Text style={styles.title}>Стратегии 📋</Text>
                <TouchableOpacity style={styles.addBtn} onPress={()=>setModalVisible(true)} activeOpacity={0.85}>
                    <Text style={styles.addBtnText}>+ Добавить</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={strategies}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
                renderItem={({item})=>(
                    <TouchableOpacity style={styles.card} onPress={()=>navigation.navigate('StrategyDetail',{strategy:item})} activeOpacity={0.8}>
                        <View style={styles.cardTop}>
                            <Text style={styles.cardName}>{item.name}</Text>
                            <TouchableOpacity style={styles.deleteBtn} onPress={()=>handleDelete(item.id, item.name)}>
                                <Text style={styles.deleteBtnText}>🗑</Text>
                            </TouchableOpacity>
                        </View>
                        {item.description ? (
                            <Text style={styles.cardDesc}>{item.description}</Text>
                        ) : null}
                        <View style={styles.cardMeta}>
                            {item.timeframe ? (
                                <View style={styles.chip}>
                                    <Text style={styles.chipText}>⏱ {item.timeframe}</Text>
                                </View>
                            ):null}
                            {item.market ? (
                                <View style={styles.chip}>
                                    <Text style={styles.chipText}>📊 {item.market}</Text>
                                </View>
                            ):null}
                        </View>
                        {item.rules ? (
                            <View style={styles.rulesBox}>
                                <Text style={styles.rulesLabel}>Правила входа</Text>
                                <Text style={styles.rulesText}>{item.rules}</Text>
                            </View>
                        ):null}
                    </TouchableOpacity>
                )}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Text style={styles.emptyIcon}>📋</Text>
                        <Text style={styles.emptyTitle}>Нет стратегий</Text>
                        <Text style={styles.emptyHint}>Нажмите + Добавить чтобы создать первую стратегию</Text>
                    </View>
                }
            />

            <Modal visible={modalVisible} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalBox}>
                        <Text style={styles.modalTitle}>Новая стратегия</Text>
                        <ScrollView showsVerticalScrollIndicator={false}>
                                
                            <Text style={styles.fieldLabel}>Название *</Text>
                            <TextInput 
                                style={styles.input}
                                value={name}
                                onChangeText={setName}
                                placeholder="Пробой уровня, Разворот, Три экрана..."
                                placeholderTextColor='#BDBDBD'
                            />

                            <Text style={styles.fieldLabel}>Описание</Text>
                            <TextInput 
                                style={[styles.input, styles.inputMulti]}
                                value={description}
                                onChangeText={setDescription}
                                placeholder="Краткое описание..."
                                placeholderTextColor='#BDBDBD'
                                multiline
                            />

                            <Text style={styles.fieldLabel}>Правила входа</Text>
                            <TextInput 
                                style={[styles.input, styles.inputMulti]}
                                value={rules}
                                onChangeText={setRules}
                                placeholder="1. Условие входа..."
                                placeholderTextColor='#BDBDBD'
                                multiline
                            />
                       
                            <View style={styles.row2}>
                                <View style={{flex:1}}>
                                    <Text style={styles.fieldLabel}>Таймфрейм</Text>
                                    <TextInput 
                                        style={styles.input}
                                        value={timeframe}
                                        onChangeText={setTimeframe}
                                        placeholder="1D, 4H..."
                                        placeholderTextColor='#BDBDBD'
                                    />
                                </View>
                                <View style={{flex:1}}>
                                    <Text style={styles.fieldLabel}>Рынок</Text>
                                    <TextInput 
                                        style={styles.input}
                                        value={market}
                                        onChangeText={setMarket}
                                        placeholder="Акции, Крипто..."
                                        placeholderTextColor='#BDBDBD'
                                    />
                                </View>
                            </View>

                            <Text style={styles.fieldLabel}>Фото / Схемы стратегии</Text>
                            <View style={styles.photosRow}>
                                {photos.map((uri,index)=>(
                                    <View style={styles.photoWrapper} key={index}>
                                        <Image source={{uri}} style={styles.photoThumb} resizeMode="cover" />
                                        <TouchableOpacity style={styles.photoRemove} onPress={() => setPhotos(prev => prev.filter((_,i) => i !== index))}>
                                            <Text style={styles.photoRemoveText}>✕</Text>
                                        </TouchableOpacity>
                                    </View>
                                ))}
                                {photos.length < 4 && (
                                    <TouchableOpacity style={styles.photoAdd} onPress={pickPhoto}>
                                        <Text style={styles.photoAddIcon}>📷</Text>
                                        <Text style={styles.photoAddText}>Добавить</Text>
                                    </TouchableOpacity>
                                )}
                            </View>

                            <View style={styles.modalBtns}>
                                <TouchableOpacity style={styles.cancelBtn} onPress={()=>{clearForm();setModalVisible(false)}}>
                                    <Text style={styles.cancelBtnText}>Отмена</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                                    <Text style={styles.saveBtnText}>Сохранить</Text>
                                </TouchableOpacity>
                            </View>

                        </ScrollView>
                    </View>
                </View>
            </Modal>

        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#1d1d29' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 18, paddingBottom: 10 },
  title: { fontSize: 26, fontWeight: '700', color: '#FFFFFF' },
  addBtn: { backgroundColor: '#2979FF', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  addBtnText: { color: '#FFF', fontWeight: '700', fontSize: 13 },
  list: { paddingHorizontal: 16, paddingBottom: 100 },
  card: { backgroundColor: '#1A1A24', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#2A2A38' },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  cardName: { fontSize: 17, fontWeight: '700', color: '#FFFFFF', flex: 1 },
  deleteBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#2E0D0D', alignItems: 'center', justifyContent: 'center' },
  deleteBtnText: { fontSize: 14 },
  cardDesc: { fontSize: 14, color: '#AAAACC', lineHeight: 20, marginBottom: 10 },
  cardMeta: { flexDirection: 'row', gap: 8, marginBottom: 10, flexWrap: 'wrap' },
  chip: { backgroundColor: '#1A2A4A', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  chipText: { fontSize: 12, color: '#2979FF', fontWeight: '500' },
  rulesBox: { backgroundColor: '#13131C', borderRadius: 10, padding: 12, borderLeftWidth: 3, borderLeftColor: '#2979FF' },
  rulesLabel: { fontSize: 11, fontWeight: '600', color: '#555577', marginBottom: 6, textTransform: 'uppercase' },
  rulesText: { fontSize: 13, color: '#AAAACC', lineHeight: 19 },
  empty: { paddingTop: 60, alignItems: 'center' },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#FFFFFF', marginBottom: 8 },
  emptyHint: { fontSize: 14, color: '#555577', textAlign: 'center', lineHeight: 20 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center' },
  modalBox: { backgroundColor: '#1A1A24', borderRadius: 24, padding: 24, marginHorizontal: 16, borderWidth: 1, borderColor: '#2A2A38', maxHeight: '90%' },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#FFFFFF', marginBottom: 20 },
  fieldLabel: { fontSize: 12, fontWeight: '600', color: '#555577', marginBottom: 5, textTransform: 'uppercase' },
  input: { backgroundColor: '#13131C', borderRadius: 10, borderWidth: 1, borderColor: '#2A2A38', paddingHorizontal: 14, paddingVertical: Platform.OS === 'ios' ? 12 : 8, fontSize: 15, color: '#FFFFFF', marginBottom: 12 },
  inputMulti: { height: 80, textAlignVertical: 'top' },
  row2: { flexDirection: 'row', gap: 12 },
  modalBtns: { flexDirection: 'row', gap: 12, marginTop: 8 },
  cancelBtn: { flex: 1, backgroundColor: '#13131C', borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  cancelBtnText: { fontSize: 15, fontWeight: '600', color: '#555577' },
  saveBtn: { flex: 1, backgroundColor: '#2979FF', borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  saveBtnText: { fontSize: 15, fontWeight: '700', color: '#FFF' },
  photosRow: { flexDirection: 'row', gap: 10, marginBottom: 12, flexWrap: 'wrap' },
  photoWrapper: { width: 72, height: 72, borderRadius: 10, overflow: 'hidden', position: 'relative' },
  photoThumb: { width: 72, height: 72, borderRadius: 10 },
  photoRemove: { position: 'absolute', top: 3, right: 3, width: 18, height: 18, borderRadius: 9, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center' },
  photoRemoveText: { color: '#FFF', fontSize: 9, fontWeight: '700' },
  photoAdd: { width: 72, height: 72, borderRadius: 10, backgroundColor: '#13131C', borderWidth: 1, borderColor: '#2A2A38', alignItems: 'center', justifyContent: 'center', gap: 4 },
  photoAddIcon: { fontSize: 20 },
  photoAddText: { fontSize: 10, color: '#555577', fontWeight: '600' },
});