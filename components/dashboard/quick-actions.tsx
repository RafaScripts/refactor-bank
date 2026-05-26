'use client'

import Link from 'next/link'
import { ArrowDownLeft, ArrowUpRight, FileBarChart, QrCode } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

const actions = [
  {
    name: 'Pix',
    description: 'Enviar ou receber',
    icon: QrCode,
    href: '/dashboard/pix',
    color: 'bg-emerald-500/10 text-emerald-500',
  },
  {
    name: 'Receber',
    description: 'Gerar cobrança',
    icon: ArrowDownLeft,
    href: '/dashboard/cashin',
    color: 'bg-blue-500/10 text-blue-500',
  },
  {
    name: 'Pagar',
    description: 'TED ou boleto',
    icon: ArrowUpRight,
    href: '/dashboard/cashout',
    color: 'bg-orange-500/10 text-orange-500',
  },
  {
    name: 'Extrato',
    description: 'Movimentações',
    icon: FileBarChart,
    href: '/dashboard/statement',
    color: 'bg-purple-500/10 text-purple-500',
  },
]

export function QuickActions() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {actions.map((action) => (
        <Link key={action.name} href={action.href}>
          <Card className="hover:bg-accent transition-colors cursor-pointer h-full">
            <CardContent className="p-4 flex flex-col items-center text-center gap-3">
              <div className={`w-12 h-12 rounded-xl ${action.color} flex items-center justify-center`}>
                <action.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="font-medium text-sm">{action.name}</p>
                <p className="text-xs text-muted-foreground">{action.description}</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}
