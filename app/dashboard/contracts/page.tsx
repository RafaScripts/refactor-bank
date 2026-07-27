'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileSignature, Plus, Search, FileCheck, Clock, FileX } from 'lucide-react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency } from '@/lib/format'
import { cn } from '@/lib/utils'

interface Contract {
  _id: string
  osId: string
  title: string
  clientName: string
  amount: number
  status: string
  createdAt: string
}

export default function ContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchContracts() {
      try {
        const res = await fetch('/api/contracts')
        const json = await res.json()
        if (json.success) setContracts(json.data)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchContracts()
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SIGNED': return <FileCheck className="w-5 h-5 text-emerald-500" />
      case 'DRAFT': return <FileX className="w-5 h-5 text-muted-foreground" />
      default: return <Clock className="w-5 h-5 text-orange-500" />
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'SIGNED': return 'Assinado'
      case 'PENDING_CLIENT': return 'Aguardando Cliente'
      case 'PENDING_MANAGER': return 'Aguardando Você'
      default: return 'Rascunho'
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileSignature className="w-6 h-6 text-primary" />
            Contratos Digitais & O.S
          </h1>
          <p className="text-muted-foreground">
            Gerencie ordens de serviço, envie contratos legalmente válidos para seus clientes.
          </p>
        </div>
        <Link href="/dashboard/contracts/create">
          <Button className="w-full sm:w-auto hover:scale-[1.02] active:scale-95 transition-transform">
            <Plus className="w-4 h-4 mr-2" />
            Nova O.S
          </Button>
        </Link>
      </div>

      <Card className="border-border bg-card shadow-sm">
        <CardHeader className="border-b border-border p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Buscar contratos..." className="pl-9 max-w-sm bg-accent/50 border-transparent focus:border-primary" />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-4 space-y-4">
              <Skeleton className="h-16 w-full rounded-xl" />
              <Skeleton className="h-16 w-full rounded-xl" />
            </div>
          ) : contracts.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground flex flex-col items-center">
              <FileSignature className="w-12 h-12 mb-4 opacity-20" />
              <p>Você ainda não possui contratos criados.</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {contracts.map(contract => (
                <Link key={contract._id} href={`/dashboard/contracts/${contract._id}`} className="block group">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-accent/50 transition-colors gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
                        {getStatusIcon(contract.status)}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground group-hover:text-primary transition-colors">
                          {contract.title} <span className="text-muted-foreground font-normal text-sm">#{contract.osId}</span>
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Para: {contract.clientName}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:flex-col sm:items-end gap-1">
                      <p className="font-medium text-foreground">{formatCurrency(contract.amount)}</p>
                      <span className={cn(
                        "text-xs px-2 py-1 rounded-full font-medium border",
                        contract.status === 'SIGNED' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                        contract.status === 'DRAFT' ? "bg-muted text-muted-foreground border-border" :
                        "bg-orange-500/10 text-orange-500 border-orange-500/20"
                      )}>
                        {getStatusLabel(contract.status)}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
