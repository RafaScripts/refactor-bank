'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CurrencyInput } from '@/components/ui/currency-input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { paymentsApi, pixKeysApi, type PixKey } from '@/lib/api'
import { formatCurrency, detectPixKeyType } from '@/lib/format'
import { QrCode, Send, Key, Copy, CheckCircle, Loader2, Trash2, Plus, AlertCircle } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { cn } from '@/lib/utils'

export default function PixPage() {
  const { data: session } = useSession()
  const token = session?.user?.accessToken

  // Receive states
  const [receiveAmount, setReceiveAmount] = useState<number | string>('')
  const [receiveDescription, setReceiveDescription] = useState('')
  const [receiveLoading, setReceiveLoading] = useState(false)
  const [pixCharge, setPixCharge] = useState<{ brCode: string; qrCode: string } | null>(null)

  // Send states
  const [sendKey, setSendKey] = useState('')
  const [sendAmount, setSendAmount] = useState<number | string>('')
  const [sendDescription, setSendDescription] = useState('')
  const [sendLoading, setSendLoading] = useState(false)
  const [sendResult, setSendResult] = useState<{ status: string; message?: string } | null>(null)

  // Keys states
  const [pixKeys, setPixKeys] = useState<PixKey[]>([])
  const [loadingKeys, setLoadingKeys] = useState(true)
  const [showAddKey, setShowAddKey] = useState(false)
  const [newKeyType, setNewKeyType] = useState('EVP')

  useEffect(() => {
    if (!token) return
    const fetchKeys = async () => {
      setLoadingKeys(true)
      try {
        const data = await pixKeysApi.listKeys(token)
        if (Array.isArray(data)) {
          setPixKeys(data)
        } else {
          setPixKeys([])
          console.warn('listKeys returned non-array:', data)
        }
      } catch (err) {
        console.error('Erro ao carregar chaves:', err)
      } finally {
        setLoadingKeys(false)
      }
    }
    fetchKeys()
  }, [token])

  const handleReceive = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return
    setReceiveLoading(true)
    try {
      const result = await paymentsApi.createPixCharge({
        amount: Number(receiveAmount),
        description: receiveDescription || undefined,
      }, token)
      setPixCharge({ brCode: result.brCode, qrCode: result.qrCode })
    } catch (err) {
      console.error('Erro ao gerar Pix:', err)
    } finally {
      setReceiveLoading(false)
    }
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return
    
    let finalPixKey = sendKey
    const keyType = detectPixKeyType(sendKey)
    if (keyType === 'CPF' || keyType === 'CNPJ') {
      finalPixKey = sendKey.replace(/[.\-\/]/g, '')
    }
    
    setSendLoading(true)
    try {
      const result = await paymentsApi.sendPix({
        pixKey: finalPixKey,
        amount: Number(sendAmount),
        description: sendDescription || undefined,
      }, token)
      setSendResult({
        status: result.status,
        message: result.status === 'PENDING_APPROVAL'
          ? 'Transação registrada! Aguardando aprovação.'
          : 'Pix enviado com sucesso!',
      })
    } catch (err) {
      setSendResult({ status: 'ERROR', message: 'Erro ao enviar Pix' })
    } finally {
      setSendLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const handleAddKey = async () => {
    if (!token) return
    try {
      await pixKeysApi.createKey({ type: newKeyType }, token)
      const data = await pixKeysApi.listKeys(token)
      if (Array.isArray(data)) {
        setPixKeys(data)
      } else {
        setPixKeys([])
      }
      setShowAddKey(false)
    } catch (err) {
      console.error('Erro ao criar chave:', err)
    }
  }

  const handleDeleteKey = async (id: string) => {
    if (!token) return
    try {
      await pixKeysApi.deleteKey(id, token)
      setPixKeys(prev => prev.filter(k => k.id !== id))
    } catch (err) {
      console.error('Erro ao deletar chave:', err)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Pix</h1>
        <p className="text-muted-foreground">Receba e envie pagamentos via Pix</p>
      </div>

      <Tabs defaultValue="receive" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="receive" className="flex items-center gap-2">
            <QrCode className="w-4 h-4" />
            Receber
          </TabsTrigger>
          <TabsTrigger value="send" className="flex items-center gap-2">
            <Send className="w-4 h-4" />
            Enviar
          </TabsTrigger>
          <TabsTrigger value="keys" className="flex items-center gap-2">
            <Key className="w-4 h-4" />
            Chaves
          </TabsTrigger>
        </TabsList>

        {/* RECEIVE */}
        <TabsContent value="receive" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Receber via Pix</CardTitle>
              <CardDescription>Gere um QR Code para receber pagamentos</CardDescription>
            </CardHeader>
            <CardContent>
              {pixCharge ? (
                <div className="space-y-6 text-center">
                  <div className="flex justify-center">
                    <div className="p-4 bg-white rounded-xl">
                      <QRCodeSVG value={pixCharge.brCode} size={200} />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Código Pix (copia e cola)</p>
                    <div className="flex gap-2">
                      <Input value={pixCharge.brCode} readOnly className="font-mono text-xs" />
                      <Button variant="outline" onClick={() => copyToClipboard(pixCharge.brCode)}>
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full" onClick={() => {
                    setPixCharge(null)
                    setReceiveAmount('')
                    setReceiveDescription('')
                  }}>
                    Gerar novo QR Code
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleReceive} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="receiveAmount">Valor (R$)</Label>
                    <CurrencyInput
                        id="receiveAmount"
                        value={receiveAmount}
                        onValueChange={setReceiveAmount}
                      placeholder="0,00"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="receiveDescription">Descrição (opcional)</Label>
                    <Input
                      id="receiveDescription"
                      value={receiveDescription}
                      onChange={(e) => setReceiveDescription(e.target.value)}
                      placeholder="Ex: Pagamento de serviço"
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={receiveLoading}>
                    {receiveLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <QrCode className="w-4 h-4 mr-2" />
                        Gerar QR Code
                      </>
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* SEND */}
        <TabsContent value="send" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Enviar via Pix</CardTitle>
              <CardDescription>Envie dinheiro usando uma chave Pix</CardDescription>
            </CardHeader>
            <CardContent>
              {sendResult ? (
                <div className="space-y-4 text-center">
                  <div className={cn(
                    "p-6 rounded-lg",
                    sendResult.status === 'ERROR' ? 'bg-destructive/10' : 'bg-primary/10'
                  )}>
                    {sendResult.status === 'ERROR' ? (
                      <AlertCircle className="w-12 h-12 mx-auto mb-3 text-destructive" />
                    ) : (
                      <CheckCircle className="w-12 h-12 mx-auto mb-3 text-primary" />
                    )}
                    <p className={cn(
                      "text-lg font-medium",
                      sendResult.status === 'ERROR' ? 'text-destructive' : 'text-primary'
                    )}>
                      {sendResult.status === 'ERROR' ? 'Erro' : 'Sucesso!'}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">{sendResult.message}</p>
                  </div>
                  <Button variant="outline" className="w-full" onClick={() => {
                    setSendResult(null)
                    setSendKey('')
                    setSendAmount('')
                    setSendDescription('')
                  }}>
                    Novo envio
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSend} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="sendKey">Chave Pix</Label>
                    <Input
                      id="sendKey"
                      value={sendKey}
                      onChange={(e) => setSendKey(e.target.value)}
                      placeholder="CPF, e-mail, telefone ou chave aleatória"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sendAmount">Valor (R$)</Label>
                    <CurrencyInput
                        id="sendAmount"
                        value={sendAmount}
                        onValueChange={setSendAmount}
                      placeholder="0,00"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sendDescription">Descrição (opcional)</Label>
                    <Input
                      id="sendDescription"
                      value={sendDescription}
                      onChange={(e) => setSendDescription(e.target.value)}
                      placeholder="Ex: Pagamento"
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={sendLoading}>
                    {sendLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Enviar Pix
                      </>
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* KEYS */}
        <TabsContent value="keys" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Minhas chaves Pix</CardTitle>
                <CardDescription>Gerencie suas chaves cadastradas</CardDescription>
              </div>
              <Button size="sm" onClick={() => setShowAddKey(!showAddKey)}>
                <Plus className="w-4 h-4 mr-1" />
                Nova chave
              </Button>
            </CardHeader>
            <CardContent>
              {showAddKey && (
                <div className="mb-4 p-4 rounded-lg bg-accent/30 space-y-3">
                  <Label>Tipo de chave</Label>
                  <select
                    value={newKeyType}
                    onChange={(e) => setNewKeyType(e.target.value)}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                  >
                    <option value="EVP">Chave aleatória (EVP)</option>
                    <option value="CPF">CPF</option>
                    <option value="CNPJ">CNPJ</option>
                    <option value="EMAIL">E-mail</option>
                    <option value="PHONE">Telefone</option>
                  </select>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleAddKey}>Criar</Button>
                    <Button size="sm" variant="ghost" onClick={() => setShowAddKey(false)}>Cancelar</Button>
                  </div>
                </div>
              )}

              {loadingKeys ? (
                <div className="space-y-2">
                  {[...Array(2)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : pixKeys.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  Você ainda não possui chaves Pix cadastradas.
                </p>
              ) : (
                <div className="space-y-2">
                  {pixKeys.map((key) => (
                    <div
                      key={key.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-border"
                    >
                      <div>
                        <p className="font-medium text-sm">{key.type}</p>
                        <p className="text-xs text-muted-foreground font-mono">{key.key}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => copyToClipboard(key.key)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => handleDeleteKey(key.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
