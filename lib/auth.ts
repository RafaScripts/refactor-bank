import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://apibank.rafascripts.dev.br'

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log('[AUTH] Missing credentials')
          return null
        }

        try {
          const response = await fetch(`${API_BASE_URL}/v1/iam/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-access-key': process.env.NEXT_PUBLIC_ACCESS_KEY || '',
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          })
          
          if (!response.ok) {
            console.log('[AUTH] Response not OK:', response.status)
            return null
          }

          const responseData = await response.json()
          console.log('[AUTH] Response data:', JSON.stringify(responseData, null, 2))
          
          // API returns { statusCode, message, data: { accessToken, user, bankAccount } }
          const data = responseData.data || responseData
          
          if (!data.accessToken) {
            console.log('[AUTH] No accessToken in response')
            return null
          }

          // Return minimal user object to keep JWT small (< 4KB cookie limit)
          // Store only essential fields; bankAccount details can be fetched via API
          const user = {
            id: data.user?.id || data.user?._id || 'unknown',
            name: data.user?.name || '',
            email: data.user?.email || credentials.email as string,
            accessToken: data.accessToken,
            doc: data.user?.cpfCnpj || data.user?.doc || '',
            type: data.user?.type || 'PF',
            status: data.user?.status || 'PENDING',
            businessAccount: data.user?.businessAccount || false,
            bankAccountId: data.bankAccount?._id || data.bankAccount?.id || null,
            bankAccountStatus: data.bankAccount?.status || 'PENDING',
            permissions: data.user?.permissions || null,
          }
          console.log('[AUTH] Returning user (minimal):', JSON.stringify(user, null, 2))
          return user
        } catch (error) {
          console.error('[AUTH] Error:', error)
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      console.log('[JWT CALLBACK] trigger:', trigger, 'hasUser:', !!user, 'token.sub:', token.sub)
      if (user) {
        token.accessToken = user.accessToken
        token.doc = user.doc
        token.type = user.type
        token.status = user.status
        token.businessAccount = user.businessAccount
        token.bankAccountId = user.bankAccountId
        token.bankAccountStatus = user.bankAccountStatus
        token.permissions = user.permissions
        console.log('[JWT CALLBACK] Token updated with user data')
      }
      
      if (trigger === 'update' && session) {
        if (session.bankAccountId !== undefined) {
          token.bankAccountId = session.bankAccountId
        }
        if (session.bankAccountStatus !== undefined) {
          token.bankAccountStatus = session.bankAccountStatus
        }
        if (session.businessAccount !== undefined) {
          token.businessAccount = session.businessAccount
        }
      }
      return token
    },
    async session({ session, token }) {
      console.log('[SESSION CALLBACK] token.sub:', token.sub, 'hasAccessToken:', !!token.accessToken)
      if (session.user) {
        session.user.id = token.sub || ''
        session.user.accessToken = token.accessToken as string
        session.user.doc = token.doc as string
        session.user.type = token.type as 'PF' | 'PJ'
        session.user.status = token.status as string
        session.user.businessAccount = token.businessAccount as boolean
        session.user.bankAccountId = token.bankAccountId as string | null
        session.user.bankAccountStatus = token.bankAccountStatus as string
        session.user.permissions = token.permissions as any
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  trustHost: true,
})

// Type augmentation for next-auth
declare module 'next-auth' {
  interface User {
    accessToken: string
    doc: string
    type: 'PF' | 'PJ'
    status: string
    businessAccount: boolean
    bankAccountId: string | null
    bankAccountStatus: string
    permissions: any
  }
  
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      accessToken: string
      doc: string
      type: 'PF' | 'PJ'
      status: string
      businessAccount: boolean
      bankAccountId: string | null
      bankAccountStatus: string
      permissions: any
    }
  }
}


