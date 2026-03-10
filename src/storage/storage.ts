import AsyncStorage from "@react-native-async-storage/async-storage"
import { Trade } from "../types";

const TRADES_KEY = '@trader_diary:trades';
const STRATEGIES_KEY = '@trader_diary:strategies';

export const StorageService = {
    
    async getTrades():Promise<Trade[]> {
        try {
            const row = await AsyncStorage.getItem(TRADES_KEY)
            return row ? JSON.parse(row) : []
        } catch {
            return [];
        } 
    },

    async getTradeById(id:string):Promise<Trade | null> {
        const trades = await this.getTrades()
        return trades.find(t => t.id === id)?? null
    },

    async saveTrade(trade:Trade):Promise<void>{
        const trades = await this.getTrades()
        const idx = trades.findIndex(t => t.id === trade.id)
        if(idx>=0) trades[idx] = trade
        else trades.unshift(trade)
        await AsyncStorage.setItem(TRADES_KEY,JSON.stringify(trades))
    }
}