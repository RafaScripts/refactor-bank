'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command'
import {
  Settings,
  User,
  ArrowRightLeft,
  Banknote,
  Wallet,
  Bitcoin
} from 'lucide-react'

export function CommandMenu() {
  const [open, setOpen] = React.useState(false)
  const router = useRouter()

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  const runCommand = React.useCallback((command: () => unknown) => {
    setOpen(false)
    command()
  }, [])

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Digite um comando ou pesquise..." />
      <CommandList>
        <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
        <CommandGroup heading="Fiat">
          <CommandItem onSelect={() => runCommand(() => router.push('/dashboard/pix'))}>
            <ArrowRightLeft className="mr-2 h-4 w-4 text-success" />
            <span>Transferência Pix</span>
            <CommandShortcut>⌘P</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push('/dashboard/fiat'))}>
            <Banknote className="mr-2 h-4 w-4 text-success" />
            <span>Depositar Reais</span>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Web3">
          <CommandItem onSelect={() => runCommand(() => router.push('/dashboard/crypto'))}>
            <Bitcoin className="mr-2 h-4 w-4 text-crypto" />
            <span>Comprar Cripto</span>
            <CommandShortcut>⌘C</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push('/dashboard/crypto'))}>
            <Wallet className="mr-2 h-4 w-4 text-crypto" />
            <span>Ver Wallet Web3</span>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Ajustes">
          <CommandItem onSelect={() => runCommand(() => router.push('/dashboard/profile'))}>
            <User className="mr-2 h-4 w-4" />
            <span>Perfil</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push('/dashboard/settings'))}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Configurações API</span>
            <CommandShortcut>⌘S</CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
