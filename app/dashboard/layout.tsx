'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Sidebar } from '@/components/dashboard/sidebar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { data: session, status } = useSession()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center animate-pulse">
            <span className="text-primary font-bold text-xl">R</span>
          </div>
          <p className="text-muted-foreground text-sm">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar />
      <main className="flex-1 lg:pl-0 min-h-screen">
        <div className="p-4 lg:p-8 pt-16 lg:pt-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
