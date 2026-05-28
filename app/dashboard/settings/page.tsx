'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { pixKeysApi, accountApi, type PixKey, type AccountStatus } from '@/lib/api'
import { formatCurrency } from '@/lib/format'
import { User, Key, Building2, Lock, Copy, Trash2, Plus, Loader2 } from 'lucide-react'

export default function SettingsPage() {
  const { data: session } = useSession()
  const user = session?.user
  const token = user?.accessToken

  const [pixKeys, setPixKeys] = useState<PixKey[]>([])
  const [loadingKeys, setLoadingKeys] = useState(true)
  const [showAddKey, setShowAddKey] = useState(false)
  const [newKeyType, setNewKeyType] = useState('EVP')
  const [addingKey, setAddingKey] = useState(false)
  const [accountStatus, setAccountStatus] = useState<AccountStatus | null>(null)
  const [loadingAccount, setLoadingAccount] = useState(true)

  useEffect(() => {
    if (!token) return
    const fetchKeys = async () => {
      setLoadingKeys(true)
      try {
        const data = await pixKeysApi.listKeys(token)
        setPixKeys(data || [])
      } catch (err) {
        console.error('Erro ao carregar chaves Pix:', err)
        setPixKeys([])
      } finally {
        setLoadingKeys(false)
      }
    }
    fetchKeys()
  }, [token])

  useEffect(() => {
    if (!token) return
    const fetchAccount = async () => {
      setLoadingAccount(true)
      try {
        const data = await accountApi.getStatus(token)
        setAccountStatus(data)
      } catch (err) {
        console.error('Erro ao carregar status da conta:', err)
        setAccountStatus(null)
      } finally {
        setLoadingAccount(false)
      }
    }
    fetchAccount()
  }, [token])

  const handleAddKey = async () => {
    if (!token) return
    setAddingKey(true)
    try {
      await pixKeysApi.createKey({ type: newKeyType }, token)
      const data = await pixKeysApi.listKeys(token)
      setPixKeys(data || [])
      setShowAddKey(false)
    } catch (err) {
      console.error('Erro ao criar chave:', err)
    } finally {
      setAddingKey(false)
    }
  }

  const handleDeleteKey = async (id: string) => {
    if (!token) return
    try {
      await pixKeysApi.deleteKey(id, token)
      setPixKeys(prev => prev.filter(k => k.id !== id))
    } catch (err) {
      console.error('Erro ao deletar chave:', err)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Configurações</h1>
        <p className="text-muted-foreground">Gerencie seus dados e preferências</p>
      </div>

      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Dados pessoais
          </CardTitle>
          <CardDescription>Informações do seu perfil</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input value={user?.name || ''} disabled />
            </div>
            <div className="space-y-2">
              <Label>E-mail</Label>
              <Input value={user?.email || ''} disabled />
            </div>
            <div className="space-y-2">
              <Label>CPF/CNPJ</Label>
              <Input value={user?.doc || ''} disabled />
            </div>
            <div className="space-y-2">
              <Label>Tipo de conta</Label>
              <Input value={user?.type === 'PJ' ? 'Pessoa Jurídica' : 'Pessoa Física'} disabled />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bank Account */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Dados bancários
          </CardTitle>
          <CardDescription>Informações da sua conta</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loadingAccount ? (
            <div className="grid sm:grid-cols-2 gap-4">
              <Skeleton className="h-10" />
              <Skeleton className="h-10" />
              <Skeleton className="h-10" />
              <Skeleton className="h-10" />
            </div>
          ) : accountStatus ? (
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Banco</Label>
                <Input value="Rich Capital" disabled />
              </div>
              <div className="space-y-2">
                <Label>Agência</Label>
                <Input value={accountStatus.branch} disabled />
              </div>
              <div className="space-y-2">
                <Label>Conta</Label>
                <Input value={accountStatus.accountNumber} disabled />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Input value={accountStatus.status} disabled />
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">Nenhuma conta bancária vinculada.</p>
          )}
        </CardContent>
      </Card>

      {/* Pix Keys */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Key className="w-5 h-5" />
              Chaves Pix
            </CardTitle>
            <CardDescription>Gerencie suas chaves Pix</CardDescription>
          </div>
          <Button size="sm" onClick={() => setShowAddKey(!showAddKey)}>
            <Plus className="w-4 h-4 mr-1" />
            Nova chave
          </Button>
        </CardHeader>
        <CardContent>
          {showAddKey && (
            <div className="mb-4 p-4 rounded-lg bg-accent/30 space-y-3">
              <Label>Tipo de chave</Label>
              <select
                value={newKeyType}
                onChange={(e) => setNewKeyType(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
              >
                <option value="EVP">Chave aleatória (EVP)</option>
                <option value="CPF">CPF</option>
                <option value="CNPJ">CNPJ</option>
                <option value="EMAIL">E-mail</option>
                <option value="PHONE">Telefone</option>
              </select>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleAddKey} disabled={addingKey}>
                  {addingKey ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Criar'}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setShowAddKey(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          )}

          {loadingKeys ? (
            <div className="space-y-2">
              {[...Array(2)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : pixKeys.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              Você ainda não possui chaves Pix cadastradas.
            </p>
          ) : (
            <div className="space-y-2">
              {pixKeys.map((key) => (
                <div
                  key={key.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border"
                >
                  <div>
                    <p className="font-medium text-sm">{key.type}</p>
                    <p className="text-xs text-muted-foreground font-mono">{key.key}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => copyToClipboard(key.key)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => handleDeleteKey(key.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Segurança
          </CardTitle>
          <CardDescription>Altere sua senha</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Para alterar sua senha, utilize a opção "Esqueci minha senha" na tela de login.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
