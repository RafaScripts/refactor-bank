'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useSession, signOut } from 'next-auth/react'
import {
  LayoutDashboard,
  ArrowDownLeft,
  ArrowUpRight,
  FileText,
  Bitcoin,
  CreditCard,
  Users,
  Settings,
  Shield,
  Building2,
  Activity,
  Database,
  LogOut,
  Menu,
  X,
  FileSignature
} from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

import { BankSelector } from '@/components/dashboard/bank-selector'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Contratos / O.S', href: '/dashboard/contracts', icon: FileSignature },
  { name: 'Receber', href: '/dashboard/cashin', icon: ArrowDownLeft },
  { name: 'Pagar', href: '/dashboard/cashout', icon: ArrowUpRight },
  { name: 'Extrato', href: '/dashboard/statement', icon: FileText },
  { name: 'Crypto & Câmbio', href: '/dashboard/crypto', icon: Bitcoin },
  { name: 'Crédito', href: '/dashboard/credit', icon: CreditCard },
]

const corporateNav = [
  { name: 'Aprovações', href: '/dashboard/approvals', icon: Users },
]

export function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [mobileOpen, setMobileOpen] = useState(false)
  
  const user = session?.user
  const isBusinessAccount = user?.businessAccount
  const isAdmin = user?.permissions?.admin || user?.permissions?.superuser || user?.permissions?.masterFinancial

  const NavContent = () => (
    <>
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-6 border-b border-border">
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
          <span className="text-primary-foreground font-bold text-lg">R</span>
        </div>
        <div className="flex flex-col">
          <span className="font-semibold text-foreground">Refact Bank</span>
          <span className="text-xs text-muted-foreground">Conta Digital</span>
        </div>
      </div>

      {/* Bank Selector */}
      <BankSelector />

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </Link>
          )
        })}

        {isBusinessAccount && (
          <>
            <div className="pt-4 pb-2">
              <span className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Corporativo
              </span>
            </div>
            {corporateNav.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </Link>
              )
            })}
          </>
        )}
      
        {isAdmin && (
          <>
            <div className="pt-4 pb-2">
              <span className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Administração
              </span>
            </div>
            <Link
              href="/dashboard/admin"
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                pathname === '/dashboard/admin'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              )}
            >
              <Shield className="w-5 h-5" />
              Painel Geral
            </Link>
            <Link
              href="/dashboard/admin/users"
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                pathname === '/dashboard/admin/users'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              )}
            >
              <Users className="w-5 h-5" />
              Usuários
            </Link>
            <Link
              href="/dashboard/admin/accounts"
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                pathname === '/dashboard/admin/accounts'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              )}
            >
              <Building2 className="w-5 h-5" />
              Contas
            </Link>
            <Link
              href="/dashboard/admin/statements"
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                pathname === '/dashboard/admin/statements'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              )}
            >
              <Activity className="w-5 h-5" />
              Movimentações
            </Link>
            <Link
              href="/dashboard/admin/virtual-accounts"
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                pathname === '/dashboard/admin/virtual-accounts'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              )}
            >
              <Database className="w-5 h-5" />
              Contas Virtuais
            </Link>
          </>
        )}

      </nav>

      {/* User Section */}
      <div className="border-t border-border p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
            <span className="text-foreground font-medium">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {user?.name || 'Usuário'}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user?.email || 'email@exemplo.com'}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/settings" className="flex-1" onClick={() => setMobileOpen(false)}>
            <Button variant="outline" size="sm" className="w-full">
              <Settings className="w-4 h-4 mr-2" />
              Ajustes
            </Button>
          </Link>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="bg-card"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        'fixed lg:static inset-y-0 left-0 z-40 w-64 bg-sidebar border-r border-sidebar-border flex flex-col transition-transform lg:translate-x-0',
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <NavContent />
      </aside>
    </>
  )
}
