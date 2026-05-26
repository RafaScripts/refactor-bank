'use client'

import { formatCurrency, formatDateTime } from '@/lib/format'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Transaction } from '@/lib/api'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface RecentTransactionsProps {
  transactions: Transaction[]
  limit?: number
}

export function RecentTransactions({ transactions, limit = 5 }: RecentTransactionsProps) {
  const displayTransactions = transactions.slice(0, limit)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold">Movimentações recentes</CardTitle>
        <Link href="/dashboard/statement">
          <Button variant="ghost" size="sm" className="text-primary">
            Ver todas
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="p-0">
        {displayTransactions.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground">
            <p>Nenhuma movimentação ainda</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {displayTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center gap-4 p-4 hover:bg-accent/50 transition-colors"
              >
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center',
                    transaction.type === 'CASH_IN'
                      ? 'bg-primary/10 text-primary'
                      : 'bg-orange-500/10 text-orange-500'
                  )}
                >
                  {transaction.type === 'CASH_IN' ? (
                    <ArrowDownLeft className="w-5 h-5" />
                  ) : (
                    <ArrowUpRight className="w-5 h-5" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">
                    {transaction.description || transaction.counterparty}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {transaction.method} • {formatDateTime(transaction.date)}
                  </p>
                </div>
                
                <div className="text-right">
                  <p
                    className={cn(
                      'font-semibold text-sm',
                      transaction.type === 'CASH_IN' ? 'text-primary' : 'text-foreground'
                    )}
                  >
                    {transaction.type === 'CASH_IN' ? '+' : '-'}
                    {formatCurrency(transaction.amount)}
                  </p>
                  <p
                    className={cn(
                      'text-xs',
                      transaction.status === 'COMPLETED'
                        ? 'text-muted-foreground'
                        : transaction.status === 'PENDING'
                        ? 'text-warning'
                        : 'text-destructive'
                    )}
                  >
                    {transaction.status === 'COMPLETED'
                      ? 'Concluída'
                      : transaction.status === 'PENDING'
                      ? 'Pendente'
                      : 'Falhou'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
