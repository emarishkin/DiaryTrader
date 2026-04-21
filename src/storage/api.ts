import AsyncStorage from '@react-native-async-storage/async-storage'

const BASE_URL = 'http://192.168.1.40:3000/api'

class ApiService {

  private async getToken(): Promise<string | null> {
    return await AsyncStorage.getItem('@trader_diary:token')
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const token = await this.getToken()
    
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Ошибка сервера')
    }

    return response.json()
  }

  async register(email: string, password: string, name: string) {
    const data = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    })
    await AsyncStorage.setItem('@trader_diary:token', data.token)
    await AsyncStorage.setItem('@trader_diary:user', JSON.stringify(data.user))
    return data
  }

  async login(email: string, password: string) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    await AsyncStorage.setItem('@trader_diary:token', data.token)
    await AsyncStorage.setItem('@trader_diary:user', JSON.stringify(data.user))
    return data
  }

  async logout() {
    await AsyncStorage.removeItem('@trader_diary:token')
    await AsyncStorage.removeItem('@trader_diary:user')
  }

  async getMe() {
    return this.request('/auth/me')
  }

  async isLoggedIn(): Promise<boolean> {
    const token = await this.getToken()
    return !!token
  }   

  async getTrades() {
    return this.request('/trades')
  }

  async saveTrade(trade: any) {
    if (trade.id) {
      return this.request(`/trades/${trade.id}`, {
        method: 'PUT',
        body: JSON.stringify(trade),
      })
    }
    return this.request('/trades', {
      method: 'POST',
      body: JSON.stringify(trade),
    })
  }

  async deleteTrade(id: string) {
    return this.request(`/trades/${id}`, { method: 'DELETE' })
  }

  async getStrategies() {
    return this.request('/strategies')
  }

  async saveStrategy(strategy: any) {
    return this.request('/strategies', {
      method: 'POST',
      body: JSON.stringify(strategy),
    })
  }

  async deleteStrategy(id: string) {
    return this.request(`/strategies/${id}`, { method: 'DELETE' })
  }

  async getBalance() {
    return this.request('/balance')
  }

  async saveBalance(balance: any) {
    return this.request('/balance', {
      method: 'POST',
      body: JSON.stringify(balance),
    })
  }

  async getTransactions() {
    return this.request('/balance/transactions')
  }

  async saveTransaction(transaction: any) {
    return this.request('/balance/transactions', {
      method: 'POST',
      body: JSON.stringify(transaction),
    })
  }
}

export const API = new ApiService()