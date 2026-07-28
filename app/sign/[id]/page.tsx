'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileSignature, ShieldCheck, Download, AlertTriangle, Fingerprint, Loader2 } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency } from '@/lib/format'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { contractsApi } from '@/lib/api'
import { PdfExportButton } from '@/components/ui/pdf-export-button'

export default function PublicSignPage() {
  const { id } = useParams()
  const [contract, setContract] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [signing, setSigning] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    async function fetchContract() {
      try {
        const data = await contractsApi.getContract(id as string)
        if (data) setContract(data)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    if (id) fetchContract()
  }, [id])

  const handleSign = async () => {
    setSigning(true)
    setErrorMsg('')
    try {
      let geolocation = ''
      try {
        const position = await new Promise<GeolocationPosition>((res, rej) => navigator.geolocation.getCurrentPosition(res, rej, { timeout: 10000, enableHighAccuracy: true }))
        geolocation = `${position.coords.latitude}, ${position.coords.longitude}`
      } catch (e: any) {
        setSigning(false)
        setErrorMsg('É obrigatório permitir a localização do dispositivo para assinar o contrato (requisito de validade jurídica). Verifique as permissões do seu navegador.')
        return
      }

      // Didit verification mock se ativado
      let diditLogId = undefined
      if (contract.requireDidit) {
        // Simulando a comunicação com a rede DIDIT para prova de identidade
        await new Promise(r => setTimeout(r, 2000))
        diditLogId = `didit_log_${Math.random().toString(36).substring(7)}`
      }

      const payload = {
        role: 'CLIENT',
        name: contract.clientName,
        doc: contract.clientDoc,
        geolocation,
        diditVerified: contract.requireDidit,
        diditLogId
      }

      const data = await contractsApi.signContract(id as string, payload)
      if (data) {
        setContract(data)
      } else {
        alert('Falha ao assinar. Tente novamente.')
      }
    } catch (error) {
      console.error(error)
      alert('Erro inesperado.')
    } finally {
      setSigning(false)
    }
  }

  if (loading) {
    return (
      <div className="w-full max-w-3xl mx-auto space-y-4">
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    )
  }

  if (!contract) {
    return (
      <div className="w-full max-w-xl mx-auto mt-20 text-center">
        <AlertTriangle className="w-16 h-16 text-destructive mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Contrato não encontrado</h1>
        <p className="text-muted-foreground">O link pode ser inválido ou o documento foi removido.</p>
      </div>
    )
  }

  const clientSigned = contract.signatures?.find((s: any) => s.role === 'CLIENT')

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      
      {clientSigned && (
        <Card className="border-emerald-500/50 bg-emerald-500/5">
          <CardHeader className="text-center pb-2">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <CardTitle className="text-2xl text-emerald-500">Documento Assinado com Sucesso</CardTitle>
            <CardDescription>Obrigado, {contract.clientName}. A assinatura foi registrada legalmente e armazenada com criptografia.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center pt-4">
            <PdfExportButton 
              targetId="contract-content"
              filename={`contrato-${contract.osId}.pdf`}
              buttonText="Baixar Cópia Certificada (PDF)"
              className="bg-emerald-600 hover:bg-emerald-700"
              variant="default"
              size="lg"
            />
          </CardContent>
        </Card>
      )}

      <Card className="border-border">
        <CardHeader className="border-b border-border bg-accent/30">
          <CardTitle className="text-xl">Revisar e Assinar Contrato</CardTitle>
          <CardDescription>Por favor, leia atentamente os termos abaixo antes de prosseguir com a assinatura eletrônica.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div id="contract-content" className="p-6 md:p-10 prose prose-sm dark:prose-invert max-w-none font-serif bg-card text-foreground">
            <h2 className="text-center mb-8">CONTRATO DE PRESTAÇÃO DE SERVIÇOS (O.S #{contract.osId})</h2>
              
              <p>
                <strong>CONTRATANTE:</strong> {contract.clientName}, portador(a) do documento {contract.clientDoc}, com o endereço eletrônico {contract.clientEmail}.
              </p>
              
              <p>
                <strong>CONTRATADA (DESENVOLVEDOR):</strong> {contract.managerName}, portador(a) do documento {contract.managerDoc}.
              </p>

              <h3>1. OBJETO DO CONTRATO</h3>
              <p>A Contratada obriga-se a prestar os serviços de desenvolvimento e engenharia de software consistentes em: <strong>{contract.description}</strong>.</p>
              
              <h3>2. VALOR E CONDIÇÕES DE PAGAMENTO</h3>
              <p>O valor total acordado para a prestação dos serviços é de <strong>{formatCurrency(contract.amount)}</strong>.</p>
              
              <h3>3. DA ASSINATURA ELETRÔNICA E VALIDADE JURÍDICA</h3>
              <p>Este documento é assinado digitalmente pelas partes envolvidas. A assinatura possui validade legal e integridade criptográfica mediante a MP 2.200-2, sendo registrado o endereço IP, data/hora exata e informações do dispositivo no momento do aceite.</p>
              <p>Hash Único de Integridade do Documento: <br/><code className="text-xs break-all bg-muted p-1 rounded mt-1">{contract.documentHash}</code></p>
            </div>
          </CardContent>
          
          {!clientSigned && (
            <CardFooter className="border-t border-border bg-accent/20 p-6 flex flex-col gap-6">
              <div className="bg-card p-4 rounded-xl border border-border space-y-4 w-full">
                <div className="flex items-start gap-4">
                  <Fingerprint className="w-6 h-6 text-primary mt-1 shrink-0" />
                  <div>
                    <h4 className="font-semibold text-foreground">Autorização de Assinatura</h4>
                    <p className="text-sm text-muted-foreground">
                      Ao clicar em assinar, você, {contract.clientName} (Doc: {contract.clientDoc}), concorda expressamente com os termos acima e autoriza a coleta do seu IP e geolocalização para fins de validade legal.
                    </p>
                  </div>
                </div>
                
                {contract.requireDidit && (
                  <div className="flex items-center space-x-2 pt-2 border-t border-border">
                    <ShieldCheck className="w-5 h-5 text-emerald-500" />
                    <Label className="text-sm text-muted-foreground">
                      O gestor exigiu a verificação DIDIT (Prova de Vida On-chain) para este contrato.
                    </Label>
                  </div>
                )}
              </div>

              {errorMsg && (
                <div className="bg-destructive/10 border border-destructive text-destructive text-sm p-4 rounded-xl flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                  <p>{errorMsg}</p>
                </div>
              )}

              <Button 
                size="lg" 
                className="w-full text-lg h-14" 
                onClick={handleSign}
                disabled={signing}
              >
                {signing ? (
                  <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Processando Assinatura Segura...</>
                ) : (
                  <><FileSignature className="w-5 h-5 mr-2" /> Assinar Contrato Eletronicamente</>
                )}
              </Button>
            </CardFooter>
          )}
        </Card>

    </div>
  )
}
