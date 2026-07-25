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
import { toast } from 'sonner'
import { ShieldAlert, Trash2, Ban } from 'lucide-react'

export default function AdminUsersPage() {
  const { data: session } = useSession()
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const isSuperuser = session?.user?.permissions?.superuser

  const fetchUsers = async () => {
    if (!session?.user?.accessToken) return
    try {
      setLoading(true)
      const res = await adminApi.getUsers(session.user.accessToken, 1, 50, search)
      setUsers(res.data || [])
    } catch (error) {
      toast.error('Erro ao buscar usuários')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [session, search])

  const handleBlock = async (id: string) => {
    if (!session?.user?.accessToken || !isSuperuser) return
    if (!confirm('Deseja realmente bloquear (Soft Delete) este usuário?')) return
    
    try {
      await adminApi.blockUser(id, session.user.accessToken)
      toast.success('Usuário bloqueado com sucesso!')
      fetchUsers()
    } catch (error: any) {
      toast.error(error.message || 'Erro ao bloquear usuário')
    }
  }

  const handleDeleteLgpd = async (id: string) => {
    if (!session?.user?.accessToken || !isSuperuser) return
    if (!confirm('ATENÇÃO: Deseja realmente excluir este usuário DEFINITIVAMENTE do banco de dados (LGPD)? Esta ação não pode ser desfeita e pode quebrar histórico financeiro.')) return
    
    try {
      await adminApi.deleteUserLgpd(id, session.user.accessToken)
      toast.success('Usuário excluído permanentemente!')
      fetchUsers()
    } catch (error: any) {
      toast.error(error.message || 'Erro ao excluir usuário')
    }
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Usuários</h1>
          <p className="text-muted-foreground mt-2">
            Gestão de clientes, visualização e bloqueios.
          </p>
        </div>
        <div className="w-72">
          <Input 
            placeholder="Buscar por nome, email ou CPF/CNPJ..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <div className="text-center py-8">Carregando...</div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">Nenhum usuário encontrado.</div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data Cadastro</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Documento</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((u) => (
                    <TableRow key={u._id}>
                      <TableCell>{new Date(u.createdAt).toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell className="font-semibold">{u.name}</TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell>{u.doc}</TableCell>
                      <TableCell>
                        <Badge variant={u.active ? 'default' : 'destructive'}>
                          {u.active ? 'Ativo' : 'Bloqueado'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleBlock(u._id)}
                            disabled={!isSuperuser || !u.active}
                            title={isSuperuser ? "Bloquear Usuário" : "Sem permissão"}
                          >
                            <Ban className="w-4 h-4 mr-2" />
                            Bloquear
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive" 
                            onClick={() => handleDeleteLgpd(u._id)}
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
    </div>
  )
}
