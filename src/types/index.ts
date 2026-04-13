export interface Trade {
    id:string
    market:'spot'|'futures'
    direction:'long'|'short'
    symbol:string
    quantity:number
    contractSize?:number
    entryDate:string       
    entryPrice:number
    stopLoss?:number
    takeProfit?:number
    currency:string
    exitDate?:string
    exitPrice?:number
    setupName?:string
    notes?:string
    status:'open'|'close'
    profit?:number
    createdAt:string
    confidence?:'low'|'medium'|'high'
    emotion?:'fear'|'neutral'|'greed'
    followedPlan?:boolean,
    photos?: string[]
}

export interface Strategy {
    id:string
    name:string
    description:string
    rules:string
    timeframe:string
    market:string
    createdAt:string
    photos?:string[]
    localImages?: number[]  
}

export interface Balance {
    id:string
    currency:string
    initialAmount:number
    createdAt:string
}

export interface Transaction {
    id:string
    type:'deposit' | 'withdrawal' | 'trade_profit' | 'trade_loss'
    amount:number
    currency:string
    date:string
    tradeId?:string
    note?:string
    createdAt:string
}