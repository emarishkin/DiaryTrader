import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context"
import { StorageService } from "../storage/storage";

export const SettingsScreen = () => {

    const [tradesCount, setTradesCount] = useState(0)
    const [strategiesCount, setStrategiesCount] = useState(0)

    useFocusEffect(useCallback(()=>{
        StorageService.getTrades().then(t=>setTradesCount(t.length))
        StorageService.getStrategies().then(t => setStrategiesCount(t.length))
    },[]))
    
    const handleClearData = () => {
        Alert.alert(
            '⚠️ Очистить все данные?', 'Все сделки и стратегии будут удалены безвозвратно',
            [
                {text: 'Отмена',style: 'cancel'},
                {
                    text: 'Удалить все',
                    style: 'destructive',
                    onPress: async () => {
                        const trades = await StorageService.getTrades()
                        for(const t of trades){
                            await StorageService.deleteTrade(t.id)
                        }
                        const strategies = await StorageService.getStrategies()
                        for(const s of strategies){
                            await StorageService.deleteStrategy(s.id)
                        }
                        setTradesCount(0),
                        setStrategiesCount(0),
                        Alert.alert('✅ Готово', 'Все данные удалены')
                    }
                }
            ]
        )
    }

    return (
        <SafeAreaView style={styles.root}>
            <Text style={styles.title}>Настройки ⚙️</Text>
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>📊 Данные приложения</Text>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Сделок сохранено</Text>
                        <Text style={styles.infoValue}>{tradesCount}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Стратегий сохранено</Text>
                        <Text style={styles.infoValue}>{strategiesCount}</Text>
                    </View>
                </View>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>📱 О приложении</Text>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Название</Text>
                        <Text style={styles.infoValue}>TraderDiary</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Версия</Text>
                        <Text style={styles.infoValue}>1.0.0</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Разработчик</Text>
                        <Text style={styles.infoValue}>Маришкин Е.Е.</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>ВКР</Text>
                        <Text style={styles.infoValue}>СамГТУ 2026</Text>
                    </View>
                </View>
                <View style={[styles.section,styles.dangerSection]}>
                    <Text style={styles.sectionTitle}>⚠️ Опасная зона</Text>
                    <Text style={styles.dangerHint}>Удаление данных невозможно отменить</Text>
                    <TouchableOpacity style={styles.dangerBtn} onPress={handleClearData} activeOpacity={0.85}>
                        <Text style={styles.dangerBtnText}>🗑 Удалить все данные</Text>
                    </TouchableOpacity>
                </View>
                
                <View style={{ height: 100 }} />
            </ScrollView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#1d1d29' },
  content: { paddingHorizontal: 16 },
  title: {
    paddingHorizontal: 16,
    fontSize: 26, fontWeight: '700',
    color: '#FFFFFF', paddingTop: 18, paddingBottom: 16,
  },
  section: {
    backgroundColor: '#1A1A24',
    borderRadius: 16, padding: 16,
    marginBottom: 14, borderWidth: 1,
    borderColor: '#2A2A38',
  },
  dangerSection: {
    borderColor: '#5E1B1B',
    backgroundColor: '#2E0D0D',
  },
  sectionTitle: {
    fontSize: 14, fontWeight: '700',
    color: '#FFFFFF', marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#13131C',
  },
  infoLabel: { fontSize: 14, color: '#555577' },
  infoValue: { fontSize: 14, fontWeight: '600', color: '#FFFFFF' },
  dangerHint: {
    fontSize: 13, color: '#F44336',
    marginBottom: 14, lineHeight: 18,
  },
  dangerBtn: {
    backgroundColor: '#5E1B1B',
    borderRadius: 12, paddingVertical: 14,
    alignItems: 'center', borderWidth: 1,
    borderColor: '#C62828',
  },
  dangerBtnText: {
    color: '#F44336', fontSize: 15, fontWeight: '700',
  },
});