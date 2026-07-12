'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { accountApi } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ExternalLink, CheckCircle, ShieldAlert, ShieldCheck } from 'lucide-react'

const DiditDetails = ({ data }: { data: any }) => {
  if (!data) return null;
  const decision = data.decision || data;
  const idVerification = decision?.id_verifications?.[0];
  const faceMatch = decision?.face_matches?.[0];

  return (
    <div className="space-y-6 text-sm">
      <div className="grid grid-cols-2 gap-4">
        <div className="border p-4 rounded-lg bg-muted/30">
          <h3 className="font-semibold mb-2">Dados do Documento Extraídos</h3>
          <p><span className="font-medium text-muted-foreground">Nome Completo:</span> {idVerification?.full_name || 'N/A'}</p>
          <p><span className="font-medium text-muted-foreground">Documento:</span> {idVerification?.document_number || 'N/A'}</p>
          <p><span className="font-medium text-muted-foreground">Data Nascimento:</span> {idVerification?.date_of_birth || 'N/A'}</p>
          <p><span className="font-medium text-muted-foreground">Tipo de Doc:</span> {idVerification?.document_type || 'N/A'}</p>
        </div>
        <div className="border p-4 rounded-lg bg-muted/30">
          <h3 className="font-semibold mb-2">Status da Validação</h3>
          <p><span className="font-medium text-muted-foreground">Decisão Final:</span> {data.status}</p>
          <p><span className="font-medium text-muted-foreground">Score Face Match:</span> {faceMatch?.score ? `${faceMatch.score}%` : 'N/A'}</p>
          {decision?.warnings?.length > 0 && (
            <div className="mt-2 text-yellow-600 flex items-start gap-1">
              <ShieldAlert className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>Foram encontrados avisos (ex: documento duplicado, IP duplicado). Verifique a conta cuidadosamente.</span>
            </div>
          )}
          {(!decision?.warnings || decision.warnings.length === 0) && (
            <div className="mt-2 text-green-600 flex items-start gap-1">
              <ShieldCheck className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>Nenhum aviso de fraude detectado.</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="font-semibold">Imagens Capturadas (Expira em breve)</h3>
        <div className="grid grid-cols-2 gap-4">
          {idVerification?.front_image && (
            <div className="border p-2 rounded-lg">
              <p className="text-xs font-semibold mb-1 text-center">Frente do Documento</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={idVerification.front_image} alt="Documento Frente" className="w-full h-auto object-contain rounded" style={{ maxHeight: '200px' }} />
            </div>
          )}
          {idVerification?.portrait_image && (
            <div className="border p-2 rounded-lg">
              <p className="text-xs font-semibold mb-1 text-center">Selfie / Rosto Recortado</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={idVerification.portrait_image} alt="Rosto" className="w-full h-auto object-contain rounded" style={{ maxHeight: '200px' }} />
            </div>
          )}
          {faceMatch?.source_image && !idVerification?.portrait_image && (
            <div className="border p-2 rounded-lg">
              <p className="text-xs font-semibold mb-1 text-center">Rosto (Face Match)</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={faceMatch.source_image} alt="Face Match" className="w-full h-auto object-contain rounded" style={{ maxHeight: '200px' }} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function AdminDashboardPage() {
  const { data: session } = useSession()
  const [accounts, setAccounts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchAccounts = async () => {
    if (!session?.user?.accessToken) return
    try {
      setLoading(true)
      const data = await accountApi.getPendingAccounts(session.user.accessToken)
      setAccounts(data || [])
    } catch (error) {
      toast.error('Erro ao buscar contas pendentes')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAccounts()
  }, [session])

  const handleApprove = async (id: string) => {
    if (!session?.user?.accessToken) return
    try {
      await accountApi.approveAccount(id, session.user.accessToken)
      toast.success('Conta aprovada com sucesso!')
      fetchAccounts() // Refresh list
    } catch (error: any) {
      toast.error(error.message || 'Erro ao aprovar conta')
    }
  }

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'APPROVED': return 'bg-green-500 hover:bg-green-600 text-white'
      case 'FAILED': return 'bg-red-500 hover:bg-red-600 text-white'
      case 'PENDING_KYC': return 'bg-blue-500 hover:bg-blue-600 text-white'
      case 'PENDING_REVIEW': return 'bg-yellow-500 hover:bg-yellow-600 text-white'
      default: return 'bg-gray-500 hover:bg-gray-600 text-white'
    }
  }

  const getStatusLabel = (status: string) => {
    switch(status) {
      case 'APPROVED': return 'Aprovado (Didit)'
      case 'FAILED': return 'Reprovado (Didit)'
      case 'PENDING_KYC': return 'Aguardando Didit'
      case 'PENDING_REVIEW': return 'Revisão Manual'
      default: return status || 'PENDING'
    }
  }

  if (loading) {
    return <div className="animate-pulse p-8">Carregando painel admin...</div>
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Painel de Administração</h1>
        <p className="text-muted-foreground mt-2">
          Gerencie e aprove contas bancárias pendentes de análise (KYC/Didit).
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Contas Pendentes de Aprovação</CardTitle>
          <CardDescription>
            Mostrando contas que solicitaram abertura e estão em fluxo de KYC ou revisão.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {accounts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma conta pendente no momento.
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Tipo / Doc</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Documentos PJ</TableHead>
                    <TableHead className="text-right">Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {accounts.map((account) => {
                    const status = account.dataCreation?.status || 'PENDING'
                    
                    return (
                    <TableRow key={account._id}>
                      <TableCell className="font-medium">
                        {new Date(account.createdAt).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-semibold">{account.ownerName || account.owner?.name}</span>
                          <span className="text-xs text-muted-foreground">{account.owner?.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-xs bg-muted px-2 py-1 rounded w-fit mb-1">{account.businessAccount ? 'PJ' : 'PF'}</span>
                          <span className="text-sm">{account.ownerDoc || account.owner?.doc}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(status)}>
                          {getStatusLabel(status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              Ver Docs ({account.owner?.docsPersonLinks?.length || 0})
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Documentos do Cliente</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              {(!account.owner?.docsPersonLinks || account.owner?.docsPersonLinks.length === 0) ? (
                                <p className="text-sm text-muted-foreground">O cliente ainda não enviou documentos adicionais.</p>
                              ) : (
                                <div className="grid grid-cols-2 gap-4">
                                  {account.owner.docsPersonLinks.map((doc: any, index: number) => (
                                    <div key={index} className="flex flex-col gap-2 p-3 border rounded-lg bg-muted/50">
                                      <span className="text-xs font-semibold uppercase">{doc.type || 'Documento'}</span>
                                      <a 
                                        href={doc.url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 text-sm text-primary hover:underline"
                                      >
                                        Visualizar Arquivo <ExternalLink className="w-3 h-3" />
                                      </a>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {account.dataCreation?.diditData && (
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button size="sm" variant="outline">Ver KYC</Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle>Resultado da Verificação de Identidade (Didit)</DialogTitle>
                                </DialogHeader>
                                <DiditDetails data={account.dataCreation.diditData} />
                              </DialogContent>
                            </Dialog>
                          )}
                          <Button 
                            size="sm" 
                            onClick={() => handleApprove(account._id)}
                            disabled={status === 'PENDING_KYC'} // Desabilita se ainda estiver no didit
                            className="bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Aprovar
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )})}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
