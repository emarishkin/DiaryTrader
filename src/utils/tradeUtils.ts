import { Trade } from '../types';

export const generateId = ():string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9)
}

export const calculateProfit = (trade:Trade):number => {
    if(!trade.exitPrice) return 0 
    const qty = trade.quantity * (trade.contractSize ?? 1)
    return trade.direction === 'long'
    ? (trade.exitPrice - trade.entryPrice) * qty
    : (trade.entryPrice - trade.exitPrice) * qty
}

export const calculateRiskReward = (entryPrice:number,stopLoss:number,takeProfit:number,direction:'long'|'short'):string => {
    let risk:number
    let reward:number
    if(direction === 'long'){
        risk = entryPrice - stopLoss
        reward = takeProfit - entryPrice
    } else {
        risk = stopLoss - entryPrice
        reward = entryPrice - takeProfit
    }
    if(risk <= 0) return '—'
    return (reward/risk).toFixed(2)
}

export const formatMoney = (value:number,currency: string = 'RUB'):string => {
    const symbol = currency === 'RUB' ? '₽': currency === 'USD' ? '$' : currency === 'EUR' ? '€': currency
    const abs = Math.abs(value).toLocaleString('ru-RU',{
        minimumFractionDigits:1,
        maximumFractionDigits:1
    })
    return value >= 0 ? `+${abs} ${symbol}` : `-${abs} ${symbol}`;
}

export const todayString = ():string => {
    const d = new Date()
    const day = String(d.getDate()).padStart(2, '0')
    const month = String(d.getMonth()+1).padStart(2, '0')
    const year = d.getFullYear()
    return `${day}.${month}.${year}`
}