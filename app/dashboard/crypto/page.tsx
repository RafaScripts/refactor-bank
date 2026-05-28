'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/lib/auth-context'
import { cryptoApi, type WalletResponse } from '@/lib/api'
import { formatCurrency, formatCrypto } from '@/lib/format'
import { Bitcoin, Coins, ArrowUpDown, Send, TrendingUp, TrendingDown, Loader2, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

// Mock wallet data
const mockWallets: WalletResponse[] = [
  { currency: 'Bitcoin', symbol: 'BTC', balance: 0.00125, balanceBRL: 625 },
  { currency: 'Ethereum', symbol: 'ETH', balance: 0.05, balanceBRL: 450 },
]

// Mock price data
const mockPrices = {
  BTC: { price: 500000, change: 2.5 },
  ETH: { price: 9000, change: -1.2 },
}

export default function CryptoPage() {
  const { token } = useAuth()
  const [wallets] = useState<WalletResponse[]>(mockWallets)
  const balance = 0

  // Buy states
  const [buyCurrency, setBuyCurrency] = useState<'BTC' | 'ETH'>('BTC')
  const [buyAmountBRL, setBuyAmountBRL] = useState('')
  const [buyLoading, setBuyLoading] = useState(false)
  const [buyResult, setBuyResult] = useState<{ success: boolean; amount?: number } | null>(null)

  // Sell states
  const [sellCurrency, setSellCurrency] = useState<'BTC' | 'ETH'>('BTC')
  const [sellAmount, setSellAmount] = useState('')
  const [sellLoading, setSellLoading] = useState(false)
  const [sellResult, setSellResult] = useState<{ success: boolean; amountBRL?: number } | null>(null)

  // Transfer states
  const [transferCurrency, setTransferCurrency] = useState<'BTC' | 'ETH'>('BTC')
  const [transferAmount, setTransferAmount] = useState('')
  const [transferEmail, setTransferEmail] = useState('')
  const [transferLoading, setTransferLoading] = useState(false)
  const [transferResult, setTransferResult] = useState<{ success: boolean } | null>(null)

  const selectedWallet = wallets.find(w => w.symbol === sellCurrency) || wallets[0]

  const handleBuy = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return
    
    setBuyLoading(true)
    try {
      const result = await cryptoApi.buy({
        currency: buyCurrency,
        amountBRL: parseFloat(buyAmountBRL),
      }, token)
      setBuyResult({ success: true, amount: result.amount })
    } catch (error) {
      setBuyResult({ success: false })
    } finally {
      setBuyLoading(false)
    }
  }

  const handleSell = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return
    
    setSellLoading(true)
    try {
      const result = await cryptoApi.sell({
        currency: sellCurrency,
        amount: parseFloat(sellAmount),
      }, token)
      setSellResult({ success: true, amountBRL: parseFloat(sellAmount) * mockPrices[sellCurrency].price })
    } catch (error) {
      setSellResult({ success: false })
    } finally {
      setSellLoading(false)
    }
  }

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return
    
    setTransferLoading(true)
    try {
      await cryptoApi.transfer({
        currency: transferCurrency,
        amount: parseFloat(transferAmount),
        recipientEmail: transferEmail,
      }, token)
      setTransferResult({ success: true })
    } catch (error) {
      setTransferResult({ success: false })
    } finally {
      setTransferLoading(false)
    }
  }

  const estimatedCrypto = buyAmountBRL 
    ? parseFloat(buyAmountBRL) / mockPrices[buyCurrency].price 
    : 0

  const totalCryptoValue = wallets.reduce((sum, w) => sum + w.balanceBRL, 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Criptomoedas</h1>
        <p className="text-muted-foreground">Compre, venda e transfira Bitcoin e Ethereum</p>
      </div>

      {/* Wallet Summary */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Card className="sm:col-span-1">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Valor total em cripto</p>
            <p className="text-2xl font-bold text-foreground">{formatCurrency(totalCryptoValue)}</p>
          </CardContent>
        </Card>
        
        {wallets.map((wallet) => {
          const priceData = mockPrices[wallet.symbol as keyof typeof mockPrices]
          return (
            <Card key={wallet.symbol}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {wallet.symbol === 'BTC' ? (
                      <Bitcoin className="w-5 h-5 text-orange-500" />
                    ) : (
                      <Coins className="w-5 h-5 text-blue-500" />
                    )}
                    <span className="font-medium">{wallet.currency}</span>
                  </div>
                  <span className={cn(
                    "text-xs flex items-center gap-1",
                    priceData.change >= 0 ? "text-primary" : "text-destructive"
                  )}>
                    {priceData.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {priceData.change >= 0 ? '+' : ''}{priceData.change}%
                  </span>
                </div>
                <p className="text-lg font-bold">{formatCrypto(wallet.balance, wallet.symbol)}</p>
                <p className="text-sm text-muted-foreground">{formatCurrency(wallet.balanceBRL)}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Price Cards */}
      <div className="grid sm:grid-cols-2 gap-4">
        {Object.entries(mockPrices).map(([symbol, data]) => (
          <Card key={symbol} className="bg-accent/30">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {symbol === 'BTC' ? (
                  <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                    <Bitcoin className="w-5 h-5 text-orange-500" />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                    <Coins className="w-5 h-5 text-blue-500" />
                  </div>
                )}
                <div>
                  <p className="font-medium">{symbol === 'BTC' ? 'Bitcoin' : 'Ethereum'}</p>
                  <p className="text-xs text-muted-foreground">{symbol}/BRL</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold">{formatCurrency(data.price)}</p>
                <p className={cn(
                  "text-xs",
                  data.change >= 0 ? "text-primary" : "text-destructive"
                )}>
                  {data.change >= 0 ? '+' : ''}{data.change}% (24h)
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Actions */}
      <Tabs defaultValue="buy" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="buy" className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4" />
            Comprar
          </TabsTrigger>
          <TabsTrigger value="sell" className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4" />
            Vender
          </TabsTrigger>
          <TabsTrigger value="transfer" className="flex items-center gap-2">
            <Send className="w-4 h-4" />
            Enviar
          </TabsTrigger>
        </TabsList>

        {/* BUY TAB */}
        <TabsContent value="buy" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Comprar criptomoeda</CardTitle>
              <CardDescription>
                Use seu saldo em reais para comprar Bitcoin ou Ethereum
              </CardDescription>
            </CardHeader>
            <CardContent>
              {buyResult?.success ? (
                <div className="space-y-4">
                  <div className="p-6 rounded-lg bg-primary/10 text-center">
                    <CheckCircle className="w-12 h-12 mx-auto mb-3 text-primary" />
                    <p className="text-lg font-medium text-primary">Compra realizada!</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Você comprou {formatCrypto(buyResult.amount || 0, buyCurrency)}
                    </p>
                  </div>
                  <Button variant="outline" className="w-full" onClick={() => {
                    setBuyResult(null)
                    setBuyAmountBRL('')
                  }}>
                    Nova compra
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleBuy} className="space-y-4">
                  <div className="p-3 rounded-lg bg-accent/50 text-sm">
                    <span className="text-muted-foreground">Saldo disponível: </span>
                    <span className="font-medium">{formatCurrency(balance)}</span>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Moeda</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setBuyCurrency('BTC')}
                        className={cn(
                          "p-3 rounded-lg border-2 flex items-center gap-3 transition-colors",
                          buyCurrency === 'BTC' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                        )}
                      >
                        <Bitcoin className="w-6 h-6 text-orange-500" />
                        <div className="text-left">
                          <p className="font-medium">Bitcoin</p>
                          <p className="text-xs text-muted-foreground">BTC</p>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setBuyCurrency('ETH')}
                        className={cn(
                          "p-3 rounded-lg border-2 flex items-center gap-3 transition-colors",
                          buyCurrency === 'ETH' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                        )}
                      >
                        <Coins className="w-6 h-6 text-blue-500" />
                        <div className="text-left">
                          <p className="font-medium">Ethereum</p>
                          <p className="text-xs text-muted-foreground">ETH</p>
                        </div>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="buyAmount">Valor em reais (R$)</Label>
                    <Input
                      id="buyAmount"
                      type="number"
                      step="0.01"
                      min="10"
                      max={balance}
                      value={buyAmountBRL}
                      onChange={(e) => setBuyAmountBRL(e.target.value)}
                      placeholder="0,00"
                      required
                    />
                    {buyAmountBRL && (
                      <p className="text-sm text-muted-foreground">
                        Você receberá aproximadamente {formatCrypto(estimatedCrypto, buyCurrency)}
                      </p>
                    )}
                  </div>

                  <Button type="submit" className="w-full" disabled={buyLoading}>
                    {buyLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Comprando...
                      </>
                    ) : (
                      `Comprar ${buyCurrency}`
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* SELL TAB */}
        <TabsContent value="sell" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Vender criptomoeda</CardTitle>
              <CardDescription>
                Converta suas criptomoedas de volta para reais
              </CardDescription>
            </CardHeader>
            <CardContent>
              {sellResult?.success ? (
                <div className="space-y-4">
                  <div className="p-6 rounded-lg bg-primary/10 text-center">
                    <CheckCircle className="w-12 h-12 mx-auto mb-3 text-primary" />
                    <p className="text-lg font-medium text-primary">Venda realizada!</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Você recebeu {formatCurrency(sellResult.amountBRL || 0)}
                    </p>
                  </div>
                  <Button variant="outline" className="w-full" onClick={() => {
                    setSellResult(null)
                    setSellAmount('')
                  }}>
                    Nova venda
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSell} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Moeda</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setSellCurrency('BTC')}
                        className={cn(
                          "p-3 rounded-lg border-2 flex items-center gap-3 transition-colors",
                          sellCurrency === 'BTC' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                        )}
                      >
                        <Bitcoin className="w-6 h-6 text-orange-500" />
                        <div className="text-left">
                          <p className="font-medium">Bitcoin</p>
                          <p className="text-xs text-muted-foreground">
                            Saldo: {formatCrypto(wallets.find(w => w.symbol === 'BTC')?.balance || 0, 'BTC')}
                          </p>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setSellCurrency('ETH')}
                        className={cn(
                          "p-3 rounded-lg border-2 flex items-center gap-3 transition-colors",
                          sellCurrency === 'ETH' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                        )}
                      >
                        <Coins className="w-6 h-6 text-blue-500" />
                        <div className="text-left">
                          <p className="font-medium">Ethereum</p>
                          <p className="text-xs text-muted-foreground">
                            Saldo: {formatCrypto(wallets.find(w => w.symbol === 'ETH')?.balance || 0, 'ETH')}
                          </p>
                        </div>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sellAmount">Quantidade ({sellCurrency})</Label>
                    <Input
                      id="sellAmount"
                      type="number"
                      step="0.00000001"
                      min="0"
                      max={selectedWallet?.balance || 0}
                      value={sellAmount}
                      onChange={(e) => setSellAmount(e.target.value)}
                      placeholder="0.00000000"
                      required
                    />
                    {sellAmount && (
                      <p className="text-sm text-muted-foreground">
                        Você receberá aproximadamente {formatCurrency(parseFloat(sellAmount) * mockPrices[sellCurrency].price)}
                      </p>
                    )}
                  </div>

                  <Button type="submit" className="w-full" disabled={sellLoading}>
                    {sellLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Vendendo...
                      </>
                    ) : (
                      `Vender ${sellCurrency}`
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TRANSFER TAB */}
        <TabsContent value="transfer" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Enviar cripto</CardTitle>
              <CardDescription>
                Transfira para outro usuário do Refact Bank sem taxas
              </CardDescription>
            </CardHeader>
            <CardContent>
              {transferResult?.success ? (
                <div className="space-y-4">
                  <div className="p-6 rounded-lg bg-primary/10 text-center">
                    <CheckCircle className="w-12 h-12 mx-auto mb-3 text-primary" />
                    <p className="text-lg font-medium text-primary">Transferência enviada!</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      O destinatário receberá a cripto instantaneamente
                    </p>
                  </div>
                  <Button variant="outline" className="w-full" onClick={() => {
                    setTransferResult(null)
                    setTransferAmount('')
                    setTransferEmail('')
                  }}>
                    Nova transferência
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleTransfer} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Moeda</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setTransferCurrency('BTC')}
                        className={cn(
                          "p-3 rounded-lg border-2 flex items-center gap-3 transition-colors",
                          transferCurrency === 'BTC' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                        )}
                      >
                        <Bitcoin className="w-6 h-6 text-orange-500" />
                        <span className="font-medium">BTC</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setTransferCurrency('ETH')}
                        className={cn(
                          "p-3 rounded-lg border-2 flex items-center gap-3 transition-colors",
                          transferCurrency === 'ETH' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                        )}
                      >
                        <Coins className="w-6 h-6 text-blue-500" />
                        <span className="font-medium">ETH</span>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="transferEmail">E-mail do destinatário</Label>
                    <Input
                      id="transferEmail"
                      type="email"
                      value={transferEmail}
                      onChange={(e) => setTransferEmail(e.target.value)}
                      placeholder="email@exemplo.com"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="transferAmount">Quantidade ({transferCurrency})</Label>
                    <Input
                      id="transferAmount"
                      type="number"
                      step="0.00000001"
                      min="0"
                      value={transferAmount}
                      onChange={(e) => setTransferAmount(e.target.value)}
                      placeholder="0.00000000"
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={transferLoading}>
                    {transferLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      'Enviar'
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
