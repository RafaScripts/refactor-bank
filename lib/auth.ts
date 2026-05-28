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
            return null
          }

          const responseData = await response.json()
          
          // API returns { statusCode, message, data: { accessToken, user, bankAccount } }
          const data = responseData.data || responseData
          
          if (!data.accessToken) {
            return null
          }

          // Return user object with accessToken
          return {
            id: data.user?.id || data.user?._id || 'unknown',
            name: data.user?.name || '',
            email: data.user?.email || credentials.email as string,
            accessToken: data.accessToken,
            doc: data.user?.cpfCnpj || data.user?.doc || '',
            type: data.user?.type || 'PF',
            status: data.user?.status || 'PENDING',
            businessAccount: data.user?.businessAccount || data.bankAccount?.businessAccount || false,
            bankAccount: data.bankAccount || null,
            bankAccountId: data.bankAccount?._id || data.bankAccount?.id || null,
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.accessToken
        token.doc = user.doc
        token.type = user.type
        token.status = user.status
        token.businessAccount = user.businessAccount
        token.bankAccount = user.bankAccount
        token.bankAccountId = user.bankAccountId
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub || ''
        session.user.accessToken = token.accessToken as string
        session.user.doc = token.doc as string
        session.user.type = token.type as 'PF' | 'PJ'
        session.user.status = token.status as string
        session.user.businessAccount = token.businessAccount as boolean
        session.user.bankAccount = token.bankAccount as {
          externalId: string
          accountNumber: string
          branch: string
          status: string
          balance: number
        } | null
        session.user.bankAccountId = token.bankAccountId as string | null
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
    bankAccount: {
      externalId: string
      accountNumber: string
      branch: string
      status: string
      balance: number
    } | null
    bankAccountId: string | null
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
      bankAccount: {
        externalId: string
        accountNumber: string
        branch: string
        status: string
        balance: number
      } | null
      bankAccountId: string | null
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string
    doc?: string
    type?: 'PF' | 'PJ'
    status?: string
    businessAccount?: boolean
    bankAccount?: {
      externalId: string
      accountNumber: string
      branch: string
      status: string
      balance: number
    } | null
    bankAccountId?: string | null
  }
}
