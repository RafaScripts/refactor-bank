const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.refactbank.com.br'

class ApiClient {
  private baseUrl: string
  private accessKey: string | null

  constructor() {
    this.baseUrl = API_BASE_URL
    this.accessKey = typeof window !== 'undefined' 
      ? process.env.NEXT_PUBLIC_ACCESS_KEY || null 
      : null
  }

  private getHeaders(token?: string): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }

    if (this.accessKey) {
      headers['x-access-key'] = this.accessKey
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    return headers
  }

  async get<T>(endpoint: string, token?: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'GET',
      headers: this.getHeaders(token),
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`)
    }

    return response.json()
  }

  async post<T>(endpoint: string, data?: unknown, token?: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(token),
      body: data ? JSON.stringify(data) : undefined,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.message || `API Error: ${response.status}`)
    }

    return response.json()
  }

  async postFormData<T>(endpoint: string, formData: FormData, token?: string): Promise<T> {
    const headers: HeadersInit = {}
    
    if (this.accessKey) {
      headers['x-access-key'] = this.accessKey
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`)
    }

    return response.json()
  }
}

export const api = new ApiClient()

// Auth endpoints
export const authApi = {
  login: (email: string, password: string) => 
    api.post<LoginResponse>('/v1/iam/auth/login', { email, password }),
  
  signup: (data: SignupRequest) => 
    api.post<SignupResponse>('/v1/iam/users/signup', data),
}

// Tenant endpoints
export const tenantApi = {
  getTheme: (integrationKey: string) => 
    api.get<ThemeResponse>(`/v1/iam/tenant/${integrationKey}`),
}

// Account endpoints
export const accountApi = {
  getStatus: (token: string) => 
    api.get<AccountStatus>('/v1/core/account/status', token),
  
  requestAccount: (data: AccountRequest, token: string) => 
    api.post<AccountResponse>('/v1/core/account/request', data, token),
  
  uploadDocuments: (formData: FormData, token: string) => 
    api.postFormData<DocumentResponse>('/v1/core/account/documents', formData, token),
}

// Balance & Statement endpoints
export const balanceApi = {
  getBalance: (token: string) => 
    api.get<BalanceResponse>('/v1/core/balance', token),
  
  getStatement: (token: string, params?: StatementParams) => {
    const query = params 
      ? `?${new URLSearchParams(params as Record<string, string>).toString()}` 
      : ''
    return api.get<StatementResponse>(`/v1/core/statement${query}`, token)
  },
  
  getWallets: (token: string) => 
    api.get<WalletResponse[]>('/v1/core/wallet', token),
}

// Payments endpoints
export const paymentsApi = {
  // Cash In
  createPixCharge: (data: PixChargeRequest, token: string) => 
    api.post<PixChargeResponse>('/v1/payments/cashin/pix', data, token),
  
  createBoletoCharge: (data: BoletoChargeRequest, token: string) => 
    api.post<BoletoChargeResponse>('/v1/payments/cashin/boleto', data, token),
  
  // Cash Out
  sendPix: (data: PixSendRequest, token: string) => 
    api.post<TransactionResponse>('/v1/payments/cashout/pix', data, token),
  
  sendTransfer: (data: TransferRequest, token: string) => 
    api.post<TransactionResponse>('/v1/payments/cashout/transfer', data, token),
  
  payBoleto: (data: BoletoPayRequest, token: string) => 
    api.post<TransactionResponse>('/v1/payments/cashout/boleto', data, token),
}

// Crypto endpoints
export const cryptoApi = {
  getQuote: (data: QuoteRequest, token: string) => 
    api.post<QuoteResponse>('/v1/crypto/quote', data, token),
  
  buy: (data: CryptoBuyRequest, token: string) => 
    api.post<CryptoTransactionResponse>('/v1/crypto/buy', data, token),
  
  sell: (data: CryptoSellRequest, token: string) => 
    api.post<CryptoTransactionResponse>('/v1/crypto/sell', data, token),
  
  transfer: (data: CryptoTransferRequest, token: string) => 
    api.post<CryptoTransactionResponse>('/v1/crypto/transfer', data, token),
}

// Credits endpoints
export const creditsApi = {
  getProducts: (token: string) => 
    api.get<CreditProduct[]>('/v1/credits/products', token),
  
  requestCredit: (data: CreditRequest, token: string) => 
    api.post<CreditResponse>('/v1/credits/request', data, token),
}

// Approvals endpoints (PJ)
export const approvalsApi = {
  getPending: (token: string) => 
    api.get<PendingApproval[]>('/v1/core/approvals/pending', token),
  
  approve: (id: string, token: string) => 
    api.post<ApprovalResponse>(`/v1/core/approvals/${id}/approve`, undefined, token),
  
  reject: (id: string, token: string) => 
    api.post<ApprovalResponse>(`/v1/core/approvals/${id}/reject`, undefined, token),
}

// Types
export interface LoginResponse {
  accessToken: string
  user: {
    id: string
    name: string
    email: string
  }
  bankAccount: {
    externalId: string
    accountNumber: string
    branch: string
    status: string
    balance: number
  } | null
}

