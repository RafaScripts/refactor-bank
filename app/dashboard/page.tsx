'use client'

import { useAuth } from '@/lib/auth-context'
import { BalanceCard } from '@/components/dashboard/balance-card'
import { QuickActions } from '@/components/dashboard/quick-actions'
import { RecentTransactions } from '@/components/dashboard/recent-transactions'
import { CryptoWallets } from '@/components/dashboard/crypto-wallets'
import { Card, CardContent } from '@/components/ui/card'
import { AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import type { Transaction, WalletResponse } from '@/lib/api'

// Mock data for demonstration
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
    transactionCode: 'TXN001',
  },
  {
    id: '2',
    type: 'CASH_OUT',
    method: 'PIX',
    amount: 250.00,
    description: 'Pagamento de conta',
    counterparty: 'Empresa XYZ',
    date: new Date(Date.now() - 86400000).toISOString(),
    status: 'COMPLETED',
    transactionCode: 'TXN002',
  },
  {
    id: '3',
    type: 'CASH_IN',
    method: 'TED',
    amount: 5000.00,
    description: 'Salário',
    counterparty: 'Empresa ABC',
    date: new Date(Date.now() - 172800000).toISOString(),
    status: 'COMPLETED',
    transactionCode: 'TXN003',
  },
  {
    id: '4',
    type: 'CASH_OUT',
    method: 'BOLETO',
    amount: 890.50,
    description: 'Conta de luz',
    counterparty: 'ENEL',
    date: new Date(Date.now() - 259200000).toISOString(),
    status: 'PENDING',
    transactionCode: 'TXN004',
  },
]

const mockWallets: WalletResponse[] = [
  {
    currency: 'Bitcoin',
    symbol: 'BTC',
    balance: 0.00125,
    balanceBRL: 625.00,
  },
  {
    currency: 'Ethereum',
    symbol: 'ETH',
    balance: 0.05,
    balanceBRL: 450.00,
  },
]

export default function DashboardPage() {
  const { user } = useAuth()

  // For now, show the dashboard without bank account validation
  const needsOnboarding = user?.status !== 'APPROVED'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Olá, {user?.name?.split(' ')[0] || 'Usuário'}
        </h1>
        <p className="text-muted-foreground">
          Bem-vindo de volta ao seu banco digital
        </p>
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
      <BalanceCard 
        available={0} 
        pending={0}
        blocked={0}
      />

      {/* Quick Actions */}
      <QuickActions />

      {/* Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentTransactions transactions={mockTransactions} />
        </div>
        <div>
          <CryptoWallets wallets={mockWallets} />
        </div>
      </div>
    </div>
  )
}
