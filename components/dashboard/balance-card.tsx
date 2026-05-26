'use client'

import { useAuthStore } from '@/lib/store'
import { formatCurrency, formatAccountNumber } from '@/lib/format'
import { Card, CardContent } from '@/components/ui/card'
import { Eye, EyeOff, Copy, Check, TrendingUp, TrendingDown } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface BalanceCardProps {
  available: number
  pending?: number
  blocked?: number
  showDetails?: boolean
}

export function BalanceCard({ available, pending = 0, blocked = 0, showDetails = true }: BalanceCardProps) {
  const { bankAccount } = useAuthStore()
  const [visible, setVisible] = useState(true)
  const [copied, setCopied] = useState(false)

  const total = available + pending

  const copyAccountInfo = () => {
    if (bankAccount) {
      navigator.clipboard.writeText(`Ag: ${bankAccount.branch} Cc: ${bankAccount.accountNumber}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <Card className="bg-gradient-to-br from-primary/20 via-card to-card border-primary/20 overflow-hidden relative">
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-32 translate-x-32" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/5 rounded-full translate-y-24 -translate-x-24" />
      
      <CardContent className="p-6 relative">
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Saldo disponível</p>
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-bold text-foreground">
                {visible ? formatCurrency(available) : 'R$ ••••••'}
              </h2>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setVisible(!visible)}
              >
                {visible ? (
                  <EyeOff className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <Eye className="w-4 h-4 text-muted-foreground" />
                )}
              </Button>
            </div>
          </div>
          
          {bankAccount?.status === 'APPROVED' && (
            <div className="px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-medium">
              Conta Ativa
            </div>
          )}
        </div>

        {showDetails && (
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-3 rounded-lg bg-background/50">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <TrendingUp className="w-4 h-4 text-primary" />
                <span className="text-xs">Pendente</span>
              </div>
              <p className="text-sm font-medium">
                {visible ? formatCurrency(pending) : 'R$ ••••'}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-background/50">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <TrendingDown className="w-4 h-4 text-warning" />
                <span className="text-xs">Bloqueado</span>
              </div>
              <p className="text-sm font-medium">
                {visible ? formatCurrency(blocked) : 'R$ ••••'}
              </p>
            </div>
          </div>
        )}

        {bankAccount && (
          <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Dados da conta</p>
              <p className="text-sm font-mono">
                {formatAccountNumber(bankAccount.accountNumber, bankAccount.branch)}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={copyAccountInfo}
            >
              {copied ? (
                <Check className="w-4 h-4 text-primary" />
              ) : (
                <Copy className="w-4 h-4 text-muted-foreground" />
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
