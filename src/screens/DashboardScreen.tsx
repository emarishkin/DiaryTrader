import React from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TextInput, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const DashboardScreen = () => {
    return(
        <SafeAreaView>
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator>
                
                <View style={styles.header}>
                    <View>
                        <Text style={styles.greeting}>Дневник трейдера 📒</Text>
                        <Text style={styles.title}>Главная страница</Text>
                    </View>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>M</Text>
                    </View>
                </View>

                <View style={styles.searchBox}>
                    <Text style={styles.searchIcon}>🔍</Text>
                    <TextInput
                        style={styles.searchInput}
                        placeholder='Поиск открытых сделок...'
                        placeholderTextColor="#BDBDBD"
                    />
                </View>

                <View style={styles.statsRow}>
                    <View style={styles.statCard}>
                        <Text style={styles.statVal}>0</Text>
                        <Text style={styles.statLabel}>Открытых</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statVal}>0</Text>
                        <Text style={styles.statLabel}>Всего сделок</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statVal}>0</Text>
                        <Text style={styles.statLabel}>Чистый P&L</Text>
                    </View>
                </View>

                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Открытые сделки</Text>
                    <Text style={styles.sectionCount}>0</Text>
                </View>

                <View style={styles.emptyBox}>
                    <Text style={styles.emptyIcon}>📭</Text>
                    <Text style={styles.emptyTitle}>Нет открытых сделок</Text>
                    <Text style={styles.emptyHint}>Добавьте первую сделку через вкладку +</Text>
                </View>

                <TouchableOpacity style={styles.historyBtn} activeOpacity={0.8}>
                    <Text style={styles.historyBtnLeft}>📋  История сделок</Text>
                    <Text style={styles.historyBtnRight}>0 сделок  →</Text>
                </TouchableOpacity>
                
                <View style={{ height: 100 }} />

            </ScrollView>
        </SafeAreaView>
    )
  }

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  content: {
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 18,
    paddingBottom: 14,
  },
  greeting: {
    fontSize: 13,
    color: '#757575',
    marginBottom: 2,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1E88E5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 16,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 11,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    fontSize: 15,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1A1A1A',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  statVal: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 3,
  },
  statLabel: {
    fontSize: 10,
    color: '#9E9E9E',
    textAlign: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  sectionCount: {
    fontSize: 13,
    color: '#9E9E9E',
  },
  emptyBox: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 32,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyIcon: {
    fontSize: 36,
    marginBottom: 10,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 6,
  },
  emptyHint: {
    fontSize: 13,
    color: '#9E9E9E',
    textAlign: 'center',
  },
  historyBtn: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E3F2FD',
  },
  historyBtnLeft: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  historyBtnRight: {
    fontSize: 13,
    color: '#1E88E5',
    fontWeight: '500',
  },
});

export default DashboardScreen
