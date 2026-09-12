import { NextResponse } from "next/server";

// In-memory / fallback initial coupons list
let couponsStore = [
  { id: "1", code: "SAVE10", type: "PERCENTAGE", value: 10, minOrder: 100, expires: "2026-12-31", status: "Active" },
  { id: "2", code: "NEW50", type: "FIXED", value: 50, minOrder: 500, expires: "2026-12-31", status: "Active" },
  { id: "3", code: "SUMMER20", type: "PERCENTAGE", value: 20, minOrder: 200, expires: "2025-08-31", status: "Expired" },
];

export async function GET() {
  return NextResponse.json({ coupons: couponsStore });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code, type, value, minOrder, expires } = body;

    if (!code || !value) {
      return NextResponse.json({ error: "Code and value are required" }, { status: 400 });
    }

    const newCoupon = {
      id: String(Date.now()),
      code: String(code).toUpperCase().trim(),
      type: type || "PERCENTAGE",
      value: Number(value),
      minOrder: Number(minOrder || 0),
      expires: expires || "2026-12-31",
      status: "Active",
    };

    couponsStore.unshift(newCoupon);
    return NextResponse.json({ success: true, coupon: newCoupon });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to create coupon" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, status } = body;

    couponsStore = couponsStore.map((c) => (c.id === id ? { ...c, status } : c));
    return NextResponse.json({ success: true, coupons: couponsStore });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update coupon" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing coupon ID" }, { status: 400 });

    couponsStore = couponsStore.filter((c) => c.id !== id);
    return NextResponse.json({ success: true, coupons: couponsStore });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to delete coupon" }, { status: 500 });
  }
}
