'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FileSearch, ShieldCheck, AlertTriangle, Search, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function VerifyPage() {
  const [hash, setHash] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!hash) return
    
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const res = await fetch('/api/contracts/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentHash: hash })
      })
      const json = await res.json()
      
      if (json.success) {
        setResult(json.contract)
      } else {
        setError(json.error)
      }
    } catch (e) {
      setError('Erro ao comunicar com o servidor.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center py-20 px-4">
      <div className="w-full max-w-2xl space-y-8">
        
        <div className="text-center space-y-4">
          <Link href="/" className="inline-flex items-center gap-2 mb-4 text-primary hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-primary rounded flex items-center justify-center text-primary-foreground font-bold font-mono text-sm">
              /
            </div>
            <span className="font-bold text-xl tracking-tight text-foreground">Refactor</span>
          </Link>
          <h1 className="text-3xl font-bold text-foreground">Validador de Assinaturas</h1>
          <p className="text-muted-foreground">
            Verifique a integridade criptográfica e a validade de qualquer contrato gerado em nossa plataforma inserindo o Hash único do documento.
          </p>
        </div>

        <Card className="border-border shadow-lg">
          <CardHeader>
            <CardTitle>Verificar Documento</CardTitle>
            <CardDescription>Insira o código Hash (SHA-256) presente no rodapé do contrato.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleVerify} className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Ex: 8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92" 
                  className="pl-9 font-mono text-sm bg-accent/50 focus:bg-background"
                  value={hash}
                  onChange={e => setHash(e.target.value)}
                />
              </div>
              <Button type="submit" disabled={loading || !hash}>
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileSearch className="w-4 h-4 mr-2" />}
                Verificar
              </Button>
            </form>

            {error && (
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-destructive">Falha na Validação</h4>
                  <p className="text-sm text-destructive/90">{error}</p>
                </div>
              </div>
            )}

            {result && (
              <div className="p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-lg space-y-4">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-8 h-8 text-emerald-500" />
                  <div>
                    <h4 className="font-bold text-emerald-500 text-lg">Documento Íntegro e Válido</h4>
                    <p className="text-sm text-emerald-600 dark:text-emerald-400">
                      A assinatura digital criptográfica coincide com o documento original. Nenhuma adulteração foi detectada.
                    </p>
                  </div>
                </div>
                
                <div className="grid sm:grid-cols-2 gap-4 mt-4 pt-4 border-t border-emerald-500/10">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-semibold">Projeto / O.S</p>
                    <p className="font-medium">{result.title} (#{result.osId})</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-semibold">Status do Contrato</p>
                    <p className="font-medium">{result.status === 'SIGNED' ? 'Totalmente Assinado' : 'Assinaturas Pendentes'}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-xs text-muted-foreground uppercase font-semibold mb-2">Registro de Assinaturas</p>
                    <ul className="space-y-2">
                      {result.signatures.map((sig: any, idx: number) => (
                        <li key={idx} className="text-sm bg-background p-2 rounded border flex items-center justify-between">
                          <span><strong>{sig.name}</strong> ({sig.role === 'CLIENT' ? 'Cliente' : 'Gestor'})</span>
                          <span className="text-xs text-muted-foreground">{new Date(sig.signedAt).toLocaleString()}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  )
}
