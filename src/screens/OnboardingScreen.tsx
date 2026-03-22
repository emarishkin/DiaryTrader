import { useState } from "react"
import { Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import Onboarding from "react-native-onboarding-swiper"

export const OnboardingScreen = ({navigation}:any) => {

    const [currentPage,setCurrentPage] = useState(0)

    const HiddenButton = () => null

    const goToMain = () => navigation.replace('Main')

    return (
        <View style={styles.root}>
            <Onboarding 
                onSkip={goToMain}
                onDone={goToMain}
                SkipButtonComponent={HiddenButton}
                NextButtonComponent={HiddenButton}
                DoneButtonComponent={HiddenButton}
                bottomBarColor="transparent"
                bottomBarHighlight={false}
                showPagination={true}
                pageIndexCallback={(index:number)=> setCurrentPage(index)}
                DotComponent={({selected}: any)=>(
                    <View style={[styles.dot, selected && styles.dotActive]} />
                )}
                containerStyles={styles.container}
                titleStyles={styles.hidden}
                subTitleStyles={styles.hidden}
                pages={[
                    {
                        backgroundColor:'#1E88E5',
                        image:(
                            <View style={styles.page}>
                                <Text style={styles.pageTitle}>Добро пожаловать в{'\n'}
                                    <Text style={styles.pageTitleBig}>
                                        TraderDiary
                                    </Text>
                                </Text>
                                <Text style={styles.pageEmoji}>📒</Text>
                                <Text style={styles.pageText}>
                                    Твой личный дневник трейдера для анализа сделок и роста прибыли
                                </Text>
                            </View>
                        ),
                        title:'',
                        subtitle:'',
                    },
                    {
                        backgroundColor: '#2E7D32',
                        image: (
                            <View style={styles.page}>
                                <Text style={styles.pageTitle}>
                                    Записывай{'\n'}
                                    <Text style={styles.pageTitleBig}>сделки</Text>
                                </Text>
                                <Text style={styles.pageEmoji}>📈</Text>
                                <Text style={styles.pageText}>
                                    Фиксируй входы и выходы, стоп-лоссы и тейк-профиты. Автоматический расчёт P&L и риск/прибыль
                                </Text>
                            </View>
                        ),
                        title: '',
                        subtitle: '',
                    },
                    {
                        backgroundColor: '#F59E0B',
                        image: (
                            <View style={styles.page}>
                                <Text style={styles.pageTitle}>
                                    Анализируй{'\n'}
                                    <Text style={styles.pageTitleBig}>статистику</Text>
                                </Text>
                                <Text style={styles.pageEmoji}>📊</Text>
                                <Text style={styles.pageText}>
                                    Винрейт, профит-фактор, лучшие и худшие сделки. Всё для улучшения торговли
                                </Text>
                            </View>
                        ),
                        title: '',
                        subtitle: '',
                    },
                    {
                        backgroundColor: '#6C3483',
                        image: (
                            <View style={styles.page}>
                                <Text style={styles.pageTitle}>
                                    Строй{'\n'}
                                    <Text style={styles.pageTitleBig}>стратегии</Text>
                                </Text>
                                <Text style={styles.pageEmoji}>🧠</Text>
                                <Text style={styles.pageText}>
                                    Сохраняй торговые стратегии и применяй их при добавлении сделок
                                </Text>
                            </View>
                        ),
                        title: '',
                        subtitle: '',
                    },
                ]}
            />

            <TouchableOpacity style={styles.skipBtn} onPress={goToMain}>
                <Text style={styles.skipBtnText}>Пропустить</Text>
            </TouchableOpacity>

            {currentPage === 3 && (
                <TouchableOpacity style={styles.startBtn} onPress={goToMain}>
                    <Text style={[styles.startBtnText,{color:'#6C3483'}]}>Начнём! 🚀</Text>
                </TouchableOpacity>
            )}

        </View>
    )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  container: {
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
  },
  hidden: {
    height: 0,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
    marginHorizontal: 3,
  },
  dotActive: {
    width: 25,
    backgroundColor: 'white',
  },
  page: {
    alignItems: 'center',
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 72,
  },
  pageTitleBig: {
    fontSize: 56,
  },
  pageEmoji: {
    fontSize: 90,
    marginBottom: 40,
  },
  pageText: {
    fontSize: 20,
    color: 'white',
    textAlign: 'center',
    lineHeight: 28,
    paddingHorizontal: 30,
  },
  skipBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 40,
    right: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    zIndex: 100,
  },
  skipBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  startBtn: {
    position: 'absolute',
    bottom: 50,
    left: 30,
    right: 30,
    backgroundColor: 'white',
    paddingVertical: 18,
    borderRadius: 25,
    alignItems: 'center',
    zIndex: 100,
  },
  startBtnText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});