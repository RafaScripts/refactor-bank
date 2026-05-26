'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/lib/store'
import { approvalsApi, type PendingApproval } from '@/lib/api'
import { formatCurrency, formatDateTime } from '@/lib/format'
import { Check, X, Clock, AlertCircle, Loader2, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

// Mock data
const mockApprovals: PendingApproval[] = [
  {
    id: '1',
    type: 'PIX',
    amount: 15000,
    destination: 'João da Silva - CPF: ***.***.789-00',
    createdBy: 'Carlos Operador',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    votesRequired: 2,
    votesReceived: 1,
  },
  {
    id: '2',
    type: 'TED',
    amount: 50000,
    destination: 'Empresa ABC LTDA - Banco do Brasil Ag: 1234 Cc: 56789-0',
    createdBy: 'Ana Financeiro',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    votesRequired: 2,
    votesReceived: 0,
  },
  {
    id: '3',
    type: 'BOLETO',
    amount: 8500,
    destination: 'Conta de energia - CPFL',
    createdBy: 'Carlos Operador',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    votesRequired: 2,
    votesReceived: 1,
  },
]

export default function ApprovalsPage() {
  const { token, bankAccount } = useAuthStore()
  const [approvals, setApprovals] = useState<PendingApproval[]>(mockApprovals)
  const [selectedApproval, setSelectedApproval] = useState<PendingApproval | null>(null)
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleAction = async (approval: PendingApproval, action: 'approve' | 'reject') => {
    setSelectedApproval(approval)
    setActionType(action)
  }

  const confirmAction = async () => {
    if (!selectedApproval || !actionType || !token) return
    
    setIsLoading(true)
    try {
      if (actionType === 'approve') {
        await approvalsApi.approve(selectedApproval.id, token)
      } else {
        await approvalsApi.reject(selectedApproval.id, token)
      }
      
      // Update local state
      if (actionType === 'approve') {
        setApprovals(prev => prev.map(a => 
          a.id === selectedApproval.id 
            ? { ...a, votesReceived: a.votesReceived + 1 }
            : a
        ).filter(a => a.votesReceived < a.votesRequired))
      } else {
        setApprovals(prev => prev.filter(a => a.id !== selectedApproval.id))
      }
    } catch (error) {
      console.error('Erro ao processar aprovação:', error)
    } finally {
      setIsLoading(false)
      setSelectedApproval(null)
      setActionType(null)
    }
  }

  const totalPending = approvals.reduce((sum, a) => sum + a.amount, 0)

  // Check if user is admin (in a real app, this would come from the user's roles)
  const isAdmin = bankAccount?.businessAccount

  if (!isAdmin) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Aprovações</h1>
          <p className="text-muted-foreground">Gerencie transações pendentes de aprovação</p>
        </div>
        
        <Card className="bg-accent/30">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium text-foreground mb-2">Acesso restrito</p>
            <p className="text-muted-foreground">
              Esta área é exclusiva para administradores de contas empresariais.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Aprovações</h1>
        <p className="text-muted-foreground">Gerencie transações pendentes de aprovação</p>
      </div>

      {/* Summary */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pendentes</p>
                <p className="text-2xl font-bold">{approvals.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary font-bold">R$</span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Valor total pendente</p>
                <p className="text-2xl font-bold">{formatCurrency(totalPending)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Approvals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Transações aguardando aprovação
          </CardTitle>
          <CardDescription>
            Revise e aprove ou rejeite as transações criadas pelos operadores
          </CardDescription>
        </CardHeader>
        <CardContent>
          {approvals.length === 0 ? (
            <div className="p-8 text-center">
              <Check className="w-12 h-12 mx-auto mb-4 text-primary" />
              <p className="text-lg font-medium text-foreground mb-2">Nenhuma pendência</p>
              <p className="text-muted-foreground">
                Todas as transações foram processadas.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {approvals.map((approval) => (
                <div
                  key={approval.id}
                  className="p-4 rounded-lg border border-border bg-card hover:bg-accent/30 transition-colors"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "px-2 py-0.5 rounded text-xs font-medium",
                          approval.type === 'PIX' ? 'bg-emerald-500/10 text-emerald-500' :
                          approval.type === 'TED' ? 'bg-blue-500/10 text-blue-500' :
                          'bg-orange-500/10 text-orange-500'
                        )}>
                          {approval.type}
                        </span>
                        <span className="text-xl font-bold text-foreground">
                          {formatCurrency(approval.amount)}
                        </span>
                      </div>
                      <p className="text-sm text-foreground">{approval.destination}</p>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span>Criado por: {approval.createdBy}</span>
                        <span>{formatDateTime(approval.createdAt)}</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">Aprovações:</span>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: approval.votesRequired }).map((_, i) => (
                            <div
                              key={i}
                              className={cn(
                                "w-3 h-3 rounded-full",
                                i < approval.votesReceived ? 'bg-primary' : 'bg-muted'
                              )}
                            />
                          ))}
                        </div>
                        <span className="text-muted-foreground">
                          {approval.votesReceived}/{approval.votesRequired}
                        </span>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleAction(approval, 'reject')}
                        >
                          <X className="w-4 h-4 mr-1" />
                          Rejeitar
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleAction(approval, 'approve')}
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Aprovar
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="bg-accent/30">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-1">Como funciona a multi-aprovação</h3>
              <p className="text-sm text-muted-foreground">
                Transações acima do limite individual do operador ficam pendentes de aprovação pelos 
                administradores da conta. É necessário atingir o número mínimo de aprovações para que 
                a transação seja processada. Qualquer administrador pode rejeitar uma transação.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog open={!!selectedApproval && !!actionType} onOpenChange={() => {
        setSelectedApproval(null)
        setActionType(null)
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionType === 'approve' ? 'Confirmar aprovação' : 'Confirmar rejeição'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionType === 'approve' ? (
                <>
                  Você está prestes a aprovar uma transação de{' '}
                  <strong>{selectedApproval && formatCurrency(selectedApproval.amount)}</strong> via{' '}
                  <strong>{selectedApproval?.type}</strong>.
                  {selectedApproval && selectedApproval.votesReceived + 1 >= selectedApproval.votesRequired && (
                    <span className="block mt-2 text-primary">
                      Esta será a aprovação final e a transação será processada imediatamente.
                    </span>
                  )}
                </>
              ) : (
                <>
                  Você está prestes a rejeitar uma transação de{' '}
                  <strong>{selectedApproval && formatCurrency(selectedApproval.amount)}</strong>.
                  Esta ação não pode ser desfeita.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmAction}
              disabled={isLoading}
              className={actionType === 'reject' ? 'bg-destructive hover:bg-destructive/90' : ''}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : actionType === 'approve' ? (
                'Aprovar'
              ) : (
                'Rejeitar'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
