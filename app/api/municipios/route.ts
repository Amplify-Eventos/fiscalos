import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const municipios = await prisma.issRate.findMany({
      orderBy: [
        { stateCode: 'asc' },
        { cityName: 'asc' }
      ]
    })
    
    return NextResponse.json(municipios)
  } catch (error) {
    console.error('Erro ao buscar municípios:', error)
    return NextResponse.json({ error: 'Erro ao buscar municípios' }, { status: 500 })
  }
}
