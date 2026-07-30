'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency, formatDateTime } from '@/lib/format'
import { ArrowDownLeft, ArrowUpRight, Copy, Check, Eye, EyeOff, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ethers } from 'ethers'
import CryptoJS from 'crypto-js'
import { walletApi, type WalletListResponse } from '@/lib/api'

export function CryptoStatement({ token, wallet, setWallet }: { token: string, wallet: WalletListResponse | null, setWallet: (w: any) => void }) {
  // Wallet Setup States
  const [pin, setPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [setupLoading, setSetupLoading] = useState(false)
  
  // Wallet Display States
  const [copied, setCopied] = useState(false)
  const [showMnemonic, setShowMnemonic] = useState(false)
  const [mnemonicPin, setMnemonicPin] = useState('')
  const [decryptedMnemonic, setDecryptedMnemonic] = useState('')
  
  // On-chain Txs States
  const [txs, setTxs] = useState<any[]>([])
  const [txsLoading, setTxsLoading] = useState(false)

  const usdtBalance = wallet?.balances?.USDT || wallet?.balances?.get?.('USDT') || '0'
  const hasWallet = !!wallet?.address

  const fetchOnChainTxs = useCallback(async () => {
    if (!wallet?.address) return
    setTxsLoading(true)
    try {
      const apiKey = 'AZBKFVTX1FFTX4F8ZNYPQXF8ZMN9UTM156'
      // Fetch ERC-20 token transfers for USDT (assuming mainnet USDT contract or just normal txs, using normal txs for this example)
      const res = await fetch(`https://api.etherscan.io/api?module=account&action=txlist&address=${wallet.address}&startblock=0&endblock=99999999&page=1&offset=20&sort=desc&apikey=${apiKey}`)
      const data = await res.json()
      if (data.status === '1' && data.result) {
        setTxs(data.result)
      } else {
        setTxs([])
      }
    } catch (err) {
      console.error('Erro ao buscar txs na Etherscan', err)
    } finally {
      setTxsLoading(false)
    }
  }, [wallet?.address])

  useEffect(() => {
    if (hasWallet) {
      fetchOnChainTxs()
    }
  }, [hasWallet, fetchOnChainTxs])

  const handleCreateWallet = async (e: React.FormEvent) => {
    e.preventDefault()
    if (pin.length !== 6 || pin !== confirmPin) {
      alert('PIN inválido ou não confere. Use 6 dígitos.')
      return
    }

    setSetupLoading(true)
    try {
      // Generate random wallet (BIP39 + ethers)
      const randomWallet = ethers.Wallet.createRandom()
      const mnemonic = randomWallet.mnemonic?.phrase

      if (!mnemonic) throw new Error('Falha ao gerar mnemônico')

      // Encrypt mnemonic with PIN
      const encryptedMnemonic = CryptoJS.AES.encrypt(mnemonic, pin).toString()

      // Save to backend
      const updatedWallet = await walletApi.setupWallet({
        address: randomWallet.address,
        encryptedMnemonic
      }, token)

      setWallet(updatedWallet)
      
    } catch (err: any) {
      console.error(err)
      alert(err.message || 'Erro ao criar carteira')
    } finally {
      setSetupLoading(false)
    }
  }

  const handleRevealMnemonic = () => {
    if (!mnemonicPin || mnemonicPin.length !== 6) {
      alert('Digite o PIN de 6 dígitos.')
      return
    }
    
    try {
      const bytes = CryptoJS.AES.decrypt(wallet!.hashMnemonic!, mnemonicPin)
      const originalText = bytes.toString(CryptoJS.enc.Utf8)
      
      if (!originalText) throw new Error('PIN incorreto')
      
      setDecryptedMnemonic(originalText)
    } catch (err) {
      alert('PIN incorreto ou erro ao descriptografar.')
    }
  }

  const copyAddress = () => {
    if (!wallet?.address) return
    navigator.clipboard.writeText(wallet.address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!hasWallet) {
    return (
      <Card className="max-w-md mx-auto mt-8">
        <CardHeader>
          <CardTitle>Criar Carteira USDT</CardTitle>
          <CardDescription>
            Gere uma carteira on-chain segura para receber USDT. O mnemônico será protegido pelo seu PIN.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateWallet} className="space-y-4">
            <div className="space-y-2">
              <Label>Crie um PIN (6 dígitos)</Label>
              <Input
                type="password"
                maxLength={6}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\\D/g, ''))}
                placeholder="000000"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Confirme o PIN</Label>
              <Input
                type="password"
                maxLength={6}
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value.replace(/\\D/g, ''))}
                placeholder="000000"
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={setupLoading}>
              {setupLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Gerar Carteira
            </Button>
          </form>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Saldo USDT</p>
            <p className="text-2xl font-bold text-primary">{parseFloat(usdtBalance).toFixed(2)} USDT</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 space-y-2">
            <p className="text-sm text-muted-foreground">Endereço da Carteira</p>
            <div className="flex gap-2">
              <Input value={wallet.address} readOnly className="font-mono text-xs" />
              <Button variant="outline" size="icon" onClick={copyAddress}>
                {copied ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Segurança</CardTitle>
          <CardDescription>Visualize o mnemônico da sua carteira (precisa do PIN).</CardDescription>
        </CardHeader>
        <CardContent>
          {!showMnemonic ? (
            <Button variant="outline" onClick={() => setShowMnemonic(true)}>
              <Eye className="w-4 h-4 mr-2" /> Revelar Mnemônico
            </Button>
          ) : (
            <div className="space-y-4 max-w-sm">
              {!decryptedMnemonic ? (
                <div className="flex gap-2">
                  <Input 
                    type="password" 
                    maxLength={6} 
                    placeholder="Digite seu PIN" 
                    value={mnemonicPin}
                    onChange={(e) => setMnemonicPin(e.target.value)}
                  />
                  <Button onClick={handleRevealMnemonic}>Confirmar</Button>
                  <Button variant="ghost" onClick={() => setShowMnemonic(false)}>Cancelar</Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="p-3 bg-accent rounded-md border font-mono text-sm">
                    {decryptedMnemonic}
                  </div>
                  <Button variant="outline" size="sm" onClick={() => {
                    setDecryptedMnemonic('')
                    setShowMnemonic(false)
                    setMnemonicPin('')
                  }}>
                    <EyeOff className="w-4 h-4 mr-2" /> Ocultar
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Transações On-Chain (Etherscan)</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {txsLoading ? (
            <div className="p-8 space-y-4">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
          ) : txs.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <p>Nenhuma transação on-chain encontrada</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {txs.map((tx: any) => (
                <div key={tx.hash} className="p-4 flex flex-col gap-1 hover:bg-accent/50 transition-colors">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Hash: {tx.hash.substring(0, 16)}...</span>
                    <span className="text-sm font-bold text-foreground">
                      {ethers.formatEther(tx.value || '0')} ETH
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>De: {tx.from === wallet.address?.toLowerCase() ? 'Você' : tx.from.substring(0, 8)+'...'}</span>
                    <span>Para: {tx.to === wallet.address?.toLowerCase() ? 'Você' : tx.to.substring(0, 8)+'...'}</span>
                    <span>{new Date(parseInt(tx.timeStamp) * 1000).toLocaleString('pt-BR')}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
