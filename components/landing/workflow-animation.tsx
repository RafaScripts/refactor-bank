'use client'

import { useEffect, useRef } from 'react'
import anime from 'animejs'
import { FileText, CheckCircle2, Wallet, RefreshCw, DollarSign } from 'lucide-react'

export function WorkflowAnimation() {
  const containerRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    if (!containerRef.current) return
    
    const tl = anime.timeline({
      loop: true,
      easing: 'easeInOutQuad',
    })
    
    // Reset initial state before starting
    anime.set('.anim-os-card', { opacity: 0, translateY: 20 })
    anime.set('.anim-status-draft', { opacity: 1, translateX: 0 })
    anime.set('.anim-status-signed', { opacity: 0, translateX: -10 })
    anime.set('.anim-status-paid', { opacity: 0, translateX: -10 })
    
    anime.set('.anim-crypto-card', { opacity: 0, translateY: 20 })
    anime.set('.anim-crypto-progress', { width: '0%' })
    anime.set('.anim-crypto-convert', { opacity: 0, translateY: 10 })
    
    anime.set('.anim-fiat-card', { opacity: 0, translateY: 20 })
    anime.set('.anim-fiat-pix', { opacity: 0, scale: 0.8 })
    
    // Phase 1: Ordem de Servico
    tl.add({
      targets: '.anim-os-card',
      opacity: [0, 1],
      translateY: [20, 0],
      duration: 600,
    })
    .add({
      targets: '.anim-status-draft',
      opacity: 0,
      duration: 300,
      delay: 800
    })
    .add({
      targets: '.anim-status-signed',
      opacity: [0, 1],
      translateX: [-10, 0],
      duration: 400,
    }, '-=100')
    .add({
      targets: '.anim-status-signed',
      opacity: 0,
      duration: 300,
      delay: 800
    })
    .add({
      targets: '.anim-status-paid',
      opacity: [0, 1],
      translateX: [-10, 0],
      duration: 400,
    }, '-=100')
    .add({
      targets: '.anim-os-card',
      opacity: 0,
      translateY: -20,
      duration: 500,
      delay: 1000
    })
    
    // Phase 2: Crypto Flow
    .add({
      targets: '.anim-crypto-card',
      opacity: [0, 1],
      translateY: [20, 0],
      duration: 600,
    })
    .add({
      targets: '.anim-crypto-progress',
      width: ['0%', '100%'],
      duration: 1200,
      easing: 'linear'
    })
    .add({
      targets: '.anim-crypto-convert',
      opacity: [0, 1],
      translateY: [10, 0],
      duration: 400,
      delay: 200
    })
    .add({
      targets: '.anim-crypto-card',
      opacity: 0,
      translateY: -20,
      duration: 500,
      delay: 1500
    })
    
    // Phase 3: Fiat Flow
    .add({
      targets: '.anim-fiat-card',
      opacity: [0, 1],
      translateY: [20, 0],
      duration: 600,
    })
    .add({
      targets: '.anim-fiat-pix',
      scale: [0.8, 1],
      opacity: [0, 1],
      duration: 600,
      easing: 'easeOutElastic(1, .6)',
      delay: 400
    })
    .add({
      targets: '.anim-fiat-card',
      opacity: 0,
      translateY: -20,
      duration: 500,
      delay: 1500
    })
    
    return () => {
      tl.pause()
    }
  }, [])

  return (
    <div ref={containerRef} className="relative w-full h-[340px] bg-card border border-border rounded-md shadow-2xl p-6 flex flex-col justify-center items-center overflow-hidden">
      
      {/* Window Controls */}
      <div className="absolute top-4 left-4 flex gap-2">
        <div className="w-3 h-3 rounded-full bg-destructive/80" />
        <div className="w-3 h-3 rounded-full bg-warning/80" />
        <div className="w-3 h-3 rounded-full bg-success/80" />
      </div>

      {/* Background decoration */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none"></div>
      
      {/* Phase 1: OS Card */}
      <div className="anim-os-card absolute w-full max-w-[280px] bg-background border border-border rounded-md p-4 shadow-lg z-10">
        <div className="flex items-center gap-2 text-muted-foreground mb-4">
          <FileText className="w-4 h-4 text-primary" />
          <span className="text-xs font-mono font-medium tracking-wider">OS #4092</span>
        </div>
        <p className="font-medium text-sm text-foreground mb-1">Engenharia de Software</p>
        <p className="text-xl font-bold text-foreground mb-4 font-mono">$5,000.00 USDC</p>
        
        <div className="relative h-[24px]">
          <div className="anim-status-draft absolute inset-0 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-warning animate-pulse"></span>
            <span className="text-xs font-mono text-muted-foreground">Drafting...</span>
          </div>
          <div className="anim-status-signed absolute inset-0 flex items-center gap-2 opacity-0">
            <span className="w-2 h-2 rounded-full bg-primary"></span>
            <span className="text-xs font-mono text-primary">Contrato Assinado</span>
          </div>
          <div className="anim-status-paid absolute inset-0 flex items-center gap-2 opacity-0">
            <CheckCircle2 className="w-4 h-4 text-success" />
            <span className="text-xs font-mono text-success">Fatura Paga</span>
          </div>
        </div>
      </div>

      {/* Phase 2: Crypto */}
      <div className="anim-crypto-card absolute w-full max-w-[280px] bg-background border border-crypto rounded-md p-4 shadow-[0_0_20px_rgba(139,92,246,0.1)] z-10 opacity-0">
        <div className="flex items-center gap-2 mb-4 text-crypto">
          <Wallet className="w-4 h-4" />
          <span className="text-xs font-mono font-medium tracking-wider">Inbound Web3</span>
        </div>
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-muted-foreground font-medium">USDC Deposit</span>
          <span className="text-sm font-bold text-foreground font-mono">+5,000.00</span>
        </div>
        <div className="h-1 w-full bg-border rounded-full overflow-hidden mb-4">
          <div className="anim-crypto-progress h-full bg-crypto w-0"></div>
        </div>
        <div className="anim-crypto-convert opacity-0 flex items-center gap-2 bg-crypto/10 text-crypto text-xs font-mono p-2 rounded-sm border border-crypto/20">
          <RefreshCw className="w-3 h-3 animate-spin" />
          <span>Auto-convertendo...</span>
        </div>
      </div>

      {/* Phase 3: Fiat */}
      <div className="anim-fiat-card absolute w-full max-w-[280px] bg-background border border-success rounded-md p-4 shadow-[0_0_20px_rgba(16,185,129,0.1)] z-10 opacity-0">
        <div className="flex items-center gap-2 mb-4 text-success">
          <DollarSign className="w-4 h-4" />
          <span className="text-xs font-mono font-medium tracking-wider">Pix Liquidação</span>
        </div>
        <div className="anim-fiat-pix flex items-center gap-4 bg-success/10 p-3 rounded-md border border-success/20 opacity-0">
          <div className="w-8 h-8 rounded-full bg-success/20 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-success" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-mono mb-1">Saldo atualizado</p>
            <p className="text-sm font-bold text-success font-mono">+ R$ 26.540,00</p>
          </div>
        </div>
      </div>

    </div>
  )
}
