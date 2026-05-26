'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { formatCurrency, formatDateTime } from '@/lib/format'
import { ArrowDownLeft, ArrowUpRight, Filter, Download, Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Transaction } from '@/lib/api'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

// Mock data
const mockTransactions: Transaction[] = [
  {
    id: '1',
    type: 'CASH_IN',
    method: 'PIX',
    amount: 1500.00,
    description: 'Transferência recebida',
    counterparty: 'João Silva',
    date: new Date().toISOString(),
    status: 'COMPLETED',
    transactionCode: 'TXN001234567890',
  },
  {
    id: '2',
    type: 'CASH_OUT',
    method: 'PIX',
    amount: 250.00,
    description: 'Pagamento de conta',
    counterparty: 'Empresa XYZ Ltda',
    date: new Date(Date.now() - 86400000).toISOString(),
    status: 'COMPLETED',
    transactionCode: 'TXN001234567891',
  },
  {
    id: '3',
    type: 'CASH_IN',
    method: 'TED',
    amount: 5000.00,
    description: 'Salário',
    counterparty: 'Empresa ABC S.A.',
    date: new Date(Date.now() - 172800000).toISOString(),
    status: 'COMPLETED',
    transactionCode: 'TXN001234567892',
  },
  {
    id: '4',
    type: 'CASH_OUT',
    method: 'BOLETO',
    amount: 890.50,
    description: 'Conta de luz',
    counterparty: 'ENEL SP',
    date: new Date(Date.now() - 259200000).toISOString(),
    status: 'COMPLETED',
    transactionCode: 'TXN001234567893',
  },
  {
    id: '5',
    type: 'CASH_OUT',
    method: 'TED',
    amount: 2500.00,
    description: 'Transferência',
    counterparty: 'Maria Santos',
    date: new Date(Date.now() - 345600000).toISOString(),
    status: 'COMPLETED',
    transactionCode: 'TXN001234567894',
  },
  {
    id: '6',
    type: 'CASH_IN',
    method: 'PIX',
    amount: 320.00,
    description: 'Reembolso',
    counterparty: 'Pedro Oliveira',
    date: new Date(Date.now() - 432000000).toISOString(),
    status: 'COMPLETED',
    transactionCode: 'TXN001234567895',
  },
]

