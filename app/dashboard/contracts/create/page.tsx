'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { FileSignature, Loader2, ArrowLeft } from 'lucide-react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { contractsApi } from '@/lib/api'

export default function CreateContractPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    amount: '',
    clientName: '',
    clientDoc: '',
    clientEmail: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session?.user) return

    setLoading(true)
    try {
      const contractPayload = {
        osId: Math.floor(100000 + Math.random() * 900000).toString(), // Random 6-digit OS for now
        title: formData.title,
        description: formData.description,
        amount: Number(formData.amount),
        managerName: session.user.name || 'Desenvolvedor',
        managerDoc: (session.user as any).doc || '000.000.000-00', // Mock doc if not available
        clientName: formData.clientName,
        clientDoc: formData.clientDoc,
        clientEmail: formData.clientEmail,
      }

      const data = await contractsApi.createContract(contractPayload, '')
      if (data) {
        router.push(`/dashboard/contracts/${data._id}`)
      }
    } catch (error) {
      console.error(error)
      alert('Erro ao criar contrato.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/contracts">
          <Button variant="outline" size="icon" className="hover:bg-accent transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            Nova O.S / Contrato
          </h1>
          <p className="text-muted-foreground">
            Defina o escopo do projeto e os dados do cliente.
          </p>
        </div>
      </div>

      <Card className="border-border">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Detalhes da O.S</CardTitle>
            <CardDescription>Estes dados constarão no contrato digital assinado por ambas as partes.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground border-b border-border pb-2">O que será feito?</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2 sm:col-span-2">
                  <Label>Título do Projeto / Serviço</Label>
                  <Input name="title" required placeholder="Ex: Criação de Landing Page e API" value={formData.title} onChange={handleChange} className="bg-accent/50 focus:bg-background transition-colors" />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Descrição do Escopo (Aparecerá no Contrato)</Label>
                  <Textarea name="description" required placeholder="Detalhe os entregáveis, prazos e condições..." className="min-h-[120px] bg-accent/50 focus:bg-background transition-colors" value={formData.description} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label>Valor Acordado (R$)</Label>
                  <Input name="amount" type="number" required placeholder="5000" min="0" step="0.01" value={formData.amount} onChange={handleChange} className="bg-accent/50 focus:bg-background transition-colors" />
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <h3 className="font-semibold text-foreground border-b border-border pb-2">Dados do Cliente (Contratante)</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nome Completo / Razão Social</Label>
                  <Input name="clientName" required placeholder="Nome do cliente" value={formData.clientName} onChange={handleChange} className="bg-accent/50 focus:bg-background transition-colors" />
                </div>
                <div className="space-y-2">
                  <Label>CPF / CNPJ</Label>
                  <Input name="clientDoc" required placeholder="000.000.000-00" value={formData.clientDoc} onChange={handleChange} className="bg-accent/50 focus:bg-background transition-colors" />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>E-mail do Cliente (Para onde o link será enviado)</Label>
                  <Input name="clientEmail" type="email" required placeholder="cliente@exemplo.com" value={formData.clientEmail} onChange={handleChange} className="bg-accent/50 focus:bg-background transition-colors" />
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full hover:scale-[1.01] active:scale-95 transition-transform h-12" disabled={loading}>
              {loading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <FileSignature className="w-5 h-5 mr-2" />}
              Gerar Contrato e O.S
            </Button>
          </CardContent>
        </form>
      </Card>
    </div>
  )
}
