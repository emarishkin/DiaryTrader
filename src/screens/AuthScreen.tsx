import { useState } from "react"
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native"
import { API } from "../storage/api"
import { SafeAreaView } from "react-native-safe-area-context"

interface AuthScreenProps {
  onAuth: () => void
}

export const AuthScreen = ({onAuth}:AuthScreenProps) => {

    const [isLogin,setIsLogin] = useState(true)
    const [email,setEmail] = useState('')
    const [password,setPassword] = useState('')
    const [name,setName] = useState('')
    const [loading,setLoading] = useState(false)

    const handleSubmit = async () => {
        if(!email || !password){
            Alert.alert('Ошибка', 'Введите email и пароль')
            return
        }
        setLoading(true)
        try {
            if(isLogin){
                await API.login(email,password)
            } else {
                if(!name){
                    Alert.alert('Ошибка', 'Введите имя')
                    setLoading(false)
                    return
                }
                await API.register(email,password,name)
            }
            onAuth()
        } catch (error:any) {
            Alert.alert('Ошибка', error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <SafeAreaView style={styles.root}>
            <KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS === 'ios'? 'padding' : undefined}>
                <ScrollView contentContainerStyle={styles.content}>
                    
                    <View style={styles.header}>
                        <Text style={styles.logo}>📒</Text>
                        <Text style={styles.title}>TraderDiary</Text>
                        <Text style={styles.subtitle}>Дневник профессионального трейдера</Text>
                    </View>

                    <View style={styles.card}>
                        <View style={styles.tabRow}>
                            <TouchableOpacity style={[styles.tab, isLogin && styles.tabActive]} onPress={()=>setIsLogin(true)}>
                                <Text style={[styles.tabText, isLogin && styles.tabTextActive]}>Вход</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.tab, !isLogin && styles.tabActive]} onPress={()=>setIsLogin(false)}>
                                <Text style={[styles.tabText, !isLogin && styles.tabTextActive]}>Регистрация</Text>
                            </TouchableOpacity>
                        </View>

                        {!isLogin && (
                            <>
                                <Text style={styles.label}>Имя</Text>
                                <TextInput
                                    style={styles.input}
                                    value={name}
                                    onChangeText={setName}
                                    placeholder="Ваше имя"
                                    placeholderTextColor='#555777'
                                />
                            </>
                        )} 

                        <Text style={styles.label}>Email</Text>
                        <TextInput
                            style={styles.input}
                            value={email}
                            onChangeText={setEmail}
                            placeholder="email@example.com"
                            placeholderTextColor='#555777'
                            keyboardType='email-address'
                            autoCapitalize="none"
                        />

                        <Text style={styles.label}>Пароль</Text>
                        <TextInput
                            style={styles.input}
                            value={password}
                            onChangeText={setPassword}
                            placeholder="••••••••"
                            placeholderTextColor='#555777'
                            secureTextEntry
                        />

                        <TouchableOpacity
                            style={[styles.btn, loading && styles.btnDisabled]}
                            onPress={handleSubmit}
                            disabled={loading}
                            activeOpacity={0.85}
                        > 
                            <Text style={styles.btnText}>
                                {loading ? 'Загрузка...' : isLogin ? 'Войти' : 'Зарегистрироваться'}
                            </Text>
                        </TouchableOpacity>
                     

                    </View>

                    

                    
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#1d1d29' },
  content: { flexGrow: 1, justifyContent: 'center', padding: 16 },
  header: { alignItems: 'center', marginBottom: 32 },
  logo: { fontSize: 64, marginBottom: 12 },
  title: { fontSize: 32, fontWeight: '800', color: '#FFFFFF', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#555577', textAlign: 'center' },
  card: { backgroundColor: '#1A1A24', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#2A2A38' },
  tabRow: { flexDirection: 'row', backgroundColor: '#13131C', borderRadius: 12, padding: 4, marginBottom: 20 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  tabActive: { backgroundColor: '#2979FF' },
  tabText: { fontSize: 14, fontWeight: '600', color: '#555577' },
  tabTextActive: { color: '#FFFFFF' },
  label: { fontSize: 12, fontWeight: '600', color: '#555577', marginBottom: 6, textTransform: 'uppercase' },
  input: { backgroundColor: '#13131C', borderRadius: 10, borderWidth: 1, borderColor: '#2A2A38', paddingHorizontal: 14, paddingVertical: Platform.OS === 'ios' ? 12 : 8, fontSize: 15, color: '#FFFFFF', marginBottom: 14 },
  btn: { backgroundColor: '#2979FF', borderRadius: 12, paddingVertical: 15, alignItems: 'center', marginTop: 4 },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
})