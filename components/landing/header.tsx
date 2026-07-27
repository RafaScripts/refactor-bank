'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Menu, X } from 'lucide-react'

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <header className="border-b border-border/50 sticky top-0 bg-background/80 backdrop-blur-sm z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-sm bg-foreground flex items-center justify-center">
              <span className="text-background font-bold text-lg font-mono">_R</span>
            </div>
            <span className="font-semibold text-xl text-foreground font-mono">Refact Bank</span>
          </div>

          <nav className="hidden md:flex gap-8">
            <Link href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Ferramentas
            </Link>
            <Link href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Preços
            </Link>
            <Link href="/verify" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
              Validar Documento
            </Link>
          </nav>
          
          {/* Desktop Nav */}
          <div className="hidden sm:flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" className="font-mono text-xs uppercase tracking-wider min-h-[48px] sm:min-h-[40px]">/login</Button>
            </Link>
            <Link href="/signup">
              <Button className="font-mono text-xs uppercase tracking-wider rounded-sm min-h-[48px] sm:min-h-[40px]">Criar Conta</Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="sm:hidden flex items-center">
            <Button 
              variant="ghost" 
              size="icon" 
              className="min-h-[48px] min-w-[48px]"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {isMobileMenuOpen && (
        <div className="sm:hidden border-t border-border/50 bg-background animate-in slide-in-from-top-2">
          <div className="px-4 py-4 flex flex-col gap-4">
            <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
              <Button variant="outline" className="w-full font-mono text-xs uppercase tracking-wider h-12">
                /login
              </Button>
            </Link>
            <Link href="/signup" onClick={() => setIsMobileMenuOpen(false)}>
              <Button className="w-full font-mono text-xs uppercase tracking-wider rounded-sm h-12">
                Criar Conta
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
