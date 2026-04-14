import { useCallback, useState } from "react";
import { Alert, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context"
import { Balance, Transaction } from "../types";
import { useFocusEffect } from "@react-navigation/native";
import { StorageService } from "../storage/storage";
import { generateId, todayString } from "../utils/tradeUtils";

export const BalanceScreen = () => {

    const [balance,setBalance] = useState<Balance | null>(null)
    const [transactions,setTransactions] = useState<Transaction[]>([])
    const [modalType,setModalType] = useState<'setup' | 'deposit' | 'withdrawal' | null>(null)
    const [amount,setAmount] = useState('')
    const [note,setNote] = useState('')

    useFocusEffect(useCallback(()=>{
        StorageService.getBalance().then(setBalance)
        StorageService.getTransactions().then(setTransactions)
    },[]))

    const currentBalance = transactions.reduce((sum,t)=>{
        if(t.type === 'deposit' || t.type === 'trade_profit') return sum + t.amount
        if(t.type === 'withdrawal' || t.type === 'trade_loss') return sum - t.amount
        return sum
    }, balance?.initialAmount ?? 0)

    const tradePnl = transactions
        .filter(t => t.type === 'trade_profit' || t.type === 'trade_loss')
        .reduce((sum,t)=>{
            return t.type === 'trade_profit' ? sum + t.amount : sum - t.amount
        },0)

    const currencySymbol = balance?.currency === 'RUB' ? '₽': balance?.currency === 'USD' ? '$': balance?.currency === 'EUR' ? '€' : balance?.currency === 'USDT'? 'USDT': balance?.currency ?? 'USDT';

    async function handleSetupBalance(){
        if(!amount || isNaN(parseFloat(amount.replace(',','.')))){
            Alert.alert('Ошибка','Введите корректную сумму')
            return
        }
        const newBalance: Balance = {
            id:generateId(),
            currency:'USDT',
            initialAmount:parseFloat(amount.replace(',','.')),
            createdAt:new Date().toISOString()
        }
        await StorageService.saveBalance(newBalance)
        setBalance(newBalance)
        setAmount('')
        setModalType(null)
    }

    async function handleDeposit() {
        if (!amount || isNaN(parseFloat(amount.replace(',', '.')))) {
            Alert.alert('Ошибка', 'Введите корректную сумму');
            return;
        }
        const transaction:Transaction = {
            id:generateId(),
            type:'deposit',
            amount:parseFloat(amount.replace(',', '.')),
            currency:balance?.currency ?? 'USDT',
            date:todayString(),
            note:note || 'Пополнение счета',
            createdAt:new Date().toISOString()
        }
        await StorageService.saveTransaction(transaction)
        setTransactions(prev => [transaction, ...prev])
        setAmount('')
        setNote('')
        setModalType(null)
    }

    async function handleWithdrawal() {
        if (!amount || isNaN(parseFloat(amount.replace(',', '.')))) {
            Alert.alert('Ошибка', 'Введите корректную сумму');
            return;
        }
        const withdrawAmount = parseFloat(amount.replace(',', '.'))
        if(withdrawAmount > currentBalance){
            Alert.alert('Ошибка', 'Недостаточно средств на счёте')
            return
        }
        const transaction:Transaction = {
            id:generateId(),
            type:'withdrawal',
            amount:withdrawAmount,
            currency:balance?.currency ?? 'USDT',
            date:todayString(),
            note:note || 'Вывод средств',
            createdAt:new Date().toISOString()
        }
        await StorageService.saveTransaction(transaction)
        setTransactions(prev => [transaction, ...prev])
        setAmount('')
        setNote('')
        setModalType(null)
    }

    const getTransactionIcon = (type:Transaction['type']) => {
        switch(type){
            case 'deposit': return '💰'
            case 'withdrawal': return '💸'
            case 'trade_profit': return '📈'
            case 'trade_loss': return '📉'
        }
    }

    const getTransactionLabel = (type:Transaction['type']) => {
        switch(type){
            case 'deposit': return 'Пополнение'
            case 'withdrawal': return 'Вывод'
            case 'trade_profit': return 'Прибыль по сделке'
            case 'trade_loss': return 'Убыток по сделке'
        }
    }

    const isPositive = (type:Transaction['type']) => {
        return type === 'deposit' || type === 'trade_profit'
    } 

    return (
        <SafeAreaView style={styles.root}>
            <Text style={styles.title}>💼 Баланс счета</Text>
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {!balance ? (
                    <View style={styles.setupBox}>
                        <Text style={styles.setupIcon}>💰</Text>
                        <Text style={styles.setupTitle}>Настройте счёт</Text>
                        <Text style={styles.setupHint}>Введите начальный размер депозита чтобы отслеживать кривую капитала</Text>
                        <TouchableOpacity style={styles.setupBtn} onPress={()=>setModalType('setup')} activeOpacity={0.85}>
                            <Text style={styles.setupBtnText}>+ Настроить депозит</Text>
                        </TouchableOpacity>
                    </View>
                ):(
                    <>
                        <View style={styles.balanceCard}>
                            <Text style={styles.balanceLabel}>Текущий баланс</Text>
                            <Text style={styles.balanceValue}>{currentBalance.toLocaleString('ru-RU',{minimumFractionDigits:2})} {currencySymbol}</Text>
                            <View style={styles.balanceRow}>
                                <View style={styles.balanceStat}>
                                    <Text style={styles.balanceStatLabel}>Начальный депозит</Text>
                                    <Text style={styles.balanceStatValue}>
                                        {balance.initialAmount.toLocaleString('ru-RU',{maximumFractionDigits:2})} {currencySymbol}
                                    </Text>
                                </View>
                                <View style={styles.balanceStat}>
                                    <Text style={styles.balanceStatLabel}>P&L от сделок</Text>
                                    <Text style={[styles.balanceStatValue, tradePnl >= 0 ? styles.green : styles.red]}>
                                        {tradePnl >= 0 ? '+' : '-'}{tradePnl.toLocaleString('ru-RU', {minimumFractionDigits:2})} {currencySymbol}
                                    </Text>
                                </View>
                            </View>
                        </View>
                        <View style={styles.btnRow}>
                            <TouchableOpacity style={styles.depositBtn} onPress={()=>setModalType('deposit')} activeOpacity={0.85}>
                                <Text style={styles.depositBtnText}>+ Пополнить</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.withdrawBtn} onPress={()=>setModalType('withdrawal')} activeOpacity={0.85}>
                                <Text style={styles.withdrawBtnText}>- Вывести</Text>
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.sectionTitle}>История движений</Text>
                        {transactions.length === 0 ? (
                            <View style={styles.emptyBox}>
                                <Text style={styles.emptyText}>Нет транзакций</Text>
                                <Text style={styles.emptyHint}>Пополните счёт или закройте сделку</Text>
                            </View>
                        ):(
                            transactions.map(t => (
                                <View style={styles.transactionRow} key={t.id}>
                                    <View style={styles.transactionLeft}>
                                        <Text style={styles.transactionIcon}>{getTransactionIcon(t.type)}</Text>
                                        <View>
                                            <Text style={styles.transactionLabel}>{getTransactionLabel(t.type)}</Text>
                                            {t.note ? <Text style={styles.transactionNote}>{t.note}</Text> : null}
                                            <Text style={styles.transactionDate}>{t.date}</Text>
                                        </View>
                                    </View>
                                    <Text style={[styles.transactionAmount, isPositive(t.type) ? styles.green : styles.red]}>
                                        {isPositive(t.type) ? '+' : '-'}
                                        {t.amount.toLocaleString('ru-RU',{minimumFractionDigits:2})} {currencySymbol}
                                    </Text>
                                </View>
                            ))
                        )}

                    </>
                )}
 
                <View style={{height:100}} />
            </ScrollView>

            <Modal visible={modalType !== null} transparent animationType='slide'>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalBox}>
                        <Text style={styles.modalTitle}>
                            { 
                                modalType === 'setup' ? '💰 Начальный депозит' : 
                                modalType === 'deposit' ? '+ Пополнение счёта' :
                                '- Вывод средств'
                            }
                        </Text>

                        <Text style={styles.fieldLabel}>Cумма *</Text>
                        <TextInput 
                            style={styles.input}
                            value={amount}
                            onChangeText={setAmount}
                            placeholder="0.00"
                            placeholderTextColor='#555577'
                            keyboardType='decimal-pad'
                        />

                        {modalType !== 'setup' && (
                            <>
                                <Text style={styles.fieldLabel}>Примечание</Text>
                                <TextInput 
                                    style={styles.input}
                                    value={note}
                                    onChangeText={setNote}
                                    placeholder="Необязательно..."
                                    placeholderTextColor='#555577'
                                />
                            </>
                        )}

                        <View style={styles.modalBtns}>
                            <TouchableOpacity style={styles.cancelBtn} onPress={()=>{setModalType(null); setAmount(''); setNote('')}}>
                                <Text style={styles.cancelBtnText}>Отмена</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.confirmBtn}
                                onPress={
                                    modalType === 'setup' ? handleSetupBalance : 
                                    modalType === 'deposit' ? handleDeposit : handleWithdrawal
                                }
                            > 
                                <Text style={styles.cancelBtnText}>
                                    {
                                        modalType === 'setup' ? 'Сохранить' :
                                        modalType === 'deposit' ? 'Пополнить' : 'Вывести'
                                    }
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#1d1d29' },
  content: { paddingHorizontal: 16 },
  title: { paddingHorizontal: 16,fontSize: 26, fontWeight: '700', color: '#FFFFFF', paddingTop: 18, paddingBottom: 16 },
  setupBox: { backgroundColor: '#1A1A24', borderRadius: 16, padding: 32, alignItems: 'center', marginTop: 20, borderWidth: 1, borderColor: '#2A2A38' },
  setupIcon: { fontSize: 48, marginBottom: 16 },
  setupTitle: { fontSize: 18, fontWeight: '700', color: '#FFFFFF', marginBottom: 8 },
  setupHint: { fontSize: 14, color: '#555577', textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  setupBtn: { backgroundColor: '#2979FF', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 14 },
  setupBtnText: { color: '#FFF', fontWeight: '700', fontSize: 15 },
  balanceCard: { backgroundColor: '#1A1A24', borderRadius: 16, padding: 20, marginBottom: 14, borderWidth: 1, borderColor: '#2979FF' },
  balanceLabel: { fontSize: 13, color: '#555577', marginBottom: 6 },
  balanceValue: { fontSize: 32, fontWeight: '800', color: '#FFFFFF', marginBottom: 16 },
  balanceRow: { flexDirection: 'row', gap: 16 },
  balanceStat: { flex: 1 },
  balanceStatLabel: { fontSize: 11, color: '#555577', marginBottom: 4 },
  balanceStatValue: { fontSize: 14, fontWeight: '600', color: '#FFFFFF' },
  green: { color: '#4CAF50' },
  red: { color: '#F44336' },
  btnRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  depositBtn: { flex: 1, backgroundColor: '#0D2E1A', borderRadius: 12, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: '#1B5E35' },
  depositBtnText: { color: '#4CAF50', fontWeight: '700', fontSize: 15 },
  withdrawBtn: { flex: 1, backgroundColor: '#2E0D0D', borderRadius: 12, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: '#5E1B1B' },
  withdrawBtnText: { color: '#F44336', fontWeight: '700', fontSize: 15 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: '#FFFFFF', marginBottom: 12 },
  emptyBox: { backgroundColor: '#1A1A24', borderRadius: 14, padding: 24, alignItems: 'center', borderWidth: 1, borderColor: '#2A2A38' },
  emptyText: { fontSize: 15, fontWeight: '600', color: '#FFFFFF', marginBottom: 6 },
  emptyHint: { fontSize: 13, color: '#555577' },
  transactionRow: { backgroundColor: '#1A1A24', borderRadius: 14, padding: 14, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#2A2A38' },
  transactionLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  transactionIcon: { fontSize: 24 },
  transactionLabel: { fontSize: 14, fontWeight: '600', color: '#FFFFFF', marginBottom: 2 },
  transactionNote: { fontSize: 12, color: '#555577', marginBottom: 2 },
  transactionDate: { fontSize: 11, color: '#3A3A50' },
  transactionAmount: { fontSize: 15, fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center' },
  modalBox: { backgroundColor: '#1A1A24', borderTopLeftRadius: 24, borderTopRightRadius: 24,borderBottomRightRadius:24, borderBottomLeftRadius:24, padding: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 24, borderWidth: 1, borderColor: '#2A2A38' },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#FFFFFF', marginBottom: 20 },
  fieldLabel: { fontSize: 12, fontWeight: '600', color: '#555577', marginBottom: 5, textTransform: 'uppercase' },
  input: { backgroundColor: '#13131C', borderRadius: 10, borderWidth: 1, borderColor: '#2A2A38', paddingHorizontal: 14, paddingVertical: Platform.OS === 'ios' ? 12 : 8, fontSize: 15, color: '#FFFFFF', marginBottom: 16 },
  modalBtns: { flexDirection: 'row', gap: 12 },
  cancelBtn: { flex: 1, backgroundColor: '#13131C', borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  cancelBtnText: { fontSize: 15, fontWeight: '600', color: '#FFFFFF' },
  confirmBtn: { flex: 1, backgroundColor: '#2979FF', borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  confirmBtnText: { fontSize: 15, fontWeight: '700', color: '#FFF' },
});