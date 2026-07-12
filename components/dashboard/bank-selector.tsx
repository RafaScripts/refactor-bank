'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { usersApi } from '@/lib/api'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Building2, UserCircle, Plus, ChevronDown, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export function BankSelector() {
  const { data: session, update } = useSession()
  const router = useRouter()
  const [banks, setBanks] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  const fetchBanks = async () => {
    if (!session?.user?.accessToken) return
    try {
      setLoading(true)
      const res = await usersApi.getMe(session.user.accessToken)
        const validBanks = res.banks ? res.banks.filter((b: any) => b && b._id) : 
                           (res.data?.banks ? res.data.banks.filter((b: any) => b && b._id) : [])
        setBanks(validBanks)
        
        if (validBanks.length > 0 && session?.user) {
          const sessionBankExists = validBanks.find((b: any) => b._id === session.user.bankAccountId)
          if (!sessionBankExists) {
            const fallbackBankId = validBanks[validBanks.length - 1]._id
            await usersApi.selectBank(fallbackBankId, session.user.accessToken)
            await update({
              bankAccountId: fallbackBankId,
              bankAccountStatus: 'ACTIVE'
            })
          }
        }
    } catch (err) {
      console.error('Failed to fetch banks:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBanks()
  }, [session?.user?.accessToken])

  const handleSelect = async (bankId: string) => {
    if (!session?.user?.accessToken) return
    if (session.user.bankAccountId === bankId) return

    try {
      setLoading(true)
      // Call backend to select bank
      await usersApi.selectBank(bankId, session.user.accessToken)

      // Find selected bank in the array to get its status
      const selectedBank = banks.find((b) => b._id === bankId)
      
      // Update NextAuth session
      await update({
        bankAccountId: bankId,
        bankAccountStatus: selectedBank?.dataCreation?.status || 'PENDING',
        businessAccount: selectedBank?.type === 'PJ'
      })

      // Refresh router so pages can re-fetch with new bank selected
      router.refresh()
    } catch (err) {
      console.error('Failed to select bank:', err)
    } finally {
      setLoading(false)
    }
  }

  const currentBankId = session?.user?.bankAccountId
  const currentBank = banks.find((b) => b._id === currentBankId) || (banks.length > 0 ? banks[banks.length - 1] : null)

  if (!currentBank && banks.length === 0) {
    return (
      <div className="px-4 py-6 border-b border-border">
        <div className="h-10 bg-accent/50 animate-pulse rounded-lg flex items-center px-4">
          <span className="text-sm text-muted-foreground">Carregando contas...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="px-3 py-4 border-b border-border">
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="w-full justify-between h-auto py-2.5 px-3 hover:bg-accent/50">
            <div className="flex items-center gap-3 overflow-hidden text-left">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                {currentBank?.type === 'PJ' ? (
                  <Building2 className="w-4 h-4 text-primary" />
                ) : (
                  <UserCircle className="w-4 h-4 text-primary" />
                )}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-semibold truncate">
                  {currentBank?.type === 'PJ' ? 'Conta PJ' : 'Conta PF'}
                </span>
                <span className="text-xs text-muted-foreground truncate">
                  {currentBank?.accountNumber ? `C/C ${currentBank.accountNumber}` : 'Em análise / Criando...'}
                </span>
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-muted-foreground ml-2 opacity-50 flex-shrink-0" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-60" align="start" sideOffset={8}>
          <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Minhas Contas
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {banks.filter(b => b && b._id).map((bank) => (
            <DropdownMenuItem
              key={bank._id}
              onClick={() => handleSelect(bank._id)}
              className="flex items-center gap-3 cursor-pointer p-2 rounded-md my-1"
            >
              <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
                {bank.type === 'PJ' ? (
                  <Building2 className="w-4 h-4 text-foreground" />
                ) : (
                  <UserCircle className="w-4 h-4 text-foreground" />
                )}
              </div>
              <div className="flex flex-col flex-1 min-w-0">
                <span className="text-sm font-medium truncate">
                  {bank.type === 'PJ' ? 'Conta PJ' : 'Conta PF'}
                </span>
                <span className="text-xs text-muted-foreground truncate">
                  {bank.accountNumber ? `C/C ${bank.accountNumber}` : 'Em análise'}
                </span>
              </div>
              {currentBankId === bank._id && (
                <Check className="w-4 h-4 text-primary ml-auto" />
              )}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => router.push('/dashboard/onboarding')}
            className="flex items-center gap-3 cursor-pointer p-2 rounded-md text-primary hover:text-primary hover:bg-primary/5 focus:text-primary focus:bg-primary/5"
          >
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Plus className="w-4 h-4" />
            </div>
            <span className="font-medium text-sm">Nova Conta Bancária</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
