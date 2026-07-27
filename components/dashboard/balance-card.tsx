'use client'

import { formatCurrency } from '@/lib/format'
import { Card, CardContent } from '@/components/ui/card'
import { Eye, EyeOff, TrendingUp, TrendingDown } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface BalanceCardProps {
  available: number
  pending?: number
  blocked?: number
  showDetails?: boolean
}

export function BalanceCard({ available, pending = 0, blocked = 0, showDetails = true }: BalanceCardProps) {
  const [visible, setVisible] = useState(true)

  return (
    <Card className="bg-card border-border overflow-hidden relative border-l-4 border-l-success">
      
      <CardContent className="p-6 relative">
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Saldo disponível</p>
            <div className="flex items-center gap-3">
              <h2 className="text-4xl font-bold tracking-tight text-foreground font-mono">
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
        </div>

        {showDetails && (
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-lg bg-background/50">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <TrendingUp className="w-4 h-4 text-success" />
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
      </CardContent>
    </Card>
  )
}
