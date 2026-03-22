import { useCallback, useState } from "react";
import { Alert, FlatList, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native"
import { Strategy } from "../types";
import { useFocusEffect } from "@react-navigation/native";
import { StorageService } from "../storage/storage";
import { generateId } from "../utils/tradeUtils";
import { SafeAreaView } from "react-native-safe-area-context";

export const StrategiesScreen = () => {

    const [strategies, setStrategies] = useState<Strategy[]>([])
    const [modalVisible,setModalVisible] = useState(false)

    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [rules, setRules] = useState('')
    const [timeframe, setTimeframe] = useState('')
    const [market, setMarket] = useState('')

    useFocusEffect(useCallback(()=>{
      StorageService.getStrategies().then(setStrategies)
    },[]))

    const clearForm = () => {
        setName('')
        setDescription('')
        setRules('')
        setTimeframe('')
        setMarket('')
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
                    <View style={styles.card}>
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
                    </View>
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
  root: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 18, paddingBottom: 10 },
  title: { fontSize: 26, fontWeight: '700', color: '#1A1A1A' },
  addBtn: { backgroundColor: '#1E88E5', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  addBtnText: { color: '#FFF', fontWeight: '700', fontSize: 13 },
  list: { paddingHorizontal: 16, paddingBottom: 100 },
  card: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  cardName: { fontSize: 17, fontWeight: '700', color: '#1A1A1A', flex: 1 },
  deleteBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#FFEBEE', alignItems: 'center', justifyContent: 'center' },
  deleteBtnText: { fontSize: 14 },
  cardDesc: { fontSize: 14, color: '#616161', lineHeight: 20, marginBottom: 10 },
  cardMeta: { flexDirection: 'row', gap: 8, marginBottom: 10, flexWrap: 'wrap' },
  chip: { backgroundColor: '#F0F4FF', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  chipText: { fontSize: 12, color: '#3949AB', fontWeight: '500' },
  rulesBox: { backgroundColor: '#F8F9FA', borderRadius: 10, padding: 12, borderLeftWidth: 3, borderLeftColor: '#1E88E5' },
  rulesLabel: { fontSize: 11, fontWeight: '600', color: '#9E9E9E', marginBottom: 6, textTransform: 'uppercase' },
  rulesText: { fontSize: 13, color: '#424242', lineHeight: 19 },
  empty: { paddingTop: 60, alignItems: 'center' },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A1A', marginBottom: 8 },
  emptyHint: { fontSize: 14, color: '#9E9E9E', textAlign: 'center', lineHeight: 20 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-start' },
  modalBox: { backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24,borderBottomLeftRadius:24,borderBottomRightRadius:24, padding: 24,paddingTop:70, paddingBottom: Platform.OS === 'ios' ? 40 : 24, maxHeight: '90%' },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#1A1A1A', marginBottom: 20 },
  fieldLabel: { fontSize: 12, fontWeight: '600', color: '#757575', marginBottom: 5, textTransform: 'uppercase' },
  input: { backgroundColor: '#F5F5F5', borderRadius: 10, borderWidth: 1, borderColor: '#E0E0E0', paddingHorizontal: 14, paddingVertical: Platform.OS === 'ios' ? 12 : 8, fontSize: 15, color: '#1A1A1A', marginBottom: 12 },
  inputMulti: { height: 80, textAlignVertical: 'top' },
  row2: { flexDirection: 'row', gap: 12 },
  modalBtns: { flexDirection: 'row', gap: 12, marginTop: 8 },
  cancelBtn: { flex: 1, backgroundColor: '#F5F5F5', borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  cancelBtnText: { fontSize: 15, fontWeight: '600', color: '#616161' },
  saveBtn: { flex: 1, backgroundColor: '#1E88E5', borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  saveBtnText: { fontSize: 15, fontWeight: '700', color: '#FFF' },
});