'use client';

import { useState, FormEvent } from 'react';

// Shipment tracking database
const SHIPMENTS: Record<string, {
  status: string;
  lastLocation: string;
  eta: string;
  route: string;
  weight?: string;
  senderName?: string;
  senderCompany?: string;
  senderAddress?: string;
  senderEmail?: string;
  receiverName?: string;
  receiverPhone?: string;
  deliveryAddress?: string;
}> = {
  'DNC471BC554780': {
    status: 'In Transit',
    lastLocation: 'Bronx, New York',
    eta: 'January 13, 2026',
    route: 'Berlin, Germany → United States (Air Freight)',
    weight: '50 KG',
    senderName: 'Stewart Sean Keith',
    senderCompany: 'Roscoe Shipping Company',
    senderAddress: 'Berlin, Germany',
    senderEmail: 'roscoshippingllcc@mail.com',
    receiverName: 'Harley Boeve',
    receiverPhone: '+1 231 557 2769',
    deliveryAddress: '126 Woodslee Ct, Norton Shores, MI, USA',
  },
  'GS123456': {
    status: 'In Transit',
    lastLocation: 'Hamburg, Germany',
    eta: 'December 15, 2025',
    route: 'Hamburg → Nairobi (Sea Freight)',
  },
  'GS789012': {
    status: 'Delivered',
    lastLocation: 'São Paulo, Brazil',
    eta: 'December 3, 2025',
    route: 'Madrid → São Paulo (Air Freight)',
  },
  'GS345678': {
    status: 'In Transit',
    lastLocation: 'New York, USA',
    eta: 'December 10, 2025',
    route: 'Rotterdam → New York (Sea Freight)',
  },
};

export default function TrackingForm() {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingInfo, setTrackingInfo] = useState<typeof SHIPMENTS[string] | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleTrack = async (e: FormEvent) => {
    e.preventDefault();

    const trimmedNumber = trackingNumber.trim().toUpperCase();

    setError('');
    setTrackingInfo(null);

    if (!trimmedNumber) {
      setError('Please enter a tracking number');
      return;
    }

    setIsLoading(true);

    try {
      // First check the live database
      const res = await fetch(`/api/track?number=${encodeURIComponent(trimmedNumber)}`);
      const json = await res.json();

      if (json.found && json.data) {
        const s = json.data;
        setTrackingInfo({
          status: 'In Transit',
          lastLocation: s.origin_country,
          eta: 'TBD',
          route: `${s.origin_country} → ${s.delivery_address}`,
          senderName: s.sender_name,
          senderCompany: s.company_name,
          senderEmail: s.company_email,
          receiverName: s.recipient_name,
          receiverPhone: s.phone_number,
          deliveryAddress: s.delivery_address,
        });
        setIsLoading(false);
        return;
      }
    } catch {
      // fall through to hardcoded lookup
    }

    // Fall back to hardcoded demo shipments
    setTimeout(() => {
      const shipment = SHIPMENTS[trimmedNumber];
      if (shipment) {
        setTrackingInfo(shipment);
      } else {
        setError('No shipment found with this tracking number');
      }
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div>
      {/* Tracking Form */}
      <form onSubmit={handleTrack} className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            placeholder="Enter tracking number (e.g., GS123456)"
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white px-8 py-3 rounded-lg font-semibold transition-colors whitespace-nowrap"
          >
            {isLoading ? 'Searching...' : 'Track'}
          </button>
        </div>
      </form>

      {/* Loading State */}
      {isLoading && (
        <div className="bg-blue-50 border border-blue-200 px-6 py-8 rounded-lg mb-6">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="text-blue-800 font-semibold">Searching for your shipment...</p>
            <p className="text-blue-600 text-sm">Please wait</p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && !isLoading && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          <p className="font-semibold">{error}</p>
        </div>
      )}

      {/* Tracking Results */}
      {trackingInfo && !isLoading && (
        <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-bold text-slate-800">Shipment Details</h3>
            <span className={`px-4 py-2 rounded-full font-semibold ${
              trackingInfo.status === 'Delivered' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-blue-100 text-blue-800'
            }`}>
              {trackingInfo.status}
            </span>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500 font-semibold mb-1">Last Known Location</p>
              <p className="text-lg text-slate-800">{trackingInfo.lastLocation}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 font-semibold mb-1">Estimated Arrival</p>
              <p className="text-lg text-slate-800">{trackingInfo.eta}</p>
            </div>
          </div>

          <div className="mt-4">
            <p className="text-sm text-gray-500 font-semibold mb-1">Route</p>
            <p className="text-lg text-slate-800">{trackingInfo.route}</p>
          </div>

          {trackingInfo.weight && (
            <div className="mt-4">
              <p className="text-sm text-gray-500 font-semibold mb-1">Weight</p>
              <p className="text-lg text-slate-800">{trackingInfo.weight}</p>
            </div>
          )}

          {/* Sender & Receiver Information */}
          {(trackingInfo.senderName || trackingInfo.receiverName) && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="text-lg font-bold text-slate-800 mb-4">Shipment Details</h4>
              <div className="grid md:grid-cols-2 gap-6">
                {/* Sender Information */}
                {trackingInfo.senderName && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h5 className="text-sm font-semibold text-blue-900 mb-2">Sender</h5>
                    <div className="space-y-1">
                      <p className="text-sm text-slate-800"><span className="font-semibold">Name:</span> {trackingInfo.senderName}</p>
                      {trackingInfo.senderCompany && (
                        <p className="text-sm text-slate-800"><span className="font-semibold">Company:</span> {trackingInfo.senderCompany}</p>
                      )}
                      {trackingInfo.senderEmail && (
                        <p className="text-sm text-slate-800"><span className="font-semibold">Email:</span> {trackingInfo.senderEmail}</p>
                      )}
                      {trackingInfo.senderAddress && (
                        <p className="text-sm text-slate-800"><span className="font-semibold">Address:</span> {trackingInfo.senderAddress}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Receiver Information */}
                {trackingInfo.receiverName && (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h5 className="text-sm font-semibold text-green-900 mb-2">Receiver</h5>
                    <div className="space-y-1">
                      <p className="text-sm text-slate-800"><span className="font-semibold">Name:</span> {trackingInfo.receiverName}</p>
                      {trackingInfo.receiverPhone && (
                        <p className="text-sm text-slate-800"><span className="font-semibold">Phone:</span> {trackingInfo.receiverPhone}</p>
                      )}
                      {trackingInfo.deliveryAddress && (
                        <p className="text-sm text-slate-800"><span className="font-semibold">Address:</span> {trackingInfo.deliveryAddress}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Timeline visualization */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-xs mt-2 text-gray-600">Shipped</p>
              </div>
              <div className="flex-1 h-1 bg-green-500 mx-2"></div>
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  trackingInfo.status === 'In Transit' ? 'bg-blue-500' : 'bg-green-500'
                }`}>
                  {trackingInfo.status === 'In Transit' ? (
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <p className="text-xs mt-2 text-gray-600">In Transit</p>
              </div>
              <div className={`flex-1 h-1 mx-2 ${trackingInfo.status === 'Delivered' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  trackingInfo.status === 'Delivered' ? 'bg-green-500' : 'bg-gray-300'
                }`}>
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-xs mt-2 text-gray-600">Delivered</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
