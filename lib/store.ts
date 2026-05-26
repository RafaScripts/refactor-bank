import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import Cookies from 'js-cookie'

interface User {
  id: string
  name: string
  email: string
}

interface BankAccount {
  externalId: string
  accountNumber: string
  branch: string
  status: string
  balance: number
  businessAccount?: boolean
}

interface Theme {
  primaryColor: string
  secondaryColor: string
  backgroundColor: string
  logoUrl: string
  faviconUrl: string
  fontFamily: string
  partnerName: string
}

interface AuthState {
  user: User | null
  token: string | null
  bankAccount: BankAccount | null
  theme: Theme | null
  isAuthenticated: boolean
  isLoading: boolean
  
  setAuth: (user: User, token: string, bankAccount: BankAccount | null) => void
  setTheme: (theme: Theme) => void
  setBankAccount: (account: BankAccount) => void
  logout: () => void
  setLoading: (loading: boolean) => void
}

const defaultTheme: Theme = {
  primaryColor: '#10B981',
  secondaryColor: '#059669',
  backgroundColor: '#0F172A',
  logoUrl: '',
  faviconUrl: '',
  fontFamily: 'Inter',
  partnerName: 'Refact Bank',
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      bankAccount: null,
      theme: defaultTheme,
      isAuthenticated: false,
      isLoading: true,
      
      setAuth: (user, token, bankAccount) => {
        Cookies.set('token', token, { expires: 7, secure: true, sameSite: 'strict' })
        set({ 
          user, 
          token, 
          bankAccount,
          isAuthenticated: true,
          isLoading: false,
        })
      },
      
      setTheme: (theme) => {
        // Apply theme CSS variables
        if (typeof document !== 'undefined') {
          const root = document.documentElement
          root.style.setProperty('--theme-primary', theme.primaryColor)
          root.style.setProperty('--theme-secondary', theme.secondaryColor)
          root.style.setProperty('--theme-background', theme.backgroundColor)
        }
        set({ theme })
      },
      
      setBankAccount: (account) => {
        set({ bankAccount: account })
      },
      
      logout: () => {
        Cookies.remove('token')
        set({ 
          user: null, 
          token: null, 
          bankAccount: null,
          isAuthenticated: false,
          isLoading: false,
        })
      },
      
      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: 'refact-bank-auth',
      partialize: (state) => ({ 
        user: state.user, 
        token: state.token,
        bankAccount: state.bankAccount,
        theme: state.theme,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
