import { NextResponse } from "next/server";
import crypto from "crypto";

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || "aqblshnd";
const API_KEY = process.env.CLOUDINARY_API_KEY || "245254861749932";
const API_SECRET = process.env.CLOUDINARY_API_SECRET || "8Rb9MrEvkzgKIFgLd_kHC0YLEmc";

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    const folder = (form.get("folder") as string) || "general";
    const buffer = Buffer.from(await file.arrayBuffer());
    const base64 = buffer.toString("base64");
    const dataUri = `data:${file.type};base64,${base64}`;

    const timestamp = Math.round(Date.now() / 1000);
    const sigStr = `folder=${folder}&timestamp=${timestamp}${API_SECRET}`;
    const signature = crypto.createHash("sha1").update(sigStr).digest("hex");

    const body = new URLSearchParams();
    body.append("file", dataUri);
    body.append("api_key", API_KEY);
    body.append("timestamp", String(timestamp));
    body.append("signature", signature);
    body.append("folder", folder);
    body.append("resource_type", "auto");

    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`, {
      method: "POST",
      body,
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || "Cloudinary upload failed");

    return NextResponse.json({ url: data.secure_url, publicId: data.public_id });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
