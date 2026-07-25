'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { adminApi } from '@/lib/admin.api'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
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
import { ArrowUpRight, ArrowDownLeft } from 'lucide-react'

export default function AdminStatementsPage() {
  const { data: session } = useSession()
  const [statements, setStatements] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchStatements = async () => {
    if (!session?.user?.accessToken) return
    try {
      setLoading(true)
      const res = await adminApi.getStatements(session.user.accessToken, 1, 100)
      setStatements(res.data || [])
    } catch (error) {
      toast.error('Erro ao buscar movimentações')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStatements()
  }, [session])

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Movimentações Globais</h1>
        <p className="text-muted-foreground mt-2">
          Visão de todas as transferências, depósitos e cobranças na plataforma.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <div className="text-center py-8">Carregando...</div>
          ) : statements.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">Nenhuma movimentação registrada.</div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {statements.map((stmt) => {
                    const isCredit = stmt.amount > 0
                    return (
                      <TableRow key={stmt._id}>
                        <TableCell className="text-muted-foreground">
                          {new Date(stmt.createdAt).toLocaleString('pt-BR')}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-semibold">{stmt.user?.name || 'Sistema'}</span>
                            <span className="text-xs text-muted-foreground">{stmt.user?.doc}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={isCredit ? 'text-green-600' : 'text-red-600'}>
                            {isCredit ? <ArrowDownLeft className="w-3 h-3 mr-1" /> : <ArrowUpRight className="w-3 h-3 mr-1" />}
                            {isCredit ? 'Entrada' : 'Saída'}
                          </Badge>
                        </TableCell>
                        <TableCell>{stmt.description}</TableCell>
                        <TableCell className={`text-right font-semibold ${isCredit ? 'text-green-600' : ''}`}>
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stmt.amount / 100)}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
