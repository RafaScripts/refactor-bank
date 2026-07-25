import * as React from 'react'
import { Input } from './input'

interface CurrencyInputProps extends Omit<React.ComponentProps<'input'>, 'onChange' | 'value'> {
  value: number | string
  onValueChange: (value: number) => void
}

export function CurrencyInput({ value, onValueChange, ...props }: CurrencyInputProps) {
  const formatCurrency = (val: number | string) => {
    if (!val && val !== 0) return ''
    const num = typeof val === 'string' ? parseFloat(val) : val
    if (isNaN(num)) return ''
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(num).replace('R$\xa0', 'R$ ')
  }

  const [displayValue, setDisplayValue] = React.useState(formatCurrency(value))

  React.useEffect(() => {
    if (value === '' || value === 0) {
      setDisplayValue('')
    } else {
      setDisplayValue(formatCurrency(value))
    }
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value
    // Remove everything that is not a digit
    inputValue = inputValue.replace(/\D/g, '')
    
    if (!inputValue) {
      setDisplayValue('')
      onValueChange(0)
      return
    }

    // Convert to number (divide by 100 to get decimal)
    const numericValue = parseInt(inputValue, 10) / 100
    setDisplayValue(formatCurrency(numericValue))
    onValueChange(numericValue)
  }

  return (
    <Input
      type="text"
      value={displayValue}
      onChange={handleChange}
      placeholder="R$ 0,00"
      {...props}
    />
  )
}
