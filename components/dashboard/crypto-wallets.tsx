'use client'

import { formatCurrency, formatCrypto } from '@/lib/format'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Bitcoin, Coins } from 'lucide-react'
import type { WalletResponse } from '@/lib/api'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface CryptoWalletsProps {
  wallets: WalletResponse[]
}

const cryptoIcons: Record<string, typeof Bitcoin> = {
  BTC: Bitcoin,
  ETH: Coins,
}

const cryptoColors: Record<string, string> = {
  BTC: 'bg-orange-500/10 text-orange-500',
  ETH: 'bg-blue-500/10 text-blue-500',
}

export function CryptoWallets({ wallets }: CryptoWalletsProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold">Criptomoedas</CardTitle>
        <Link href="/dashboard/crypto">
          <Button variant="ghost" size="sm" className="text-primary">
            Negociar
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {wallets.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            <p>Você ainda não possui criptomoedas</p>
            <Link href="/dashboard/crypto">
              <Button variant="link" className="text-primary mt-2">
                Comprar agora
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {wallets.map((wallet) => {
              const Icon = cryptoIcons[wallet.symbol] || Coins
              const colorClass = cryptoColors[wallet.symbol] || 'bg-muted text-muted-foreground'
              
              return (
                <div
                  key={wallet.currency}
                  className="flex items-center gap-4 p-3 rounded-lg bg-accent/50"
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${colorClass}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{wallet.currency}</p>
                    <p className="text-xs text-muted-foreground font-mono">
                      {formatCrypto(wallet.balance, wallet.symbol)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm">
                      {formatCurrency(wallet.balanceBRL)}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
