export const fetchCache = 'force-no-store';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const { prisma } = require('@/lib/prisma');
    const municipios = await prisma.iss_rates.findMany({
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
