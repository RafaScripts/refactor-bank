import { NextResponse } from 'next/server'
import connectToDatabase from '@/lib/db'
import { Contract } from '@/lib/models/Contract'
import { generateHash, signData } from '@/lib/crypto'

// Cria um novo contrato
export async function POST(req: Request) {
  try {
    await connectToDatabase()
    const body = await req.json()
    
    // Calcula o Hash do documento baseado no conteúdo vital do contrato
    const rawData = `${body.osId}-${body.title}-${body.amount}-${body.managerDoc}-${body.clientDoc}`
    const hash = generateHash(rawData)
    
    // Assinatura primária do sistema (criador) garantindo integridade
    const systemSignature = signData(hash)

    const contract = new Contract({
      ...body,
      status: 'PENDING_CLIENT',
      documentHash: hash,
      cryptographicSignature: systemSignature
    })

    await contract.save()

    return NextResponse.json({ success: true, contract }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating contract:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// Lista contratos
export async function GET(req: Request) {
  try {
    await connectToDatabase()
    
    // TODO: Em producao, filtrar pelo managerDoc baseado no Session
    const contracts = await Contract.find().sort({ createdAt: -1 })

    return NextResponse.json({ success: true, data: contracts })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
