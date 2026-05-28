'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Skeleton } from '@/components/ui/skeleton'
import { useSession } from 'next-auth/react'
import { creditsApi, type CreditProduct } from '@/lib/api'
import { formatCurrency } from '@/lib/format'
import { CreditCard, Calculator, CheckCircle, Loader2, AlertCircle, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function CreditPage() {
  const { data: session } = useSession()
  const token = session?.user?.accessToken
  const bankAccountId = session?.user?.bankAccountId
  const [products, setProducts] = useState<CreditProduct[]>([])
  const [selectedProduct, setSelectedProduct] = useState<CreditProduct | null>(null)
  const [amount, setAmount] = useState<number>(0)
  const [installments, setInstallments] = useState<number>(12)
  const [isLoading, setIsLoading] = useState(false)
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [result, setResult] = useState<{
    success: boolean
    installmentValue?: number
    totalAmount?: number
    cet?: number
  } | null>(null)

  const isBusinessAccount = session?.user?.businessAccount

  useEffect(() => {
    if (!token) return
    const fetchProducts = async () => {
      setLoadingProducts(true)
      try {
        const data = await creditsApi.getProducts(token)
        setProducts(data || [])
      } catch (err) {
        console.error('Erro ao carregar produtos:', err)
        setProducts([])
      } finally {
        setLoadingProducts(false)
      }
    }
    fetchProducts()
  }, [token])

  const handleSelectProduct = (product: CreditProduct) => {
    setSelectedProduct(product)
    setAmount(product.minAmount)
    setInstallments(product.minInstallments)
    setResult(null)
  }

  const calculateInstallment = () => {
    if (!selectedProduct) return 0
    const monthlyRate = selectedProduct.interestRate / 100
    const installmentValue = amount * (monthlyRate * Math.pow(1 + monthlyRate, installments)) / (Math.pow(1 + monthlyRate, installments) - 1)
    return installmentValue
  }

  const calculateTotal = () => {
    return calculateInstallment() * installments
  }

  const calculateCET = () => {
    if (!selectedProduct) return 0
    // Simplified CET calculation
    return selectedProduct.interestRate * 12 + 2
  }

  const handleSimulate = async () => {
    if (!token || !selectedProduct || !bankAccountId) return
    
    setIsLoading(true)
    try {
      const response = await creditsApi.requestCredit({
        bankAccountId,
        productId: selectedProduct.id,
        amount,
        installments,
      }, token)
      
      setResult({
        success: response.status === 'PENDING_ANALYSIS' || response.status === 'APPROVED',
        installmentValue: calculateInstallment(),
        totalAmount: calculateTotal(),
        cet: calculateCET(),
      })
    } catch (error) {
      setResult({ success: false })
    } finally {
      setIsLoading(false)
    }
  }

  const availableProducts = products.filter(p => {
    if (p.type === 'PERSONAL') return !isBusinessAccount
    return isBusinessAccount
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Crédito</h1>
        <p className="text-muted-foreground">Simule e solicite empréstimos</p>
      </div>

      {loadingProducts ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      ) : availableProducts.length === 0 ? (
        <Card className="bg-accent/30">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium text-foreground mb-2">
              Nenhum produto disponível
            </p>
            <p className="text-muted-foreground">
              {isBusinessAccount 
                ? 'Entre em contato com o suporte para conhecer nossas linhas de crédito empresarial.'
                : 'Entre em contato com o suporte para conhecer nossas opções de crédito pessoal.'
              }
            </p>
          </CardContent>
        </Card>
      ) : !selectedProduct ? (
        <>
          {/* Product Selection */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableProducts.map((product) => (
              <Card
                key={product.id}
                className="cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => handleSelectProduct(product)}
              >
                <CardHeader>
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-2">
                    <CreditCard className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{product.name}</CardTitle>
                  <CardDescription>
                    {product.type === 'PERSONAL' ? 'Para pessoa física' :
                     product.type === 'MICROCREDIT' ? 'Para MEI e pequenas empresas' :
                     'Para empresas consolidadas'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Valor</span>
                      <span className="font-medium">
                        {formatCurrency(product.minAmount)} - {formatCurrency(product.maxAmount)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Parcelas</span>
                      <span className="font-medium">
                        {product.minInstallments}x a {product.maxInstallments}x
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Taxa a.m.</span>
                      <span className="font-medium text-primary">
                        a partir de {product.interestRate}%
                      </span>
                    </div>
                  </div>
                  <Button className="w-full mt-4">
                    Simular
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      ) : (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Simulator */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{selectedProduct.name}</CardTitle>
                  <CardDescription>Simule seu empréstimo</CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSelectedProduct(null)}>
                  Trocar produto
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {result?.success ? (
                <div className="space-y-4">
                  <div className="p-6 rounded-lg bg-primary/10 text-center">
                    <CheckCircle className="w-12 h-12 mx-auto mb-3 text-primary" />
                    <p className="text-lg font-medium text-primary">Solicitação enviada!</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Analisaremos sua solicitação e retornaremos em breve.
                    </p>
                  </div>
                  <Button variant="outline" className="w-full" onClick={() => {
                    setResult(null)
                    setSelectedProduct(null)
                  }}>
                    Nova simulação
                  </Button>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label>Valor do empréstimo</Label>
                        <span className="text-lg font-bold text-primary">
                          {formatCurrency(amount)}
                        </span>
                      </div>
                      <Slider
                        value={[amount]}
                        onValueChange={(value) => setAmount(value[0])}
                        min={selectedProduct.minAmount}
                        max={selectedProduct.maxAmount}
                        step={100}
                        className="py-4"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{formatCurrency(selectedProduct.minAmount)}</span>
                        <span>{formatCurrency(selectedProduct.maxAmount)}</span>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label>Número de parcelas</Label>
                        <span className="text-lg font-bold text-primary">
                          {installments}x
                        </span>
                      </div>
                      <Slider
                        value={[installments]}
                        onValueChange={(value) => setInstallments(value[0])}
                        min={selectedProduct.minInstallments}
                        max={selectedProduct.maxInstallments}
                        step={1}
                        className="py-4"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{selectedProduct.minInstallments}x</span>
                        <span>{selectedProduct.maxInstallments}x</span>
                      </div>
                    </div>
                  </div>

                  <Button onClick={handleSimulate} className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processando...
                      </>
                    ) : (
                      <>
                        <Calculator className="w-4 h-4 mr-2" />
                        Solicitar crédito
                      </>
                    )}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          {/* Summary */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calculator className="w-5 h-5" />
                  Resumo da simulação
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-lg bg-primary/10 text-center">
                  <p className="text-sm text-muted-foreground mb-1">Valor da parcela</p>
                  <p className="text-3xl font-bold text-primary">
                    {formatCurrency(calculateInstallment())}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    em {installments}x
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Valor solicitado</span>
                    <span className="font-medium">{formatCurrency(amount)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Total a pagar</span>
                    <span className="font-medium">{formatCurrency(calculateTotal())}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Taxa de juros (a.m.)</span>
                    <span className="font-medium">{selectedProduct.interestRate}%</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-muted-foreground">CET (a.a.)</span>
                    <span className="font-medium">{calculateCET().toFixed(2)}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-accent/30">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-foreground mb-1">Informações importantes</p>
                    <ul className="text-muted-foreground space-y-1">
                      <li>A aprovação está sujeita a análise de crédito</li>
                      <li>O valor pode ser depositado em até 24h após aprovação</li>
                      <li>Você pode quitar antecipadamente com desconto nos juros</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
