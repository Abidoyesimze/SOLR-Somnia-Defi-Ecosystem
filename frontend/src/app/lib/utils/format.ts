export const formatNumber = (value: number, decimals: number = 2): string => {
  if (value === 0) return '0'
  
  if (value < 0.01 && value > 0) {
    return value.toExponential(2)
  }
  
  if (value >= 1000000) {
    return (value / 1000000).toFixed(decimals) + 'M'
  }
  
  if (value >= 1000) {
    return (value / 1000).toFixed(decimals) + 'K'
  }
  
  return value.toFixed(decimals)
}

export const formatCurrency = (value: number, currency: string = 'USD', decimals: number = 2): string => {
  if (value === 0) return `$${currency === 'USD' ? '0' : '0'}`
  
  if (value < 0.01 && value > 0) {
    return `$${value.toExponential(2)}`
  }
  
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(decimals)}M`
  }
  
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(decimals)}K`
  }
  
  return `$${value.toFixed(decimals)}`
}

export const formatPercentage = (value: number, decimals: number = 2): string => {
  return `${value.toFixed(decimals)}%`
}

export const shortenAddress = (address: string, chars: number = 4): string => {
  if (!address) return ''
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`
}

export const formatTokenAmount = (amount: string, decimals: number = 18): string => {
  const num = parseFloat(amount) / Math.pow(10, decimals)
  return formatNumber(num, 6)
}

export const parseTokenAmount = (amount: string, decimals: number = 18): string => {
  const num = parseFloat(amount) * Math.pow(10, decimals)
  return num.toString()
} 