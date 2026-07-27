'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { BalanceCard } from '@/components/dashboard/balance-card'
import { QuickActions } from '@/components/dashboard/quick-actions'
import { RecentTransactions } from '@/components/dashboard/recent-transactions'
import { CryptoWallets } from '@/components/dashboard/crypto-wallets'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { balanceApi, type Transaction } from '@/lib/api'

interface DashboardBalance {
  available: number
  pending: number
  blocked: number
  total: number
  currency: string
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const user = session?.user
  const token = user?.accessToken

  const [balance, setBalance] = useState<DashboardBalance | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [wallets, setWallets] = useState<{ currency: string; symbol: string; balance: number; balanceBRL: number }[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const needsOnboarding = user?.status !== 'APPROVED'

  useEffect(() => {
    if (!token) return

    const fetchData = async () => {
      setLoading(true)
      setError('')
      try {
        const [balanceData, statementData, walletsData] = await Promise.all([
          balanceApi.getBalance(token),
          balanceApi.getStatement(token, { limit: '5' }),
          balanceApi.getWallets(token),
        ])
        // Balance: backend returns { fiat: { currency, balance (cents) }, crypto: {} }
        setBalance({
          available: (balanceData.fiat?.balance || 0) / 100,
          pending: 0,
          blocked: 0,
          total: (balanceData.fiat?.balance || 0) / 100,
          currency: balanceData.fiat?.currency || 'BRL',
        })
        // Statement: backend returns { data: [], meta: { total, page, lastPage } }
        const statementArray = statementData.data || []
        const mappedTransactions: Transaction[] = statementArray.map((item: any) => ({
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
        setTransactions(mappedTransactions)
        // Wallet: backend returns { owner, balances: Map }
        const cryptoWallets: { currency: string; symbol: string; balance: number; balanceBRL: number }[] = []
        if (walletsData.balances) {
          const balances = walletsData.balances instanceof Map 
            ? Object.fromEntries(walletsData.balances) 
            : walletsData.balances
          for (const [symbol, balance] of Object.entries(balances)) {
            if (symbol !== 'BRL' && parseFloat(balance as string) > 0) {
              cryptoWallets.push({
                currency: symbol === 'BTC' ? 'Bitcoin' : symbol === 'ETH' ? 'Ethereum' : symbol,
                symbol,
                balance: parseFloat(balance as string),
                balanceBRL: 0, // Will be calculated with quote
              })
            }
          }
        }
        setWallets(cryptoWallets)
      } catch (err) {
        console.error('Erro ao carregar dashboard:', err)
        setError('Não foi possível carregar os dados. Tente novamente.')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [token])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Olá, {user?.name?.split(' ')[0] || 'Usuário'}
          </h1>
          <p className="text-muted-foreground">
            Bem-vindo de volta ao seu banco digital
          </p>
        </div>
        <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground bg-accent/50 px-3 py-1.5 rounded-md border border-border">
          <span>Ações rápidas:</span>
          <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            <span className="text-xs">⌘</span>K
          </kbd>
        </div>
      </div>

      {/* Onboarding Alert */}
      {needsOnboarding && (
        <Card className="border-warning/50 bg-warning/5">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-warning/20 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-warning" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-foreground">Complete seu cadastro</p>
              <p className="text-sm text-muted-foreground">
                {user?.status === 'PENDING_REVIEW'
                  ? 'Seus documentos estão em análise. Aguarde a aprovação.'
                  : 'Envie seus documentos para liberar todas as funcionalidades da conta.'}
              </p>
            </div>
            {user?.status !== 'PENDING_REVIEW' && (
              <Link href="/dashboard/onboarding">
                <Button size="sm">Completar</Button>
              </Link>
            )}
          </CardContent>
        </Card>
      )}

      {/* Balance */}
      {loading ? (
        <Skeleton className="h-40 w-full" />
      ) : (
        <BalanceCard
          available={balance?.available || 0}
          pending={balance?.pending || 0}
          blocked={balance?.blocked || 0}
        />
      )}

      {/* Quick Actions */}
      <QuickActions />

      {/* Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {loading ? (
            <Skeleton className="h-80 w-full" />
          ) : (
            <RecentTransactions transactions={transactions} />
          )}
        </div>
        <div>
          {loading ? (
            <Skeleton className="h-80 w-full" />
          ) : (
            <CryptoWallets wallets={wallets} />
          )}
        </div>
      </div>
    </div>
  )
}
