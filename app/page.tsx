import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Shield, Zap, CreditCard, Bitcoin, Building2, CheckCircle } from 'lucide-react'

const features = [
  {
    icon: Zap,
    title: 'Pix instantâneo',
    description: 'Envie e receba dinheiro 24h por dia, 7 dias por semana',
  },
  {
    icon: CreditCard,
    title: 'Conta digital gratuita',
    description: 'Sem taxa de manutenção ou tarifas escondidas',
  },
  {
    icon: Bitcoin,
    title: 'Cripto integrado',
    description: 'Compre, venda e transfira Bitcoin e Ethereum',
  },
  {
    icon: Building2,
    title: 'Conta PJ completa',
    description: 'Gestão financeira para sua empresa com multi-aprovação',
  },
  {
    icon: Shield,
    title: 'Segurança avançada',
    description: 'Proteção com criptografia e autenticação em duas etapas',
  },
]

const benefits = [
  'Abertura de conta 100% digital',
  'Pix, TED e pagamento de boletos',
  'Cartão virtual para compras online',
  'Extrato detalhado em tempo real',
  'Suporte 24/7 via chat',
  'Integração com seu sistema via API',
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">R</span>
              </div>
              <span className="font-semibold text-xl text-foreground">Refact Bank</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button variant="ghost">Entrar</Button>
              </Link>
              <Link href="/signup">
                <Button>Abrir conta</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Zap className="w-4 h-4" />
              Conta digital completa para PF e PJ
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 text-balance">
              Sua conta bancária{' '}
              <span className="text-primary">100% digital</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto text-pretty">
              Abra sua conta em minutos, sem burocracia. Pix, TED, boletos, criptomoedas 
              e muito mais em um só lugar.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/signup">
                <Button size="lg" className="w-full sm:w-auto">
                  Abrir conta grátis
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Já tenho conta
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-card/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Tudo que você precisa em um banco digital
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Funcionalidades completas para gerenciar suas finanças pessoais ou empresariais
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Por que escolher o Refact Bank?
              </h2>
              <p className="text-muted-foreground mb-8">
                Somos uma plataforma bancária completa, desenvolvida para simplificar 
                sua vida financeira com tecnologia de ponta e segurança avançada.
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                {benefits.map((benefit) => (
                  <div key={benefit} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="text-sm text-foreground">{benefit}</span>
                  </div>
                ))}
              </div>
              <div className="mt-8">
                <Link href="/signup">
                  <Button>
                    Começar agora
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-3xl bg-gradient-to-br from-primary/20 via-card to-card border border-border overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-48 h-48 rounded-3xl bg-primary/10 flex items-center justify-center">
                    <div className="w-24 h-24 rounded-2xl bg-primary flex items-center justify-center">
                      <span className="text-primary-foreground font-bold text-4xl">R</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Pronto para começar?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Abra sua conta em menos de 5 minutos e tenha acesso a todas as funcionalidades.
          </p>
          <Link href="/signup">
            <Button size="lg">
              Abrir conta grátis
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">R</span>
              </div>
              <span className="text-sm text-muted-foreground">
                Refact Bank - Sua conta digital completa
              </span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link href="/terms" className="hover:text-foreground">
                Termos de uso
              </Link>
              <Link href="/privacy" className="hover:text-foreground">
                Privacidade
              </Link>
              <Link href="/help" className="hover:text-foreground">
                Ajuda
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
