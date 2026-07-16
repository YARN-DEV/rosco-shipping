import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const SHIPMENTS_FILE = path.join(DATA_DIR, 'shipments.json');

export interface Shipment {
  id: number;
  tracking_number: string;
  recipient_name: string;
  delivery_address: string;
  origin_country: string;
  sender_name: string;
  phone_number: string;
  company_email: string;
  company_name: string;
  created_at: string;
}

function generateTrackingNumber(): string {
  const digits = Math.floor(100000 + Math.random() * 900000);
  return `RS${digits}`;
}

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(SHIPMENTS_FILE)) {
    fs.writeFileSync(SHIPMENTS_FILE, JSON.stringify([], null, 2), 'utf-8');
  }
}

export function getAllShipments(): Shipment[] {
  ensureDataDir();
  const raw = fs.readFileSync(SHIPMENTS_FILE, 'utf-8');
  return JSON.parse(raw) as Shipment[];
}

export function addShipment(data: Omit<Shipment, 'id' | 'tracking_number' | 'created_at'>): Shipment {
  ensureDataDir();
  const shipments = getAllShipments();
  const newShipment: Shipment = {
    id: shipments.length > 0 ? shipments[shipments.length - 1].id + 1 : 1,
    tracking_number: generateTrackingNumber(),
    ...data,
    created_at: new Date().toISOString(),
  };
  shipments.push(newShipment);
  fs.writeFileSync(SHIPMENTS_FILE, JSON.stringify(shipments, null, 2), 'utf-8');
  return newShipment;
}
