import mongoose, { Schema, Document } from 'mongoose'

export interface ISignature {
  role: 'CLIENT' | 'MANAGER'
  name: string
  doc: string // CPF/CNPJ
  signedAt: Date
  ip: string
  userAgent: string
  geolocation?: string
  diditVerified?: boolean
  diditLogId?: string
}

export interface IContract extends Document {
  osId: string // Ordem de Servico ID ou Número
  title: string
  description: string
  amount: number
  currency: 'BRL' | 'BTC' | 'ETH'
  status: 'DRAFT' | 'PENDING_CLIENT' | 'PENDING_MANAGER' | 'SIGNED'
  managerName: string
  managerDoc: string
  clientName: string
  clientDoc: string
  clientEmail: string
  signatures: ISignature[]
  documentHash?: string
  cryptographicSignature?: string // Assinatura gerada pela nossa chave PEM sobre o documentHash
  createdAt: Date
  updatedAt: Date
}

const SignatureSchema = new Schema<ISignature>({
  role: { type: String, enum: ['CLIENT', 'MANAGER'], required: true },
  name: { type: String, required: true },
  doc: { type: String, required: true },
  signedAt: { type: Date, default: Date.now },
  ip: { type: String, required: true },
  userAgent: { type: String, required: true },
  geolocation: { type: String },
  diditVerified: { type: Boolean, default: false },
  diditLogId: { type: String },
})

const ContractSchema = new Schema<IContract>({
  osId: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  currency: { type: String, enum: ['BRL', 'BTC', 'ETH'], default: 'BRL' },
  status: { type: String, enum: ['DRAFT', 'PENDING_CLIENT', 'PENDING_MANAGER', 'SIGNED'], default: 'DRAFT' },
  managerName: { type: String, required: true },
  managerDoc: { type: String, required: true },
  clientName: { type: String, required: true },
  clientDoc: { type: String, required: true },
  clientEmail: { type: String, required: true },
  signatures: [SignatureSchema],
  documentHash: { type: String },
  cryptographicSignature: { type: String },
}, { timestamps: true })

export const Contract = mongoose.models.Contract || mongoose.model<IContract>('Contract', ContractSchema)
