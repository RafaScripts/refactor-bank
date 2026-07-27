import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Shield, Terminal, Webhook, Code2, Cpu, CheckCircle } from 'lucide-react'
import { WorkflowAnimation } from '@/components/landing/workflow-animation'
import { Header } from '@/components/landing/header'

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
      <Header />

      {/* Hero */}
      <section className="py-16 md:py-24 lg:py-32 relative overflow-hidden">
        {/* Technical background grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded border border-border bg-card/50 text-muted-foreground text-xs font-mono mb-6 md:mb-8">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span>
              Sistemas Operacionais
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-4 md:mb-6 tracking-tight leading-[1.1]">
              O banco definitivo para o <br className="hidden sm:block" />
              <span className="text-muted-foreground">profissional de tecnologia.</span>
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground mb-8 md:mb-10 max-w-2xl font-mono leading-relaxed">
              &gt; Gerencie contratos, ordens de serviço e pagamentos globais. Conversão imediata e sem atrito entre Reais e Cripto (Web3) num único ambiente desenhado para você.
            </p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <Link href="/signup" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto min-h-[48px] px-8 rounded-sm font-mono text-sm uppercase transition-transform hover:scale-[1.02] active:scale-95">
                  Acessar Dashboard
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <div className="hidden sm:flex items-center justify-center gap-2 px-4 py-3 min-h-[48px] border border-border rounded-sm bg-card font-mono text-sm text-muted-foreground">
                <span className="text-primary">USDC</span> {'->'} BRL via Pix
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 lg:py-24 bg-card border-y border-border relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10 md:mb-16">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4 font-mono">
              // ferramentas
            </h2>
            <p className="text-muted-foreground max-w-2xl text-xs sm:text-sm font-mono leading-relaxed">
              Tudo que você precisa para gerenciar sua carreira internacional.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-border p-px">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="p-6 md:p-8 bg-card transition-colors hover:bg-accent/50 group"
              >
                <feature.icon className="w-8 h-8 text-primary mb-5 md:mb-6 group-hover:scale-110 transition-transform duration-300" />
                <h3 className="text-base md:text-lg font-semibold text-foreground mb-2 md:mb-3 font-mono">{feature.title}</h3>
                <p className="text-muted-foreground text-xs md:text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 lg:py-24 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-full lg:w-1/2 h-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] opacity-50 mask-image:linear-gradient(to_bottom,white,transparent) lg:mask-image:linear-gradient(to_left,white,transparent) pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="order-2 lg:order-1">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4 md:mb-6 font-mono tracking-tight">
                &lt;DeveloperExperience /&gt;
              </h2>
              <p className="text-muted-foreground mb-8 md:mb-10 text-sm md:text-base leading-relaxed">
                Construído por engenheiros, para engenheiros. Nosso foco obcecado em DX significa que o banco sai do seu caminho para você focar no que importa: escrever código.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 md:gap-y-6 gap-x-4">
                {benefits.map((benefit) => (
                  <div key={benefit} className="flex items-center gap-3">
                    <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="text-xs md:text-sm font-mono text-muted-foreground">{benefit}</span>
                  </div>
                ))}
              </div>
              <div className="mt-10 md:mt-12">
                <Link href="/signup">
                  <Button className="w-full sm:w-auto min-h-[48px] rounded-sm font-mono uppercase text-xs tracking-wide transition-transform hover:scale-[1.02] active:scale-95">
                    Criar Conta
                  </Button>
                </Link>
              </div>
            </div>
            
            {/* Animated UI Workflow */}
            <div className="order-1 lg:order-2">
              <WorkflowAnimation />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 md:py-12 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 md:gap-6">
            <div className="flex items-center gap-3">
              <span className="text-xs md:text-sm font-mono text-muted-foreground text-center sm:text-left">
                © {new Date().getFullYear()} Refact Bank // For tech professionals.
              </span>
            </div>
            <div className="flex items-center gap-6 text-xs md:text-sm font-mono text-muted-foreground">
              <Link href="/terms" className="hover:text-foreground transition-colors p-2 -m-2">
                /terms
              </Link>
              <Link href="/privacy" className="hover:text-foreground transition-colors p-2 -m-2">
                /privacy
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
