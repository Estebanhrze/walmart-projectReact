export type SalesRecord = {
  transaction_id: number
  product_name: string
  category: string
  quantity_sold: number
  unit_price: number
  transaction_date: string
  store_id: number
  store_location: string
  inventory_level: number
  customer_gender: 'Female' | 'Male' | 'Other'
  customer_loyalty_level: 'Bronze' | 'Silver' | 'Gold' | 'Platinum'
  payment_method: 'Cash' | 'Credit Card' | 'Digital Wallet'
  promotion_applied: boolean
  weekday: string
  stockout_indicator: boolean
  forecasted_demand: number
  actual_demand: number
}
