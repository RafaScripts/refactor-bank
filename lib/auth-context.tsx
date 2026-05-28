'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import Cookies from 'js-cookie'

interface User {
  id: string
  name: string
  email: string
  doc: string
  type: 'PF' | 'PJ'
  status: string
  businessAccount: boolean
}

interface AuthContextType {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (token: string, user: User) => void
  logout: () => void
  updateUser: (user: User) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const TOKEN_KEY = 'refact_token'
const USER_KEY = 'refact_user'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Load from cookies on mount
    const savedToken = Cookies.get(TOKEN_KEY)
    const savedUser = Cookies.get(USER_KEY)
    
    if (savedToken && savedUser) {
      try {
        setToken(savedToken)
        setUser(JSON.parse(savedUser))
      } catch {
        // Invalid data, clear it
        Cookies.remove(TOKEN_KEY)
        Cookies.remove(USER_KEY)
      }
    }
    setIsLoading(false)
  }, [])

  const login = useCallback((newToken: string, newUser: User) => {
    setToken(newToken)
    setUser(newUser)
    Cookies.set(TOKEN_KEY, newToken, { expires: 7 })
    Cookies.set(USER_KEY, JSON.stringify(newUser), { expires: 7 })
  }, [])

  const logout = useCallback(() => {
    setToken(null)
    setUser(null)
    Cookies.remove(TOKEN_KEY)
    Cookies.remove(USER_KEY)
  }, [])

  const updateUser = useCallback((newUser: User) => {
    setUser(newUser)
    Cookies.set(USER_KEY, JSON.stringify(newUser), { expires: 7 })
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
