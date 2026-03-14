export interface Trade {
    id:string
    market:'spot'|'futures'
    direction:'long'|'short'
    symbol:string
    quantuty:number
    contractSize?:number
    entryDate:number
    entryPrice:number
    stopLoss?:number
    takeProfit?:number
    currency:string
    exitDate?:number
    exitPrice?:number
    setupName?:string
    notes?:string
    status:'open'|'close'
    profit?:number
    createdAt:string
}

export interface Strategy {
    id:string
    name:string
    description:string
    rules:string
    timeframe:string
    market:string
    createdAt:string
}