import { NextResponse } from 'next/server';
import { getClients } from '@/lib/clients';

export async function GET() {
  const items = await getClients();
  return NextResponse.json({ items });
}
