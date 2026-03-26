import AsyncStorage from "@react-native-async-storage/async-storage"
import { Strategy, Trade } from "../types";
import { act } from "react";

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
    },

    async deleteTrade(id:string):Promise<void>{
        const trades = await this.getTrades()
        await AsyncStorage.setItem(
            TRADES_KEY,
            JSON.stringify(trades.filter(t => t.id !== id))
        )
    },

    async getStrategies(): Promise<Strategy[]>{
        try{
            const row = await AsyncStorage.getItem(STRATEGIES_KEY)
            return row? JSON.parse(row): []
        } catch {
            return []
        }
    },

    async saveStrategy(strategy:Strategy): Promise<void>{
        const strategies = await this.getStrategies()
        const idx = strategies.findIndex(s => s.id === strategy.id)
        if(idx >= 0) strategies[idx] = strategy
        else strategies.unshift(strategy)
        await AsyncStorage.setItem(STRATEGIES_KEY, JSON.stringify(strategies))
    },

    async deleteStrategy(id:string):Promise<void> {
        const strategies = await this.getStrategies()
        await AsyncStorage.setItem(
            STRATEGIES_KEY,
            JSON.stringify(strategies.filter(s => s.id !== id))
        )
    },

    async initDefaultStrategies():Promise<void> {
        const existing = await this.getStrategies()
        if(existing.length === 0){
            const {DEFAULT_STRATEGIES} = await import('../storage/defaultStrategies')
            for( const strategy of DEFAULT_STRATEGIES){
                await this.saveStrategy(strategy)
            }
        }
    }
}