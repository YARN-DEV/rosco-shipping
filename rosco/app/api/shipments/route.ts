import { NextResponse } from 'next/server';
import { getAllShipments, addShipment } from '@/lib/db';

// GET /api/shipments — retrieve all shipment records
export async function GET() {
  try {
    const shipments = getAllShipments();
    return NextResponse.json({ success: true, data: shipments }, { status: 200 });
  } catch (error) {
    console.error('Error fetching shipments:', error);
    return NextResponse.json({ error: 'Failed to retrieve shipments' }, { status: 500 });
  }
}

// POST /api/shipments — save a new shipment record
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      recipient_name,
      delivery_address,
      origin_country,
      sender_name,
      phone_number,
      company_email,
      company_name,
    } = body;

    if (
      !recipient_name ||
      !delivery_address ||
      !origin_country ||
      !sender_name ||
      !phone_number ||
      !company_email ||
      !company_name
    ) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const shipment = addShipment({
      recipient_name,
      delivery_address,
      origin_country,
      sender_name,
      phone_number,
      company_email,
      company_name,
    });

    return NextResponse.json({ success: true, data: shipment }, { status: 201 });
  } catch (error) {
    console.error('Error saving shipment:', error);
    return NextResponse.json({ error: 'Failed to save shipment' }, { status: 500 });
  }
}