export default function StatementPage() {
  const [transactions] = useState<Transaction[]>(mockTransactions)
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'CASH_IN' | 'CASH_OUT'>('ALL')
  const [methodFilter, setMethodFilter] = useState<'ALL' | 'PIX' | 'TED' | 'BOLETO'>('ALL')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const filteredTransactions = transactions.filter((t) => {
    if (typeFilter !== 'ALL' && t.type !== typeFilter) return false
    if (methodFilter !== 'ALL' && t.method !== methodFilter) return false
    if (searchTerm && !t.description.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !t.counterparty.toLowerCase().includes(searchTerm.toLowerCase())) return false
    if (startDate && new Date(t.date) < new Date(startDate)) return false
    if (endDate && new Date(t.date) > new Date(endDate + 'T23:59:59')) return false
    return true
  })

  const totalIn = filteredTransactions
    .filter(t => t.type === 'CASH_IN')
    .reduce((sum, t) => sum + t.amount, 0)
  
  const totalOut = filteredTransactions
    .filter(t => t.type === 'CASH_OUT')
    .reduce((sum, t) => sum + t.amount, 0)

  const clearFilters = () => {
    setSearchTerm('')
    setTypeFilter('ALL')
    setMethodFilter('ALL')
    setStartDate('')
    setEndDate('')
  }

  const hasActiveFilters = searchTerm || typeFilter !== 'ALL' || methodFilter !== 'ALL' || startDate || endDate

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Extrato</h1>
          <p className="text-muted-foreground">Histórico de movimentações da sua conta</p>
        </div>
        <Button variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" />
          Exportar
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <ArrowDownLeft className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Entradas</p>
                <p className="text-lg font-bold text-primary">{formatCurrency(totalIn)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                <ArrowUpRight className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Saídas</p>
                <p className="text-lg font-bold text-orange-500">{formatCurrency(totalOut)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
                <span className="text-foreground font-bold">=</span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Saldo do período</p>
                <p className={cn(
                  "text-lg font-bold",
                  totalIn - totalOut >= 0 ? "text-primary" : "text-destructive"
                )}>
                  {formatCurrency(totalIn - totalOut)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por descrição ou favorecido..."
                className="pl-9"
              />
            </div>
            <Button 
              variant={showFilters ? "secondary" : "outline"}
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filtros
              {hasActiveFilters && (
                <span className="ml-2 w-2 h-2 rounded-full bg-primary" />
              )}
            </Button>
          </div>

          {showFilters && (
            <div className="mt-4 pt-4 border-t border-border">
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value as typeof typeFilter)}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                  >
                    <option value="ALL">Todos</option>
                    <option value="CASH_IN">Entradas</option>
                    <option value="CASH_OUT">Saídas</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Método</Label>
                  <select
                    value={methodFilter}
                    onChange={(e) => setMethodFilter(e.target.value as typeof methodFilter)}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                  >
                    <option value="ALL">Todos</option>
                    <option value="PIX">Pix</option>
                    <option value="TED">TED</option>
                    <option value="BOLETO">Boleto</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Data inicial</Label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Data final</Label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="mt-4 text-muted-foreground"
                >
                  <X className="w-4 h-4 mr-2" />
                  Limpar filtros
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transactions List */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">
            Movimentações ({filteredTransactions.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {filteredTransactions.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <p>Nenhuma transação encontrada</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filteredTransactions.map((transaction) => (
                <button
                  key={transaction.id}
                  onClick={() => setSelectedTransaction(transaction)}
                  className="w-full flex items-center gap-4 p-4 hover:bg-accent/50 transition-colors text-left"
                >
                  <div
                    className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0',
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
                    <p className="font-medium text-sm truncate text-foreground">
                      {transaction.description}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {transaction.counterparty} • {transaction.method}
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
                    <p className="text-xs text-muted-foreground">
                      {formatDateTime(transaction.date)}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transaction Detail Modal */}
      <Dialog open={!!selectedTransaction} onOpenChange={() => setSelectedTransaction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalhes da transação</DialogTitle>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-4">
              <div className={cn(
                "p-4 rounded-lg text-center",
                selectedTransaction.type === 'CASH_IN' ? 'bg-primary/10' : 'bg-orange-500/10'
              )}>
                <p className={cn(
                  "text-2xl font-bold",
                  selectedTransaction.type === 'CASH_IN' ? 'text-primary' : 'text-orange-500'
                )}>
                  {selectedTransaction.type === 'CASH_IN' ? '+' : '-'}
                  {formatCurrency(selectedTransaction.amount)}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedTransaction.type === 'CASH_IN' ? 'Recebido' : 'Enviado'}
                </p>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Descrição</span>
                  <span className="font-medium">{selectedTransaction.description}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">
                    {selectedTransaction.type === 'CASH_IN' ? 'De' : 'Para'}
                  </span>
                  <span className="font-medium">{selectedTransaction.counterparty}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Método</span>
                  <span className="font-medium">{selectedTransaction.method}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Data</span>
                  <span className="font-medium">{formatDateTime(selectedTransaction.date)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Status</span>
                  <span className={cn(
                    "font-medium",
                    selectedTransaction.status === 'COMPLETED' ? 'text-primary' : 'text-warning'
                  )}>
                    {selectedTransaction.status === 'COMPLETED' ? 'Concluída' : 'Pendente'}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">Código</span>
                  <span className="font-mono text-xs">{selectedTransaction.transactionCode}</span>
                </div>
              </div>

              <Button variant="outline" className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Baixar comprovante
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
