import { NextRequest, NextResponse } from 'next/server';
import { getAllShipments } from '@/lib/db';

export async function GET(request: NextRequest) {
  const number = request.nextUrl.searchParams.get('number');

  if (!number) {
    return NextResponse.json({ error: 'Missing tracking number' }, { status: 400 });
  }

  try {
    const shipments = getAllShipments();
    const shipment = shipments.find(
      (s) => s.tracking_number.toUpperCase() === number.toUpperCase()
    );

    if (!shipment) {
      return NextResponse.json({ found: false }, { status: 404 });
    }

    return NextResponse.json({ found: true, data: shipment }, { status: 200 });
  } catch (error) {
    console.error('Track lookup error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
