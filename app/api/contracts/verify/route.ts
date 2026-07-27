import { NextResponse } from 'next/server'
import connectToDatabase from '@/lib/db'
import { Contract } from '@/lib/models/Contract'
import { verifySignature } from '@/lib/crypto'

export async function POST(req: Request) {
  try {
    await connectToDatabase()
    const { documentHash, contractId } = await req.json()

    let contract
    if (contractId) {
      contract = await Contract.findById(contractId)
    } else if (documentHash) {
      contract = await Contract.findOne({ documentHash })
    }

    if (!contract) {
      return NextResponse.json({ success: false, error: 'Documento não encontrado na base de dados.' }, { status: 404 })
    }

    // A assinatura bate matematicamente com o hash salvo no servidor?
    const isValid = verifySignature(contract.documentHash, contract.cryptographicSignature)

    if (isValid) {
      return NextResponse.json({
        success: true,
        message: 'Assinatura validada e reconhecida pelo sistema.',
        contract: {
          title: contract.title,
          osId: contract.osId,
          status: contract.status,
          signatures: contract.signatures,
          createdAt: contract.createdAt,
          updatedAt: contract.updatedAt
        }
      })
    } else {
      return NextResponse.json({ success: false, error: 'Assinatura inválida ou documento adulterado.' }, { status: 400 })
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
