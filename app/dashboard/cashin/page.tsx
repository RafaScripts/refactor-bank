'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CurrencyInput } from '@/components/ui/currency-input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { QRCodeSVG } from 'qrcode.react'
import { useSession } from 'next-auth/react'
import { paymentsApi } from '@/lib/api'
import { formatCurrency } from '@/lib/format'
import { QrCode, FileText, Copy, Check, Download, Loader2 } from 'lucide-react'

export default function CashInPage() {
  const { data: session } = useSession()
  const token = session?.user?.accessToken
  
  // Pix states
  const [pixAmount, setPixAmount] = useState<number | string>('')
  const [pixDescription, setPixDescription] = useState('')
  const [pixLoading, setPixLoading] = useState(false)
  const [pixResult, setPixResult] = useState<{
    qrCode: string
    brCode: string
    expiresAt: string
  } | null>(null)
  const [pixCopied, setPixCopied] = useState(false)

  // Boleto states
  const [boletoAmount, setBoletoAmount] = useState<number | string>('')
  const [boletoDueDate, setBoletoDueDate] = useState('')
  const [boletoPayerName, setBoletoPayerName] = useState('')
  const [boletoPayerDoc, setBoletoPayerDoc] = useState('')
  const [boletoStreet, setBoletoStreet] = useState('')
  const [boletoNumber, setBoletoNumber] = useState('')
  const [boletoNeighborhood, setBoletoNeighborhood] = useState('')
  const [boletoCity, setBoletoCity] = useState('')
  const [boletoState, setBoletoState] = useState('')
  const [boletoZipCode, setBoletoZipCode] = useState('')
  const [boletoLoading, setBoletoLoading] = useState(false)
  const [boletoResult, setBoletoResult] = useState<{
    digitableLine: string
    pdfUrl: string
    dueDate: string
  } | null>(null)
  const [boletoCopied, setBoletoCopied] = useState(false)

  const handleCreatePixCharge = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return
    
    setPixLoading(true)
    try {
      const result = await paymentsApi.createPixCharge({
        amount: Number(pixAmount),
        description: pixDescription || undefined,
      }, token)
      setPixResult(result)
    } catch (error) {
      console.error('Erro ao criar cobrança Pix:', error)
    } finally {
      setPixLoading(false)
    }
  }

  const handleCreateBoleto = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return
    
    setBoletoLoading(true)
    try {
      const result = await paymentsApi.createBoletoCharge({
        amount: Number(boletoAmount),
        dueDate: boletoDueDate,
        payer: {
          name: boletoPayerName,
          doc: boletoPayerDoc.replace(/\D/g, ''),
          address: {
            street: boletoStreet,
            number: boletoNumber,
            neighborhood: boletoNeighborhood,
            city: boletoCity,
            state: boletoState,
            zipCode: boletoZipCode.replace(/\D/g, ''),
          }
        },
      }, token)
      setBoletoResult({
        digitableLine: result.digitableLine,
        pdfUrl: result.pdfUrl,
        dueDate: result.dueDate,
      })
    } catch (error) {
      console.error('Erro ao criar boleto:', error)
    } finally {
      setBoletoLoading(false)
    }
  }

  const copyToClipboard = (text: string, type: 'pix' | 'boleto') => {
    navigator.clipboard.writeText(text)
    if (type === 'pix') {
      setPixCopied(true)
      setTimeout(() => setPixCopied(false), 2000)
    } else {
      setBoletoCopied(true)
      setTimeout(() => setBoletoCopied(false), 2000)
    }
  }

  const resetPixForm = () => {
    setPixAmount('')
    setPixDescription('')
    setPixResult(null)
  }

  const resetBoletoForm = () => {
    setBoletoAmount('')
    setBoletoDueDate('')
    setBoletoPayerName('')
    setBoletoPayerDoc('')
    setBoletoStreet('')
    setBoletoNumber('')
    setBoletoNeighborhood('')
    setBoletoCity('')
    setBoletoState('')
    setBoletoZipCode('')
    setBoletoResult(null)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Receber</h1>
        <p className="text-muted-foreground">Crie cobranças via Pix ou Boleto</p>
      </div>

      <Tabs defaultValue="pix" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="pix" className="flex items-center gap-2">
            <QrCode className="w-4 h-4" />
            Pix
          </TabsTrigger>
          <TabsTrigger value="boleto" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Boleto
          </TabsTrigger>
        </TabsList>

        {/* PIX TAB */}
        <TabsContent value="pix" className="mt-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Criar cobrança Pix</CardTitle>
                <CardDescription>
                  Gere um QR Code para receber pagamentos instantâneos
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!pixResult ? (
                  <form onSubmit={handleCreatePixCharge} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="pixAmount">Valor (R$)</Label>
                      <CurrencyInput
                        id="pixAmount"
                        value={pixAmount}
                        onValueChange={setPixAmount}
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
                        placeholder="Ex: Pagamento de serviço"
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={pixLoading}>
                      {pixLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Gerando...
                        </>
                      ) : (
                        <>
                          <QrCode className="w-4 h-4 mr-2" />
                          Gerar QR Code
                        </>
                      )}
                    </Button>
                  </form>
                ) : (
                  <div className="space-y-6">
                    <div className="flex justify-center">
                      <div className="p-4 bg-white rounded-xl">
                        <QRCodeSVG value={pixResult.brCode} size={200} />
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-primary">
                        {formatCurrency(parseFloat(pixAmount))}
                      </p>
                      {pixDescription && (
                        <p className="text-sm text-muted-foreground mt-1">{pixDescription}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>Código Pix Copia e Cola</Label>
                      <div className="flex gap-2">
                        <Input
                          value={pixResult.brCode}
                          readOnly
                          className="font-mono text-xs"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => copyToClipboard(pixResult.brCode, 'pix')}
                        >
                          {pixCopied ? (
                            <Check className="w-4 h-4 text-primary" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full" onClick={resetPixForm}>
                      Criar nova cobrança
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-accent/30">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <QrCode className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">Como funciona o Pix</h3>
                  <ul className="space-y-3 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
                      Informe o valor que deseja receber
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
                      Compartilhe o QR Code ou código com o pagador
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
                      Receba o dinheiro instantaneamente em sua conta
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* BOLETO TAB */}
        <TabsContent value="boleto" className="mt-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Criar boleto de cobrança</CardTitle>
                <CardDescription>
                  Gere um boleto bancário para receber pagamentos
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!boletoResult ? (
                  <form onSubmit={handleCreateBoleto} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="boletoAmount">Valor (R$)</Label>
                      <CurrencyInput
                        id="boletoAmount"
                        value={boletoAmount}
                        onValueChange={setBoletoAmount}
                        placeholder="0,00"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="boletoDueDate">Data de vencimento</Label>
                      <Input
                        id="boletoDueDate"
                        type="date"
                        value={boletoDueDate}
                        onChange={(e) => setBoletoDueDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="boletoPayerName">Nome do pagador</Label>
                      <Input
                        id="boletoPayerName"
                        value={boletoPayerName}
                        onChange={(e) => setBoletoPayerName(e.target.value)}
                        placeholder="Nome completo"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="boletoPayerDoc">CPF/CNPJ do pagador</Label>
                      <Input
                        id="boletoPayerDoc"
                        value={boletoPayerDoc}
                        onChange={(e) => setBoletoPayerDoc(e.target.value)}
                        placeholder="000.000.000-00"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="boletoZipCode">CEP</Label>
                        <Input
                          id="boletoZipCode"
                          value={boletoZipCode}
                          onChange={(e) => setBoletoZipCode(e.target.value)}
                          placeholder="00000-000"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="boletoState">Estado</Label>
                        <Input
                          id="boletoState"
                          value={boletoState}
                          onChange={(e) => setBoletoState(e.target.value)}
                          placeholder="SP"
                          maxLength={2}
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-4">
                      <div className="space-y-2 col-span-3">
                        <Label htmlFor="boletoStreet">Rua</Label>
                        <Input
                          id="boletoStreet"
                          value={boletoStreet}
                          onChange={(e) => setBoletoStreet(e.target.value)}
                          placeholder="Nome da rua"
                          required
                        />
                      </div>
                      <div className="space-y-2 col-span-1">
                        <Label htmlFor="boletoNumber">Número</Label>
                        <Input
                          id="boletoNumber"
                          value={boletoNumber}
                          onChange={(e) => setBoletoNumber(e.target.value)}
                          placeholder="123"
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="boletoNeighborhood">Bairro</Label>
                        <Input
                          id="boletoNeighborhood"
                          value={boletoNeighborhood}
                          onChange={(e) => setBoletoNeighborhood(e.target.value)}
                          placeholder="Centro"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="boletoCity">Cidade</Label>
                        <Input
                          id="boletoCity"
                          value={boletoCity}
                          onChange={(e) => setBoletoCity(e.target.value)}
                          placeholder="São Paulo"
                          required
                        />
                      </div>
                    </div>
                    <Button type="submit" className="w-full" disabled={boletoLoading}>
                      {boletoLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Gerando...
                        </>
                      ) : (
                        <>
                          <FileText className="w-4 h-4 mr-2" />
                          Gerar Boleto
                        </>
                      )}
                    </Button>
                  </form>
                ) : (
                  <div className="space-y-6">
                    <div className="p-4 rounded-lg bg-accent text-center">
                      <p className="text-2xl font-bold text-primary">
                        {formatCurrency(parseFloat(boletoAmount))}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Vencimento: {new Date(boletoResult.dueDate).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label>Linha digitável</Label>
                      <div className="flex gap-2">
                        <Input
                          value={boletoResult.digitableLine}
                          readOnly
                          className="font-mono text-xs"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => copyToClipboard(boletoResult.digitableLine, 'boleto')}
                        >
                          {boletoCopied ? (
                            <Check className="w-4 h-4 text-primary" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Button asChild className="flex-1">
                        <a href={boletoResult.pdfUrl} target="_blank" rel="noopener noreferrer">
                          <Download className="w-4 h-4 mr-2" />
                          Baixar PDF
                        </a>
                      </Button>
                      <Button variant="outline" className="flex-1" onClick={resetBoletoForm}>
                        Novo boleto
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-accent/30">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">Sobre boletos</h3>
                  <ul className="space-y-3 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
                      O boleto pode ser pago em qualquer banco
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
                      A compensação ocorre em até 3 dias úteis
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
                      Ideal para valores maiores ou pagamentos programados
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
