import { NextResponse } from 'next/server'
import connectToDatabase from '@/lib/db'
import { Contract } from '@/lib/models/Contract'

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase()
    const body = await req.json()
    const { role, name, doc, diditVerified, diditLogId, geolocation } = body
    
    const contract = await Contract.findById(params.id)
    if (!contract) {
      return NextResponse.json({ success: false, error: 'Contract not found' }, { status: 404 })
    }

    // Coleta de Evidências (IP e User-Agent)
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1'
    const userAgent = req.headers.get('user-agent') || 'Unknown Device'

    // Adiciona a assinatura
    contract.signatures.push({
      role,
      name,
      doc,
      ip,
      userAgent,
      geolocation,
      diditVerified,
      diditLogId,
      signedAt: new Date()
    })

    // Atualiza o status do contrato baseado nas assinaturas
    const hasClient = contract.signatures.some((s: any) => s.role === 'CLIENT')
    const hasManager = contract.signatures.some((s: any) => s.role === 'MANAGER')

    if (hasClient && hasManager) {
      contract.status = 'SIGNED'
    } else if (hasClient) {
      contract.status = 'PENDING_MANAGER'
    } else if (hasManager) {
      contract.status = 'PENDING_CLIENT'
    }

    await contract.save()

    return NextResponse.json({ success: true, contract })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
