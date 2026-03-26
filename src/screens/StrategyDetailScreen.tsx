import { RouteProp, useNavigation, useRoute } from "@react-navigation/native"
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

type RouteP = {
    StrategyDetail:{
        strategy:{
            id:string,
            name:string,
            description:string,
            rules:string,
            timeframe?:string,
            market?:string,
            createAt:string
        }
    }
}

export const StrategyDetailScreen = () => {

    const navigation = useNavigation()
    const route = useRoute<RouteProp<RouteP, 'StrategyDetail'>>()
    const {strategy} = route.params

    const rules = strategy.rules.split('\n').filter(r=>r.trim().length > 0)

    return(
        <SafeAreaView style={styles.root}>
            
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={()=>navigation.goBack()} activeOpacity={0.7}>
                    <Text style={styles.backArrow}>←</Text>
                </TouchableOpacity>
                <Text style={styles.title} numberOfLines={2}>{strategy.name}</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                
                <View style={styles.tagRow}>
                    {strategy.timeframe && (
                        <View style={styles.tag}>
                            <Text style={styles.tagText}>⏱ {strategy.timeframe}</Text>
                        </View>
                    )}
                    {strategy.market && (
                        <View style={styles.tag}>
                            <Text style={styles.tagText}>📊 {strategy.market}</Text>
                        </View>
                    )}
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>📋 Описание стратегии</Text>
                    <Text style={styles.description}>{strategy.description}</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>✅ Правила входа</Text>
                    {rules.map((rule,index)=>(
                        <View style={styles.ruleRow} key={index}>
                            <View style={styles.ruleDot}>
                                <Text style={styles.ruleDotText}>{index + 1}</Text>
                            </View>
                            <Text style={styles.ruleText}>
                                {rule.replace(/^\d+\.\s*/, '')}
                            </Text>
                        </View>
                    ))}
                </View>

                <View style={styles.tipBox}>
                    <Text style={styles.tipIcon}>💡</Text>
                    <Text style={styles.tipText}>Выбирай эту стратегию при добавлении сделки чтобы отслеживать её эффективность в разделе Аналитика</Text>
                </View>
                
                <View style={{ height: 100 }} />

            </ScrollView>

        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#1d1d29' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
    gap: 12,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#1A1A24',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#2A2A38',
  },
  backArrow: { fontSize: 18, color: '#FFFFFF' },
  title: {
    flex: 1, fontSize: 18,
    fontWeight: '700', color: '#FFFFFF',
    lineHeight: 24,
  },
  content: { paddingHorizontal: 16 },
  tagRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: '#1A2A4A',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#2979FF',
  },
  tagText: { fontSize: 12, color: '#2979FF', fontWeight: '600' },
  section: {
    backgroundColor: '#1A1A24',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2A2A38',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: '#AAAACC',
    lineHeight: 22,
  },
  ruleRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  ruleDot: {
    width: 24, height: 24,
    borderRadius: 12,
    backgroundColor: '#2979FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  ruleDotText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  ruleText: {
    flex: 1,
    fontSize: 14,
    color: '#AAAACC',
    lineHeight: 22,
  },
  tipBox: {
    flexDirection: 'row',
    backgroundColor: '#13131C',
    borderRadius: 14,
    padding: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: '#2A2A38',
    alignItems: 'flex-start',
  },
  tipIcon: { fontSize: 20 },
  tipText: {
    flex: 1,
    fontSize: 13,
    color: '#555577',
    lineHeight: 20,
  },
});