import { NextResponse } from "next/server";

let storeSettings = {
  storeName: "PhoneStore",
  contactEmail: "admin@phonestore.com",
  phoneNumber: "+855 12 345 678",
  location: "Phnom Penh, Cambodia",
  enableKhqr: true,
  enableCod: true,
};

export async function GET() {
  return NextResponse.json({ settings: storeSettings });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    storeSettings = {
      ...storeSettings,
      ...body,
    };
    return NextResponse.json({ success: true, settings: storeSettings });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update settings" }, { status: 500 });
  }
}
