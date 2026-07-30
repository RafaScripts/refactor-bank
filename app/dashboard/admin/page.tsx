'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { accountApi, api } from '@/lib/api'
import { adminApi } from '@/lib/admin.api'
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
import { ExternalLink, CheckCircle, ShieldAlert, ShieldCheck, Users, Building2, Activity, Database, ArrowRight, Shield } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

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
              <img src={idVerification.front_image} alt="Documento Frente" className="w-full h-auto object-contain rounded" style={{ maxHeight: '200px' }} />
            </div>
          )}
          {idVerification?.portrait_image && (
            <div className="border p-2 rounded-lg">
              <p className="text-xs font-semibold mb-1 text-center">Selfie / Rosto Recortado</p>
              <img src={idVerification.portrait_image} alt="Rosto" className="w-full h-auto object-contain rounded" style={{ maxHeight: '200px' }} />
            </div>
          )}
          {faceMatch?.source_image && !idVerification?.portrait_image && (
            <div className="border p-2 rounded-lg">
              <p className="text-xs font-semibold mb-1 text-center">Rosto (Face Match)</p>
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
  
  // Stats state
  const [stats, setStats] = useState({
    users: 0,
    accounts: 0,
    statements: 0,
  })

  const fetchDashboardData = async () => {
    if (!session?.user?.accessToken) return
    try {
      setLoading(true)
      const token = session.user.accessToken
      
      // Fetch stats concurrently
      const [pendingRes, usersRes, accsRes, stmtsRes] = await Promise.all([
        accountApi.getPendingAccounts(token).catch(() => []),
        adminApi.getUsers(token, 1, 1).catch(() => ({ meta: { total: 0 } })),
        adminApi.getAccounts(token, 1, 1).catch(() => ({ meta: { total: 0 } })),
        adminApi.getStatements(token, 1, 1).catch(() => ({ meta: { total: 0 } }))
      ])
      
      setAccounts(pendingRes || [])
      setStats({
        users: usersRes?.meta?.total || 0,
        accounts: accsRes?.meta?.total || 0,
        statements: stmtsRes?.meta?.total || 0,
      })
    } catch (error) {
      toast.error('Erro ao buscar dados do dashboard')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [session])

  const handleApprove = async (id: string) => {
    if (!session?.user?.accessToken) return
    try {
      await accountApi.approveAccount(id, session.user.accessToken)
      toast.success('Conta aprovada com sucesso!')
      fetchDashboardData()
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
    return (
      <div className="animate-pulse space-y-6 max-w-7xl mx-auto p-6">
        <div className="h-10 w-48 bg-muted rounded"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-muted rounded-xl"></div>)}
        </div>
        <div className="h-96 bg-muted rounded-xl mt-8"></div>
      </div>
    )
  }

  const statCards = [
    { title: 'Usuários Cadastrados', value: stats.users, icon: Users, href: '/dashboard/admin/users', color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { title: 'Contas Bancárias', value: stats.accounts, icon: Building2, href: '/dashboard/admin/accounts', color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { title: 'Aprovações Pendentes', value: accounts.length, icon: Shield, href: '#pending', color: 'text-orange-500', bg: 'bg-orange-500/10' },
    { title: 'Total de Transações', value: stats.statements, icon: Activity, href: '/dashboard/admin/statements', color: 'text-green-500', bg: 'bg-green-500/10' },
  ]

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-10">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Painel de Administração
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Visão geral do sistema e controle de acessos da plataforma.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <Link href={stat.href} key={index}>
            <Card className="hover:shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer border-muted/60 bg-gradient-to-b from-background to-muted/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className={cn("w-12 h-12 rounded-full flex items-center justify-center", stat.bg)}>
                    <stat.icon className={cn("w-6 h-6", stat.color)} />
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground/40 group-hover:text-primary transition-colors" />
                </div>
                <div className="mt-4">
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <h3 className="text-3xl font-bold tracking-tight mt-1">{stat.value.toLocaleString('pt-BR')}</h3>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick Access Menu */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/dashboard/admin/users" className="group">
          <div className="flex items-center gap-4 p-4 rounded-xl border border-border/50 bg-card hover:bg-accent/50 transition-colors">
            <Users className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
            <div>
              <h4 className="font-semibold">Gerenciar Usuários</h4>
              <p className="text-xs text-muted-foreground">Bloqueios, LGPD, Perfis</p>
            </div>
          </div>
        </Link>
        <Link href="/dashboard/admin/accounts" className="group">
          <div className="flex items-center gap-4 p-4 rounded-xl border border-border/50 bg-card hover:bg-accent/50 transition-colors">
            <Building2 className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
            <div>
              <h4 className="font-semibold">Gerenciar Contas</h4>
              <p className="text-xs text-muted-foreground">Chaves OKX, Status</p>
            </div>
          </div>
        </Link>
        <Link href="/dashboard/admin/statements" className="group">
          <div className="flex items-center gap-4 p-4 rounded-xl border border-border/50 bg-card hover:bg-accent/50 transition-colors">
            <Activity className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
            <div>
              <h4 className="font-semibold">Extrato Global</h4>
              <p className="text-xs text-muted-foreground">Monitoria de Transações</p>
            </div>
          </div>
        </Link>
        <Link href="/dashboard/admin/virtual-accounts" className="group">
          <div className="flex items-center gap-4 p-4 rounded-xl border border-border/50 bg-card hover:bg-accent/50 transition-colors">
            <Database className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
            <div>
              <h4 className="font-semibold">Contas Virtuais</h4>
              <p className="text-xs text-muted-foreground">Chaves Pix e Wallets</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Pending Approvals Section */}
      <Card id="pending" className="border-muted shadow-sm mt-8">
        <CardHeader className="bg-muted/30 border-b">
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-orange-500" />
            Contas Pendentes de Aprovação (KYC)
          </CardTitle>
          <CardDescription>
            Contas que solicitaram abertura e necessitam de aprovação manual ou avaliação de fraude.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {accounts.length === 0 ? (
            <div className="text-center py-12">
              <ShieldCheck className="w-12 h-12 text-green-500/50 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-foreground">Tudo em dia!</h3>
              <p className="text-muted-foreground">Nenhuma conta aguardando aprovação no momento.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/20">
                    <TableHead className="pl-6">Data</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Tipo / Doc</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Docs Extras</TableHead>
                    <TableHead className="text-right pr-6">Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {accounts.map((account) => {
                    const status = account.dataCreation?.status || 'PENDING'
                    
                    return (
                    <TableRow key={account._id} className="hover:bg-muted/10 transition-colors">
                      <TableCell className="font-medium pl-6">
                        {new Date(account.createdAt).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-semibold">{account.ownerName || account.owner?.name}</span>
                          <span className="text-xs text-muted-foreground">{account.owner?.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col items-start gap-1">
                          <Badge variant="secondary" className="text-[10px] uppercase">
                            {account.businessAccount ? 'PJ' : 'PF'}
                          </Badge>
                          <span className="text-sm font-medium">{account.ownerDoc || account.owner?.doc}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={cn("px-2 py-1 text-xs", getStatusColor(status))}>
                          {getStatusLabel(status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="h-8 text-xs">
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
                                    <div key={index} className="flex flex-col gap-2 p-3 border rounded-lg bg-muted/50 hover:bg-muted/80 transition-colors">
                                      <span className="text-xs font-bold text-primary uppercase">{doc.type || 'Documento'}</span>
                                      <a 
                                        href={doc.url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 text-sm text-foreground hover:underline"
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
                      <TableCell className="text-right pr-6">
                        <div className="flex justify-end gap-2 items-center">
                          {account.dataCreation?.diditData && (
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button size="sm" variant="ghost" className="h-8">Ver KYC</Button>
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
                            disabled={status === 'PENDING_KYC'} 
                            className="h-8 bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 shadow-sm"
                          >
                            <CheckCircle className="w-4 h-4 mr-1.5" />
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
