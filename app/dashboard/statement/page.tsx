'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency, formatDateTime } from '@/lib/format'
import { ArrowDownLeft, ArrowUpRight, Filter, Download, Search, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { balanceApi, type Transaction } from '@/lib/api'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { PdfExportButton } from '@/components/ui/pdf-export-button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CryptoStatement } from './CryptoStatement'
import { walletApi } from '@/lib/api'

export default function StatementPage() {
  const { data: session } = useSession()
  const token = session?.user?.accessToken

  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [wallet, setWallet] = useState<any>(null)

  // Filter states
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'CASH_IN' | 'CASH_OUT'>('ALL')
  const [methodFilter, setMethodFilter] = useState<'ALL' | 'PIX' | 'TED' | 'BOLETO'>('ALL')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const fetchStatement = useCallback(async () => {
    if (!token) return
    setLoading(true)
    try {
      const params: Record<string, string> = { page: String(page), limit: '20' }
      if (typeFilter !== 'ALL') params.type = typeFilter
      if (methodFilter !== 'ALL') params.method = methodFilter
      if (startDate) params.startDate = startDate
      if (endDate) params.endDate = endDate

      const response = await balanceApi.getStatement(token, params)
      const mapped: Transaction[] = (response.data || []).map((item: any) => ({
        id: item._id || item.id,
        type: item.transaction?.type || item.type || 'CASH_IN',
        method: item.transaction?.method || item.method || 'PIX',
        amount: (item.amount || 0) / 100,
        description: item.description || '',
        counterparty: item.counterpartyName || item.counterparty || '',
        date: item.createdAt || item.date,
        status: item.transaction?.status || item.status || 'APPROVED',
        transactionCode: item.transaction?.externalId || item.externalId || item.transactionCode || '',
      }))
      setTransactions(mapped)
      setTotal(response.meta?.total || 0)
      setTotalPages(response.meta?.lastPage || 1)
      
      try {
        const walletRes = await balanceApi.getWallets(token)
        setWallet(walletRes)
      } catch (err) {
        // user might not have a wallet yet, ignore
      }
    } catch (err) {
      console.error('Erro ao carregar extrato:', err)
    } finally {
      setLoading(false)
    }
  }, [token, page, typeFilter, methodFilter, startDate, endDate])

  useEffect(() => {
    fetchStatement()
  }, [fetchStatement])

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

  // Build HTML string for the full statement PDF export
  const buildStatementHtml = () => {
    const rows = filteredTransactions.map(t => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${formatDateTime(t.date)}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${t.description}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${t.counterparty}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right; color: ${t.type === 'CASH_IN' ? 'green' : 'red'};">
          ${t.type === 'CASH_IN' ? '+' : '-'}${formatCurrency(t.amount)}
        </td>
      </tr>
    `).join('')

    return `
      <div style="font-family: sans-serif; padding: 20px; color: #333;">
        <h2 style="margin-bottom: 5px;">Extrato da Conta</h2>
        <p style="margin-top: 0; color: #666; font-size: 14px;">Resumo das movimentações financeiras</p>
        <hr style="margin-bottom: 20px; border: 0; border-top: 1px solid #eee;" />
        <div style="display: flex; justify-content: space-between; margin-bottom: 20px; font-size: 14px;">
          <div><strong>Entradas:</strong> ${formatCurrency(totalIn)}</div>
          <div><strong>Saídas:</strong> ${formatCurrency(totalOut)}</div>
          <div><strong>Saldo Período:</strong> ${formatCurrency(totalIn - totalOut)}</div>
        </div>
        <table style="width: 100%; border-collapse: collapse; font-size: 12px; text-align: left;">
          <thead>
            <tr style="background-color: #f9fafb;">
              <th style="padding: 10px 8px; border-bottom: 2px solid #ddd;">Data</th>
              <th style="padding: 10px 8px; border-bottom: 2px solid #ddd;">Descrição</th>
              <th style="padding: 10px 8px; border-bottom: 2px solid #ddd;">Favorecido/Origem</th>
              <th style="padding: 10px 8px; border-bottom: 2px solid #ddd; text-align: right;">Valor</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      </div>
    `
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Extrato</h1>
          <p className="text-muted-foreground">Histórico de movimentações da sua conta</p>
        </div>
        <PdfExportButton 
          htmlContent={buildStatementHtml()} 
          filename={`extrato-${new Date().toISOString().split('T')[0]}.pdf`} 
          buttonText="Exportar"
          variant="outline"
          size="sm"
        />
      </div>

      <Tabs defaultValue="BRL" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="BRL">Extrato BRL</TabsTrigger>
          {(wallet?.address || parseFloat(wallet?.balances?.USDT || wallet?.balances?.get?.('USDT') || '0') > 0 || true) && (
            <TabsTrigger value="USDT">Extrato USDT</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="USDT" className="mt-6">
          <CryptoStatement token={token!} wallet={wallet} setWallet={setWallet} />
        </TabsContent>

        <TabsContent value="BRL" className="mt-6 space-y-6">
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
            Movimentações ({loading ? '...' : total})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <p>Nenhuma transação encontrada</p>
            </div>
          ) : (
            <>
              <div className="divide-y divide-border">
                {filteredTransactions.map((transaction) => (
                  <button
                    key={transaction.id}
                    onClick={() => setSelectedTransaction(transaction)}
                    className="w-full flex items-center gap-4 p-4 hover:bg-accent/50 transition-colors text-left"
                  >
                    <div
                      className={cn(
                        'w-10 h-10 rounded-full flex items-center justify-center shrink-0',
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
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between p-4 border-t border-border">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page <= 1}
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" /> Anterior
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Página {page} de {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                  >
                    Próxima <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
      </TabsContent>
      </Tabs>

      {/* Transaction Detail Modal */}
      <Dialog open={!!selectedTransaction} onOpenChange={() => setSelectedTransaction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalhes da transação</DialogTitle>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-4">
              <div id="receipt-content" className="bg-background p-4 rounded-lg">
                <div className={cn(
                  "p-4 rounded-lg text-center mb-4",
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
                    selectedTransaction.status === 'APPROVED' ? 'text-primary' : 'text-warning'
                  )}>
                    {selectedTransaction.status === 'APPROVED' ? 'Concluída' : 'Pendente'}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">Código</span>
                  <span className="font-mono text-xs">{selectedTransaction.transactionCode}</span>
                </div>
              </div>

              <PdfExportButton 
                targetId="receipt-content" 
                filename={`comprovante-${selectedTransaction.transactionCode || 'transacao'}.pdf`}
                buttonText="Baixar comprovante"
                variant="outline"
                className="w-full"
              />
            </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
