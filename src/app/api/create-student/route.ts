import { NextResponse } from "next/server";

const API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDWT_tlxSEhSJOVD9h5kRXqtvkVE19P928";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, returnSecureToken: true }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || "Failed to create user");

    return NextResponse.json({ success: true, uid: data.localId });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
