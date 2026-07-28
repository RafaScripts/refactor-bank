'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileSignature, Copy, Check, Download, AlertTriangle, Clock } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency } from '@/lib/format'
import { useSession } from 'next-auth/react'
import { cn } from '@/lib/utils'
import { PdfExportButton } from '@/components/ui/pdf-export-button'

import { contractsApi } from '@/lib/api'

export default function ContractDetailsPage() {
  const { id } = useParams()
  const { data: session } = useSession()
  const [contract, setContract] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [signing, setSigning] = useState(false)

  const fetchContract = async () => {
    try {
      const data = await contractsApi.getContract(id as string)
      if (data) setContract(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id) fetchContract()
  }, [id])

  const publicLink = typeof window !== 'undefined' ? `${window.location.origin}/sign/${id}` : ''

  const copyLink = () => {
    navigator.clipboard.writeText(publicLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleManagerSign = async () => {
    if (!session?.user) return
    setSigning(true)
    try {
      // Get GeoLocation if possible
      let geolocation = 'Desconhecida'
      try {
        const position = await new Promise<GeolocationPosition>((res, rej) => navigator.geolocation.getCurrentPosition(res, rej))
        geolocation = `${position.coords.latitude}, ${position.coords.longitude}`
      } catch (e) { /* ignore */ }

      const payload = {
        role: 'MANAGER',
        name: session.user.name,
        doc: (session.user as any).doc || '000.000.000-00',
        geolocation,
        diditVerified: false,
      }

      const data = await contractsApi.signContract(id as string, payload)
      if (data) {
        setContract(data)
      }
    } catch (error) {
      console.error(error)
      alert('Erro ao assinar')
    } finally {
      setSigning(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!contract) return <div>Contrato não encontrado</div>

  const managerSigned = contract.signatures?.some((s: any) => s.role === 'MANAGER')
  const clientSigned = contract.signatures?.some((s: any) => s.role === 'CLIENT')

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">O.S #{contract.osId}</h1>
          <p className="text-muted-foreground">{contract.title}</p>
        </div>
        <div className="flex gap-2">
          {contract.status === 'SIGNED' && (
            <PdfExportButton
              targetId="contract-content"
              filename={`contrato-${contract.osId}.pdf`}
              buttonText="Baixar PDF Certificado"
              variant="outline"
              className="text-primary border-primary/50 hover:bg-primary/10"
            />
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Conteúdo do Contrato</CardTitle>
              <CardDescription>Termos que serão assinados por você e pelo cliente.</CardDescription>
            </CardHeader>
            <CardContent>
              <div id="contract-content" className="p-6 bg-card rounded-lg border border-border prose prose-sm dark:prose-invert max-w-none font-serif text-foreground">
                <h2 className="text-center">CONTRATO DE PRESTAÇÃO DE SERVIÇOS (O.S #{contract.osId})</h2>
                <p>
                  <strong>CONTRATANTE:</strong> {contract.clientName}, documento {contract.clientDoc}, email {contract.clientEmail}.
                </p>
                <p>
                  <strong>CONTRATADA (DESENVOLVEDOR):</strong> {contract.managerName}, documento {contract.managerDoc}.
                </p>
                <h3>1. OBJETO</h3>
                <p>{contract.description}</p>
                <h3>2. VALOR</h3>
                <p>O valor acordado pelos serviços é de {formatCurrency(contract.amount)}.</p>
                <h3>3. ASSINATURAS ELETRÔNICAS</h3>
                <p>Este documento é assinado digitalmente pelas partes com registro de IP, data e hora, possuindo validade legal mediante concordância explícita através de chaves criptográficas RSA (Hash: <code>{contract.documentHash}</code>).</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Status das Assinaturas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                <div>
                  <p className="font-semibold text-foreground">Sua Assinatura (Gestor)</p>
                  <p className="text-sm text-muted-foreground">Você concorda com os termos acima.</p>
                </div>
                {managerSigned ? (
                  <span className="flex items-center text-emerald-500 font-medium bg-emerald-500/10 px-3 py-1 rounded-full text-sm">
                    <Check className="w-4 h-4 mr-1" /> Assinado
                  </span>
                ) : (
                  <Button onClick={handleManagerSign} disabled={signing}>
                    {signing ? 'Assinando...' : 'Assinar Agora'}
                  </Button>
                )}
              </div>
              
              <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                <div>
                  <p className="font-semibold text-foreground">Assinatura do Cliente</p>
                  <p className="text-sm text-muted-foreground">{contract.clientEmail}</p>
                </div>
                {clientSigned ? (
                  <span className="flex items-center text-emerald-500 font-medium bg-emerald-500/10 px-3 py-1 rounded-full text-sm">
                    <Check className="w-4 h-4 mr-1" /> Assinado
                  </span>
                ) : (
                  <span className="flex items-center text-orange-500 font-medium bg-orange-500/10 px-3 py-1 rounded-full text-sm">
                    <Clock className="w-4 h-4 mr-1" /> Aguardando
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-lg">Link para o Cliente</CardTitle>
              <CardDescription>Envie este link seguro para o cliente assinar o contrato digitalmente.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 bg-background rounded border text-xs break-all text-muted-foreground">
                  {publicLink}
                </div>
                <Button onClick={copyLink} variant="default" className="w-full">
                  {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                  {copied ? 'Copiado!' : 'Copiar Link Público'}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Validade Legal</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground space-y-4">
                <p className="flex gap-2 items-start">
                  <FileSignature className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  Assinatura Eletrônica Avançada (MP 2.200-2).
                </p>
                <p className="flex gap-2 items-start">
                  <AlertTriangle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
                  Captura de IP, User-Agent e Geo-localização no momento do aceite.
                </p>
                <p className="flex gap-2 items-start">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  Criptografia SHA-256 (Hash do Documento preservado).
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
