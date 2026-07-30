'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Trash2, Ban, CheckCircle, Key } from 'lucide-react'

export default function AdminAccountsPage() {
  const { data: session } = useSession()
  const [accounts, setAccounts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  // OKX configuration modal
  const [selectedAccountForOkx, setSelectedAccountForOkx] = useState<any>(null)
  const [okxApiKey, setOkxApiKey] = useState('')
  const [okxSecretKey, setOkxSecretKey] = useState('')
  const [okxPassphrase, setOkxPassphrase] = useState('')
  const [savingOkx, setSavingOkx] = useState(false)

  const isSuperuser = session?.user?.permissions?.superuser

  const fetchAccounts = async () => {
    if (!session?.user?.accessToken) return
    try {
      setLoading(true)
      const res = await adminApi.getAccounts(session.user.accessToken, 1, 50, search)
      setAccounts(res.data || [])
    } catch (error) {
      toast.error('Erro ao buscar contas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAccounts()
  }, [session, search])

  const handleUpdateStatus = async (id: string, status: string) => {
    if (!session?.user?.accessToken || !isSuperuser) return
    if (!confirm(`Deseja alterar o status desta conta para ${status}?`)) return
    
    try {
      await adminApi.updateAccountStatus(id, status, session.user.accessToken)
      toast.success('Status da conta atualizado!')
      fetchAccounts()
    } catch (error: any) {
      toast.error(error.message || 'Erro ao atualizar conta')
    }
  }

  const handleDeleteLgpd = async (id: string) => {
    if (!session?.user?.accessToken || !isSuperuser) return
    if (!confirm('ATENÇÃO: Deseja realmente excluir esta CONTA DEFINITIVAMENTE do banco de dados (LGPD)? Esta ação não pode ser desfeita.')) return
    
    try {
      await adminApi.deleteAccountLgpd(id, session.user.accessToken)
      toast.success('Conta excluída permanentemente!')
      fetchAccounts()
    } catch (error: any) {
      toast.error(error.message || 'Erro ao excluir conta')
    }
  }

  const handleSaveOkxKeys = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session?.user?.accessToken || !isSuperuser || !selectedAccountForOkx) return

    setSavingOkx(true)
    try {
      await adminApi.updateOkxCredentials(
        selectedAccountForOkx._id,
        {
          apiKey: okxApiKey,
          secretKey: okxSecretKey,
          passphrase: okxPassphrase
        },
        session.user.accessToken
      )
      toast.success('Credenciais OKX salvas com sucesso!')
      setSelectedAccountForOkx(null)
      fetchAccounts()
    } catch (error: any) {
      toast.error(error.message || 'Erro ao salvar credenciais OKX')
    } finally {
      setSavingOkx(false)
    }
  }

  const openOkxModal = (acc: any) => {
    setSelectedAccountForOkx(acc)
    setOkxApiKey(acc.okxCredentials?.apiKey || '')
    setOkxSecretKey(acc.okxCredentials?.secretKey || '')
    setOkxPassphrase(acc.okxCredentials?.passphrase || '')
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Contas Bancárias</h1>
          <p className="text-muted-foreground mt-2">
            Gestão de contas, limites e status de aprovação KYC.
          </p>
        </div>
        <div className="w-72">
          <Input 
            placeholder="Buscar por nome ou número..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <div className="text-center py-8">Carregando...</div>
          ) : accounts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">Nenhuma conta encontrada.</div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Conta / Agência</TableHead>
                    <TableHead>Titular</TableHead>
                    <TableHead>Saldo Atual</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {accounts.map((acc) => (
                    <TableRow key={acc._id}>
                      <TableCell className="font-semibold">
                        {acc.accountNumber}-{acc.accountDigit} / {acc.branchCode}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{acc.ownerName}</span>
                          <span className="text-xs text-muted-foreground">{acc.ownerDoc}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format((acc.balance || 0) / 100)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={acc.dataCreation?.status === 'APPROVED' ? 'default' : acc.dataCreation?.status === 'BLOCKED' ? 'destructive' : 'secondary'}>
                          {acc.dataCreation?.status || 'PENDING'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleUpdateStatus(acc._id, 'APPROVED')}
                            disabled={!isSuperuser || acc.dataCreation?.status === 'APPROVED'}
                            title={isSuperuser ? "Aprovar Conta" : "Sem permissão"}
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleUpdateStatus(acc._id, 'BLOCKED')}
                            disabled={!isSuperuser || acc.dataCreation?.status === 'BLOCKED'}
                            title={isSuperuser ? "Bloquear Conta" : "Sem permissão"}
                          >
                            <Ban className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => openOkxModal(acc)}
                            disabled={!isSuperuser}
                            title={isSuperuser ? "Configurar Chaves OKX" : "Sem permissão"}
                          >
                            <Key className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive" 
                            onClick={() => handleDeleteLgpd(acc._id)}
                            disabled={!isSuperuser}
                            title={isSuperuser ? "Excluir Permanente (LGPD)" : "Sem permissão"}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedAccountForOkx} onOpenChange={(open) => !open && setSelectedAccountForOkx(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configurar Chaves OKX</DialogTitle>
            <DialogDescription>
              Configure as credenciais da OKX para a conta de {selectedAccountForOkx?.ownerName}. 
              Estas chaves serão utilizadas para conversão automática de PIX para USDT.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveOkxKeys} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key</Label>
              <Input 
                id="apiKey" 
                value={okxApiKey} 
                onChange={(e) => setOkxApiKey(e.target.value)} 
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="secretKey">Secret Key</Label>
              <Input 
                id="secretKey" 
                type="password"
                value={okxSecretKey} 
                onChange={(e) => setOkxSecretKey(e.target.value)} 
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="passphrase">Passphrase</Label>
              <Input 
                id="passphrase" 
                type="password"
                value={okxPassphrase} 
                onChange={(e) => setOkxPassphrase(e.target.value)} 
                required 
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="ghost" onClick={() => setSelectedAccountForOkx(null)}>Cancelar</Button>
              <Button type="submit" disabled={savingOkx}>
                {savingOkx ? 'Salvando...' : 'Salvar Chaves'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
