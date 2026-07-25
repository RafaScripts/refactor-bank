'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useSession } from 'next-auth/react'
import { paymentsApi, balanceApi } from '@/lib/api'
import { formatCurrency, detectPixKeyType } from '@/lib/format'
import { QrCode, Building, FileText, Loader2, CheckCircle, AlertCircle, Search } from 'lucide-react'

const banks = [
  { code: '001', name: 'Banco do Brasil' },
  { code: '033', name: 'Santander' },
  { code: '104', name: 'Caixa Econômica' },
  { code: '237', name: 'Bradesco' },
  { code: '341', name: 'Itaú' },
  { code: '756', name: 'Sicoob' },
  { code: '077', name: 'Inter' },
  { code: '260', name: 'Nubank' },
  { code: '290', name: 'PagBank' },
]

export default function CashOutPage() {
  const { data: session } = useSession()
  const token = session?.user?.accessToken
  
  // Pix states
  const [pixKey, setPixKey] = useState('')
  const [pixAmount, setPixAmount] = useState('')
  const [pixDescription, setPixDescription] = useState('')
  const [pixLoading, setPixLoading] = useState(false)
  const [pixResult, setPixResult] = useState<{ status: string; message?: string } | null>(null)

  // Transfer states
  const [transferBank, setTransferBank] = useState('')
  const [transferBranch, setTransferBranch] = useState('')
  const [transferAccount, setTransferAccount] = useState('')
  const [transferDigit, setTransferDigit] = useState('')
  const [transferAccountType, setTransferAccountType] = useState<'CHECKING' | 'SAVINGS'>('CHECKING')
  const [transferDoc, setTransferDoc] = useState('')
  const [transferName, setTransferName] = useState('')
  const [transferAmount, setTransferAmount] = useState('')
  const [transferLoading, setTransferLoading] = useState(false)
  const [transferResult, setTransferResult] = useState<{ status: string; message?: string } | null>(null)

  // Boleto states
  const [boletoCode, setBoletoCode] = useState('')
  const [boletoLoading, setBoletoLoading] = useState(false)
  const [boletoResult, setBoletoResult] = useState<{ status: string; message?: string } | null>(null)

  const [bankSearch, setBankSearch] = useState('')
  const filteredBanks = banks.filter(
    bank => bank.name.toLowerCase().includes(bankSearch.toLowerCase()) || 
            bank.code.includes(bankSearch)
  )

  const [balance, setBalance] = useState(0)

  useEffect(() => {
    if (!token) return
    balanceApi.getBalance(token).then(data => {
      setBalance((data.fiat?.balance || 0) / 100)
    }).catch(() => setBalance(0))
  }, [token])

  const handleSendPix = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return

    const amount = parseFloat(pixAmount)
    if (amount > balance) {
      setPixResult({ status: 'ERROR', message: 'Saldo insuficiente' })
      return
    }
    
    let finalPixKey = pixKey
    const keyType = detectPixKeyType(pixKey)
    if (keyType === 'CPF' || keyType === 'CNPJ') {
      finalPixKey = pixKey.replace(/[.\-\/]/g, '')
    }
    
    setPixLoading(true)
    try {
      const result = await paymentsApi.sendPix({
        pixKey: finalPixKey,
        amount: Math.round(amount * 100),
        description: pixDescription || undefined,
      }, token)
      setPixResult({ 
        status: result.status, 
        message: result.status === 'PENDING_APPROVAL' 
          ? 'Transação registrada! Aguardando aprovação dos administradores.'
          : 'Pix enviado com sucesso!'
      })
    } catch (error) {
      setPixResult({ status: 'ERROR', message: 'Erro ao enviar Pix' })
    } finally {
      setPixLoading(false)
    }
  }

  const handleSendTransfer = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return

    const amount = parseFloat(transferAmount)
    if (amount > balance) {
      setTransferResult({ status: 'ERROR', message: 'Saldo insuficiente' })
      return
    }
    
    setTransferLoading(true)
    try {
      const result = await paymentsApi.sendTransfer({
        bankCode: transferBank,
        branch: transferBranch,
        accountNumber: transferAccount,
        accountDigit: transferDigit,
        accountType: transferAccountType,
        doc: transferDoc.replace(/\D/g, ''),
        name: transferName,
        amount: Math.round(amount * 100),
      }, token)
      setTransferResult({ 
        status: result.status, 
        message: result.status === 'PENDING_APPROVAL' 
          ? 'Transferência registrada! Aguardando aprovação.'
          : 'Transferência realizada com sucesso!'
      })
    } catch (error) {
      setTransferResult({ status: 'ERROR', message: 'Erro ao realizar transferência' })
    } finally {
      setTransferLoading(false)
    }
  }

  const handlePayBoleto = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return
    
    setBoletoLoading(true)
    try {
      const cleanCode = boletoCode.replace(/\D/g, '')
      const payload = cleanCode.length === 47 
        ? { digitableLine: cleanCode } 
        : { barCode: cleanCode }
        
      const result = await paymentsApi.payBoleto(payload, token)
      setBoletoResult({ 
        status: result.status, 
        message: result.status === 'PENDING_APPROVAL' 
          ? 'Pagamento registrado! Aguardando aprovação.'
          : 'Boleto pago com sucesso!'
      })
    } catch (error) {
      setBoletoResult({ status: 'ERROR', message: 'Erro ao pagar boleto' })
    } finally {
      setBoletoLoading(false)
    }
  }

  const resetForm = (type: 'pix' | 'transfer' | 'boleto') => {
    if (type === 'pix') {
      setPixKey('')
      setPixAmount('')
      setPixDescription('')
      setPixResult(null)
    } else if (type === 'transfer') {
      setTransferBank('')
      setTransferBranch('')
      setTransferAccount('')
      setTransferDigit('')
      setTransferDoc('')
      setTransferName('')
      setTransferAmount('')
      setTransferResult(null)
    } else {
      setBoletoCode('')
      setBoletoResult(null)
    }
  }

  const ResultCard = ({ result, onReset, type }: { 
    result: { status: string; message?: string }
    onReset: () => void
    type: string
  }) => (
    <div className="space-y-4">
      <div className={`p-6 rounded-lg text-center ${
        result.status === 'ERROR' ? 'bg-destructive/10' : 
        result.status === 'PENDING_APPROVAL' ? 'bg-warning/10' : 'bg-primary/10'
      }`}>
        {result.status === 'ERROR' ? (
          <AlertCircle className="w-12 h-12 mx-auto mb-3 text-destructive" />
        ) : result.status === 'PENDING_APPROVAL' ? (
          <AlertCircle className="w-12 h-12 mx-auto mb-3 text-warning" />
        ) : (
          <CheckCircle className="w-12 h-12 mx-auto mb-3 text-primary" />
        )}
        <p className={`font-medium ${
          result.status === 'ERROR' ? 'text-destructive' : 
          result.status === 'PENDING_APPROVAL' ? 'text-warning' : 'text-primary'
        }`}>
          {result.message}
        </p>
      </div>
      <Button variant="outline" className="w-full" onClick={onReset}>
        {type === 'pix' ? 'Novo Pix' : type === 'transfer' ? 'Nova transferência' : 'Pagar outro boleto'}
      </Button>
    </div>
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Pagar</h1>
        <p className="text-muted-foreground">Envie dinheiro via Pix, TED ou pague boletos</p>
      </div>

      {/* Balance Info */}
      <Card className="bg-accent/30">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Saldo disponível</p>
            <p className="text-xl font-bold text-foreground">{formatCurrency(balance)}</p>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="pix" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="pix" className="flex items-center gap-2">
            <QrCode className="w-4 h-4" />
            Pix
          </TabsTrigger>
          <TabsTrigger value="transfer" className="flex items-center gap-2">
            <Building className="w-4 h-4" />
            TED
          </TabsTrigger>
          <TabsTrigger value="boleto" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Boleto
          </TabsTrigger>
        </TabsList>

        {/* PIX TAB */}
        <TabsContent value="pix" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Enviar Pix</CardTitle>
              <CardDescription>
                Transfira para qualquer chave Pix
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pixResult ? (
                <ResultCard result={pixResult} onReset={() => resetForm('pix')} type="pix" />
              ) : (
                <form onSubmit={handleSendPix} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="pixKey">Chave Pix</Label>
                    <Input
                      id="pixKey"
                      value={pixKey}
                      onChange={(e) => setPixKey(e.target.value)}
                      placeholder="CPF, CNPJ, e-mail, celular ou chave aleatória"
                      required
                    />
                    {pixKey && (
                      <p className="text-xs text-muted-foreground">
                        Tipo detectado: {detectPixKeyType(pixKey)}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pixAmount">Valor (R$)</Label>
                    <Input
                      id="pixAmount"
                      type="number"
                      step="0.01"
                      min="0.01"
                      max={balance}
                      value={pixAmount}
                      onChange={(e) => setPixAmount(e.target.value)}
                      placeholder="0,00"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pixDescription">Descrição (opcional)</Label>
                    <Input
                      id="pixDescription"
                      value={pixDescription}
                      onChange={(e) => setPixDescription(e.target.value)}
                      placeholder="Ex: Pagamento"
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={pixLoading}>
                    {pixLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      'Enviar Pix'
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
              <CardTitle>Transferência TED</CardTitle>
              <CardDescription>
                Envie para contas de outros bancos
              </CardDescription>
            </CardHeader>
            <CardContent>
              {transferResult ? (
                <ResultCard result={transferResult} onReset={() => resetForm('transfer')} type="transfer" />
              ) : (
                <form onSubmit={handleSendTransfer} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Banco</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        value={bankSearch}
                        onChange={(e) => setBankSearch(e.target.value)}
                        placeholder="Buscar banco..."
                        className="pl-9"
                      />
                    </div>
                    {bankSearch && (
                      <div className="border rounded-lg max-h-40 overflow-y-auto">
                        {filteredBanks.map((bank) => (
                          <button
                            key={bank.code}
                            type="button"
                            onClick={() => {
                              setTransferBank(bank.code)
                              setBankSearch(bank.name)
                            }}
                            className="w-full px-3 py-2 text-left hover:bg-accent text-sm"
                          >
                            {bank.code} - {bank.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="transferBranch">Agência</Label>
                      <Input
                        id="transferBranch"
                        value={transferBranch}
                        onChange={(e) => setTransferBranch(e.target.value)}
                        placeholder="0000"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="transferAccount">Conta</Label>
                      <div className="flex gap-2">
                        <Input
                          id="transferAccount"
                          value={transferAccount}
                          onChange={(e) => setTransferAccount(e.target.value)}
                          placeholder="00000"
                          className="flex-1"
                          required
                        />
                        <Input
                          value={transferDigit}
                          onChange={(e) => setTransferDigit(e.target.value)}
                          placeholder="0"
                          className="w-14"
                          maxLength={1}
                          required
                        />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Tipo de conta</Label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="accountType"
                          checked={transferAccountType === 'CHECKING'}
                          onChange={() => setTransferAccountType('CHECKING')}
                          className="accent-primary"
                        />
                        <span className="text-sm">Corrente</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="accountType"
                          checked={transferAccountType === 'SAVINGS'}
                          onChange={() => setTransferAccountType('SAVINGS')}
                          className="accent-primary"
                        />
                        <span className="text-sm">Poupança</span>
                      </label>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="transferName">Nome do favorecido</Label>
                    <Input
                      id="transferName"
                      value={transferName}
                      onChange={(e) => setTransferName(e.target.value)}
                      placeholder="Nome completo"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="transferDoc">CPF/CNPJ</Label>
                    <Input
                      id="transferDoc"
                      value={transferDoc}
                      onChange={(e) => setTransferDoc(e.target.value)}
                      placeholder="000.000.000-00"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="transferAmount">Valor (R$)</Label>
                    <Input
                      id="transferAmount"
                      type="number"
                      step="0.01"
                      min="0.01"
                      max={balance}
                      value={transferAmount}
                      onChange={(e) => setTransferAmount(e.target.value)}
                      placeholder="0,00"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={transferLoading}>
                    {transferLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Transferindo...
                      </>
                    ) : (
                      'Transferir'
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* BOLETO TAB */}
        <TabsContent value="boleto" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Pagar boleto</CardTitle>
              <CardDescription>
                Cole a linha digitável ou código de barras
              </CardDescription>
            </CardHeader>
            <CardContent>
              {boletoResult ? (
                <ResultCard result={boletoResult} onReset={() => resetForm('boleto')} type="boleto" />
              ) : (
                <form onSubmit={handlePayBoleto} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="boletoCode">Linha digitável ou código de barras</Label>
                    <Input
                      id="boletoCode"
                      value={boletoCode}
                      onChange={(e) => setBoletoCode(e.target.value)}
                      placeholder="Cole aqui o código do boleto"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={boletoLoading}>
                    {boletoLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processando...
                      </>
                    ) : (
                      'Pagar boleto'
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
