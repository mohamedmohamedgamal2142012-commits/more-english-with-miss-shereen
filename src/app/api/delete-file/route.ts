import { NextResponse } from "next/server";
import crypto from "crypto";

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || "aqblshnd";
const API_KEY = process.env.CLOUDINARY_API_KEY || "245254861749932";
const API_SECRET = process.env.CLOUDINARY_API_SECRET || "8Rb9MrEvkzgKIFgLd_kHC0YLEmc";

export async function POST(req: Request) {
  try {
    const { publicId, resourceType } = await req.json();
    if (!publicId) return NextResponse.json({ error: "No publicId provided" }, { status: 400 });

    const timestamp = Math.round(Date.now() / 1000);
    const sigStr = `public_id=${publicId}&timestamp=${timestamp}${API_SECRET}`;
    const signature = crypto.createHash("sha1").update(sigStr).digest("hex");

    const body = new URLSearchParams();
    body.append("public_id", publicId);
    body.append("api_key", API_KEY);
    body.append("timestamp", String(timestamp));
    body.append("signature", signature);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType || "image"}/upload/destroy`, {
      method: "POST",
      body,
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || "Cloudinary delete failed");

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
