'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { adminApi } from '@/lib/admin.api'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { toast } from 'sonner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function AdminVirtualAccountsPage() {
  const { data: session } = useSession()
  const [data, setData] = useState<{ pixKeys: any[], wallets: any[] }>({ pixKeys: [], wallets: [] })
  const [loading, setLoading] = useState(true)

  const fetchAccounts = async () => {
    if (!session?.user?.accessToken) return
    try {
      setLoading(true)
      const res = await adminApi.getVirtualAccounts(session.user.accessToken, 1, 100)
      setData(res || { pixKeys: [], wallets: [] })
    } catch (error) {
      toast.error('Erro ao buscar contas virtuais')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAccounts()
  }, [session])

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Contas Virtuais</h1>
        <p className="text-muted-foreground mt-2">
          Gestão de Chaves Pix e Carteiras de Criptomoedas.
        </p>
      </div>

      <Tabs defaultValue="pix" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="pix">Chaves Pix</TabsTrigger>
          <TabsTrigger value="crypto">Carteiras Cripto</TabsTrigger>
        </TabsList>
        
        <TabsContent value="pix">
          <Card>
            <CardHeader>
              <CardTitle>Chaves Pix Registradas</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Carregando...</div>
              ) : data.pixKeys.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">Nenhuma chave encontrada.</div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data Criação</TableHead>
                        <TableHead>Chave</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Usuário</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.pixKeys.map((key) => (
                        <TableRow key={key._id}>
                          <TableCell>{new Date(key.createdAt).toLocaleDateString('pt-BR')}</TableCell>
                          <TableCell className="font-medium">{key.key}</TableCell>
                          <TableCell>{key.type}</TableCell>
                          <TableCell>{key.user?.name || 'Desconhecido'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="crypto">
          <Card>
            <CardHeader>
              <CardTitle>Carteiras de Cripto</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Carregando...</div>
              ) : data.wallets.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">Nenhuma carteira encontrada.</div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Endereço</TableHead>
                        <TableHead>Saldos</TableHead>
                        <TableHead>Usuário</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.wallets.map((wallet) => (
                        <TableRow key={wallet._id}>
                          <TableCell className="font-mono text-xs">{wallet.address}</TableCell>
                          <TableCell>
                            {Object.entries(wallet.balances || {}).map(([sym, bal]) => (
                              <div key={sym} className="text-xs">
                                <strong>{sym}:</strong> {String(bal)}
                              </div>
                            ))}
                          </TableCell>
                          <TableCell>{wallet.owner?.name || 'Desconhecido'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