export interface SignupRequest {
  name: string
  email: string
  password: string
  doc: string
  type: 'PF' | 'PJ'
  withBankAccount?: boolean
  businessAccount?: boolean
  companyName?: string
  tradingName?: string
  companyType?: string
  cnae?: string
}

export interface SignupResponse {
  _id: string
  email: string
  doc: string
  username: string
  name: string
}

export interface ThemeResponse {
  primaryColor: string
  secondaryColor: string
  backgroundColor: string
  logoUrl: string
  faviconUrl: string
  fontFamily: string
  partnerName: string
}

export interface AccountStatus {
  status: 'APPROVED' | 'PENDING_REVIEW' | 'FAILED'
  provider: string
  accountNumber: string
  branch: string
}

export interface AccountRequest {
  type: 'PF' | 'PJ'
  name?: string
  email?: string
  doc?: string
  mobilePhone?: string
  incomeValue?: number
  companyName?: string
  tradingName?: string
  companyType?: string
  cnae?: string
  owner?: {
    name: string
    email: string
    doc: string
    mobilePhone: string
  }
  postalCode: string
  address: string
  addressNumber: string
  complement?: string
  province: string
  city: string
  state: string
}

export interface AccountResponse {
  _id: string
  businessAccount: boolean
  ownerName: string
  ownerDoc: string
  externalId: string
  accountNumber: string
  branch: string
  status: string
}

export interface DocumentResponse {
  success: boolean
  uploadedDocuments: string[]
}

export interface BalanceResponse {
  available: number
  pending: number
  blocked: number
  total: number
  currency: string
}

export interface StatementParams {
  startDate?: string
  endDate?: string
  type?: 'CASH_IN' | 'CASH_OUT'
  method?: 'PIX' | 'TED' | 'BOLETO'
  page?: string
  limit?: string
}

export interface Transaction {
  id: string
  type: 'CASH_IN' | 'CASH_OUT'
  method: 'PIX' | 'TED' | 'BOLETO' | 'INTERNAL'
  amount: number
  description: string
  counterparty: string
  date: string
  status: 'COMPLETED' | 'PENDING' | 'FAILED'
  transactionCode: string
}

export interface StatementResponse {
  transactions: Transaction[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface WalletResponse {
  currency: string
  symbol: string
  balance: number
  balanceBRL: number
}

export interface PixChargeRequest {
  amount: number
  description?: string
}

export interface PixChargeResponse {
  qrCode: string
  brCode: string
  expiresAt: string
}

export interface BoletoChargeRequest {
  amount: number
  dueDate: string
  description?: string
  payer: {
    name: string
    doc: string
    email?: string
  }
}

export interface BoletoChargeResponse {
  barCode: string
  digitableLine: string
  pdfUrl: string
  dueDate: string
}

export interface PixSendRequest {
  key: string
  keyType: 'CPF' | 'CNPJ' | 'EMAIL' | 'PHONE' | 'EVP'
  amount: number
  description?: string
}

export interface TransferRequest {
  bankCode: string
  branch: string
  accountNumber: string
  accountDigit: string
  accountType: 'CHECKING' | 'SAVINGS'
  doc: string
  name: string
  amount: number
  description?: string
}

export interface BoletoPayRequest {
  barCode: string
}

export interface TransactionResponse {
  id: string
  status: 'COMPLETED' | 'PENDING' | 'PENDING_APPROVAL'
  message?: string
}

export interface QuoteRequest {
  currency: 'BTC' | 'ETH'
  amount?: number
  amountBRL?: number
}

export interface QuoteResponse {
  currency: string
  price: number
  amount: number
  amountBRL: number
  fee: number
  total: number
}

export interface CryptoBuyRequest {
  currency: 'BTC' | 'ETH'
  amountBRL: number
}

export interface CryptoSellRequest {
  currency: 'BTC' | 'ETH'
  amount: number
}

export interface CryptoTransferRequest {
  currency: 'BTC' | 'ETH'
  amount: number
  recipientEmail: string
}

export interface CryptoTransactionResponse {
  id: string
  status: 'COMPLETED' | 'PENDING'
  amount: number
  currency: string
}

export interface CreditProduct {
  id: string
  name: string
  type: 'PERSONAL' | 'BUSINESS' | 'MICROCREDIT'
  minAmount: number
  maxAmount: number
  minInstallments: number
  maxInstallments: number
  interestRate: number
}

export interface CreditRequest {
  productId: string
  amount: number
  installments: number
}

export interface CreditResponse {
  id: string
  status: 'PENDING_ANALYSIS' | 'APPROVED' | 'REJECTED'
  installmentValue: number
  totalAmount: number
  cet: number
}

export interface PendingApproval {
  id: string
  type: 'PIX' | 'TED' | 'BOLETO'
  amount: number
  destination: string
  createdBy: string
  createdAt: string
  votesRequired: number
  votesReceived: number
}

export interface ApprovalResponse {
  id: string
  status: 'APPROVED' | 'REJECTED' | 'PENDING'
}
