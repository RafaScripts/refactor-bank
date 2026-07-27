import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Shield, Terminal, Webhook, Code2, Cpu, CheckCircle } from 'lucide-react'
import { WorkflowAnimation } from '@/components/landing/workflow-animation'

const features = [
  {
    icon: Terminal,
    title: 'Gestão de Serviços e Contratos',
    description: 'Emita ordens de serviço, envie faturas e gerencie contratos direto pelo terminal do seu banco.',
  },
  {
    icon: Code2,
    title: 'Fluxo Global Sem Atrito',
    description: 'Feito para quem trabalha remoto. Receba pagamentos de clientes do mundo todo sem burocracia.',
  },
  {
    icon: Cpu,
    title: 'Híbrido: Fiat & Web3',
    description: 'Receba em cripto (USDC, Ethereum, Polygon) e pague despesas do dia a dia em Reais via Pix.',
  },
  {
    icon: Webhook,
    title: 'Auto-Conversão Imediata',
    description: 'Sem dor de cabeça com corretoras. Converta seus saldos Web3 para Fiat automaticamente.',
  },
  {
    icon: Shield,
    title: 'Segurança Institucional',
    description: 'Custódia forte de ativos, autenticação em duas etapas e compliance total de dados.',
  },
]

const benefits = [
  'Interface Dark-Mode Natively',
  'Comandos via Teclado (Cmd+K)',
  'Sem Taxas Ocultas',
  'Multi-moeda (Crypto/Fiat)',
  'Liquidez Imediata (Pix)',
  'Foco em Produtividade',
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background selection:bg-primary/20 selection:text-primary">
      {/* Header */}
      <header className="border-b border-border/50 sticky top-0 bg-background/80 backdrop-blur-sm z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-sm bg-foreground flex items-center justify-center">
                <span className="text-background font-bold text-lg font-mono">_R</span>
              </div>
              <span className="font-semibold text-xl text-foreground font-mono">Refact Bank</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button variant="ghost" className="font-mono text-xs uppercase tracking-wider">/login</Button>
              </Link>
              <Link href="/signup">
                <Button className="font-mono text-xs uppercase tracking-wider rounded-sm">Criar Conta</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-24 lg:py-32 relative overflow-hidden">
        {/* Technical background grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded border border-border bg-card/50 text-muted-foreground text-xs font-mono mb-8">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span>
              Sistemas Operacionais
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground mb-6 tracking-tight leading-tight">
              O banco definitivo para o <br />
              <span className="text-muted-foreground">profissional de tecnologia.</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl font-mono text-sm leading-relaxed">
              &gt; Gerencie contratos, ordens de serviço e pagamentos globais. Conversão imediata e sem atrito entre Reais e Cripto (Web3) num único ambiente desenhado para você.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Link href="/signup">
                <Button size="lg" className="w-full sm:w-auto h-12 px-8 rounded-sm font-mono text-sm uppercase">
                  Acessar Dashboard
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <div className="hidden sm:flex items-center gap-2 px-4 py-3 border border-border rounded-sm bg-card font-mono text-sm text-muted-foreground">
                <span className="text-primary">USDC</span> {'->'} BRL via Pix
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-card border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4 font-mono">
              // ferramentas
            </h2>
            <p className="text-muted-foreground max-w-2xl text-sm font-mono">
              Tudo que você precisa para gerenciar sua carreira internacional.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-border p-px">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="p-8 bg-card transition-colors hover:bg-accent/50 group"
              >
                <feature.icon className="w-8 h-8 text-primary mb-6 group-hover:scale-110 transition-transform" />
                <h3 className="text-lg font-semibold text-foreground mb-3 font-mono">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-24 relative">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] opacity-50 mask-image:linear-gradient(to_left,white,transparent)"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-6 font-mono">
                &lt;DeveloperExperience /&gt;
              </h2>
              <p className="text-muted-foreground mb-10 text-lg">
                Construído por engenheiros, para engenheiros. Nosso foco obcecado em DX significa que o banco sai do seu caminho para você focar no que importa: escrever código.
              </p>
              <div className="grid sm:grid-cols-2 gap-y-6 gap-x-4">
                {benefits.map((benefit) => (
                  <div key={benefit} className="flex items-center gap-3">
                    <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="text-sm font-mono text-muted-foreground">{benefit}</span>
                  </div>
                ))}
              </div>
              <div className="mt-12">
                <Link href="/signup">
                  <Button className="rounded-sm font-mono uppercase text-xs tracking-wide">
                    Criar Conta
                  </Button>
                </Link>
              </div>
            </div>
            
            {/* Animated UI Workflow */}
            <WorkflowAnimation />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <span className="text-sm font-mono text-muted-foreground">
                © {new Date().getFullYear()} Refact Bank // For tech professionals.
              </span>
            </div>
            <div className="flex items-center gap-6 text-sm font-mono text-muted-foreground">
              <Link href="/terms" className="hover:text-foreground transition-colors">
                /terms
              </Link>
              <Link href="/privacy" className="hover:text-foreground transition-colors">
                /privacy
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
