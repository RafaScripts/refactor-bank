import { NextResponse } from 'next/server'
import connectToDatabase from '@/lib/db'
import { Contract } from '@/lib/models/Contract'

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase()
    
    const contract = await Contract.findById(params.id)
    
    if (!contract) {
      return NextResponse.json({ success: false, error: 'Contract not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: contract })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
