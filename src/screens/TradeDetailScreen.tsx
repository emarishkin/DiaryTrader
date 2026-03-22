import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { Alert, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native"
import { Trade } from "../types";
import { calculateProfit, formatMoney, todayString } from "../utils/tradeUtils";
import { StorageService } from "../storage/storage";
import { SafeAreaView } from "react-native-safe-area-context";

export const TradeDetailScreen = () => {

    const navigation = useNavigation() 
    const route = useRoute<any>()
    const { tradeId } = route.params

    const [trade,setTrade] = useState<Trade | null>(null)
    const [closeModal,setCloseModal] = useState(false)
    const [exitPrice,setExitPrice] = useState('')
    const [exitDate,setExitDate] = useState(todayString())

    useFocusEffect(useCallback(()=>{
        StorageService.getTradeById(tradeId).then(setTrade)
    },[tradeId]))

    if(!trade) return null

    const profit = trade.profit ?? 0

    async function handleDelete() {
        Alert.alert('Удалить сделку', `${trade!.symbol} будет удалена`, 
            [
                {text:'Отмена', style: 'cancel'},
                {text:'Удалить', style:'destructive',onPress: async () => {
                    await StorageService.deleteTrade(tradeId)
                    navigation.goBack()
                }}
            ]
        )
    }

    async function handleClose() {
        
        if(!exitPrice || isNaN(parseFloat(exitPrice))){
            Alert.alert('Ошибка', 'Введите цену выхода')
            return
        }
        
        const updated: Trade = {
            ...trade!,
            exitPrice: parseFloat(exitPrice),
            exitDate,
            status:'close'
        }
        updated.profit = calculateProfit(updated)
        await StorageService.saveTrade(updated)
        setTrade(updated)
        setCloseModal(false)
        Alert.alert('✅ Закрыта', `Результат: ${formatMoney(updated.profit!, updated.currency)}`)
    }

    return(
        <SafeAreaView style={styles.root}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={()=>navigation.goBack()}>
                    <Text style={styles.backArrow}>←</Text>
                </TouchableOpacity>
                <Text style={styles.title}>{trade.symbol}</Text>
                <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
                    <Text style={styles.deleteBtnText}>🗑</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

                {trade.status === 'close' && (
                    <View style={[styles.pnlCard, profit >= 0 ? styles.pnlGreen : styles.pnlRed]}>
                        <Text style={styles.pnlTitle}>Результат сделки</Text>
                        <Text style={[styles.pnlValue, profit >= 0 ? styles.green : styles.red]}>{formatMoney(profit,trade.currency)}</Text>
                    </View>
                )}

                <View style={styles.badgeRow}>
                    <View style={[styles.badge, trade.direction === 'long' ? styles.longBg : styles.shortBg]}>
                        <Text style={[styles.badgeText, trade.direction === 'long' ? styles.longColor : styles.shortColor]}>
                            {trade.direction === 'long' ? '▲ ЛОНГ' : '▼ ШОРТ'}
                        </Text>
                    </View>
                    <View style={styles.badge}>
                        <Text style={styles.badgeGray}>{trade.market === 'spot' ? 'Спот' : 'Фьючерс'}</Text>
                    </View>
                    <View style={[styles.badge, trade.status === 'open' ? styles.openBg : styles.closedBg]}>
                        <Text style={styles.badgeGray}>{trade.status === 'open' ? 'Открыта' : 'Закрыта'}</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>📥 Вход</Text>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Дата входа</Text>
                        <Text style={styles.infoValue}>{trade.entryDate}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Цена входа</Text>
                        <Text style={styles.infoValue}>{trade.entryPrice}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Количество</Text>
                        <Text style={styles.infoValue}>{trade.quantity}</Text>
                    </View>
                    {trade.stopLoss && (
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Стоп-лосс</Text>
                            <Text style={styles.infoValue}>{trade.stopLoss}</Text>
                        </View>
                    )}
                    {trade.takeProfit && (
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Тейк-профит</Text>
                            <Text style={styles.infoValue}>{trade.takeProfit}</Text>
                        </View>
                    )}
                </View>

                {trade.status === 'close' && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>📤 Выход</Text>
                        {trade.exitDate && (
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Дата выхода</Text>
                                <Text style={styles.infoValue}>{trade.exitDate}</Text>
                            </View>
                        )}
                        {trade.exitPrice && (
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Цена выхода</Text>
                                <Text style={styles.infoValue}>{trade.exitPrice}</Text>
                            </View>
                        )}
                    </View>
                )}

                {trade.notes && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>📝 Заметки</Text>
                        <Text style={styles.notesText}>{trade.notes}</Text>
                    </View>
                )}

                {trade.status === 'open' && (
                    <TouchableOpacity style={styles.closeBtn} onPress={()=>setCloseModal(true)} activeOpacity={0.85}>
                        <Text style={styles.closeBtnText}>✅ Закрыть сделку</Text>
                    </TouchableOpacity>
                )}

                <View style={{height:100}} />

            </ScrollView>

            <Modal visible={closeModal} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalBox}>
                        <Text style={styles.modalTitle}>Закрыть {trade.symbol}</Text>

                        <Text style={styles.fieldLabel}>Дата выхода</Text>
                        <TextInput 
                            style={styles.input}
                            value={exitDate}
                            onChangeText={setExitDate}
                            placeholder="DD.MM.YYYY"
                            placeholderTextColor="#BDBDBD"
                        />

                        <Text style={styles.fieldLabel}>Цена выхода *</Text>
                        <TextInput 
                            style={styles.input}
                            value={exitPrice}
                            onChangeText={setExitPrice}
                            placeholder="0.00"
                            placeholderTextColor="#BDBDBD"
                            keyboardType="decimal-pad"
                        />

                        <View style={styles.modalBtns}>
                            <TouchableOpacity style={styles.cancelBtn} onPress={()=>setCloseModal(false)}>
                                <Text style={styles.cancelBtnText}>Отмена</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.confirmBtn} onPress={handleClose}>
                                <Text style={styles.confirmBtnText}>Закрыть</Text>
                            </TouchableOpacity>
                        </View>

                    </View>
                </View>
            </Modal>

        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 14, paddingBottom: 10 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 2 },
  backArrow: { fontSize: 18, color: '#1A1A1A' },
  title: { fontSize: 22, fontWeight: '700', color: '#1A1A1A' },
  deleteBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#FFEBEE', alignItems: 'center', justifyContent: 'center' },
  deleteBtnText: { fontSize: 16 },
  content: { paddingHorizontal: 16 },
  pnlCard: { borderRadius: 16, padding: 20, marginBottom: 16, alignItems: 'center' },
  pnlGreen: { backgroundColor: '#E8F5E9' },
  pnlRed: { backgroundColor: '#FFEBEE' },
  pnlTitle: { fontSize: 13, color: '#757575', marginBottom: 6 },
  pnlValue: { fontSize: 30, fontWeight: '800' },
  green: { color: '#2E7D32' },
  red: { color: '#C62828' },
  badgeRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  badge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: '#F0F0F0' },
  longBg: { backgroundColor: '#E8F5E9' },
  shortBg: { backgroundColor: '#FFEBEE' },
  openBg: { backgroundColor: '#E3F2FD' },
  closedBg: { backgroundColor: '#F5F5F5' },
  badgeText: { fontSize: 13, fontWeight: '700' },
  longColor: { color: '#2E7D32' },
  shortColor: { color: '#C62828' },
  badgeGray: { fontSize: 13, fontWeight: '600', color: '#616161' },
  section: { backgroundColor: '#FFF', borderRadius: 14, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#1A1A1A', marginBottom: 12 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  infoLabel: { fontSize: 14, color: '#9E9E9E' },
  infoValue: { fontSize: 14, fontWeight: '600', color: '#1A1A1A' },
  notesText: { fontSize: 14, color: '#424242', lineHeight: 21 },
  closeBtn: { backgroundColor: '#1E88E5', borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  closeBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center' },
  modalBox: { backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24,borderBottomLeftRadius:24, borderBottomRightRadius:24, padding: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 24 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#1A1A1A', marginBottom: 20 },
  fieldLabel: { fontSize: 12, fontWeight: '600', color: '#757575', marginBottom: 5, textTransform: 'uppercase' },
  input: { backgroundColor: '#F5F5F5', borderRadius: 10, borderWidth: 1, borderColor: '#E0E0E0', paddingHorizontal: 14, paddingVertical: Platform.OS === 'ios' ? 12 : 8, fontSize: 15, color: '#1A1A1A', marginBottom: 16 },
  modalBtns: { flexDirection: 'row', gap: 12 },
  cancelBtn: { flex: 1, backgroundColor: '#F5F5F5', borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  cancelBtnText: { fontSize: 15, fontWeight: '600', color: '#616161' },
  confirmBtn: { flex: 1, backgroundColor: '#2E7D32', borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  confirmBtnText: { fontSize: 15, fontWeight: '700', color: '#FFF' },
});