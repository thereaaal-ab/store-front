import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

/**
 * Debug endpoint to verify storefront env and Supabase product visibility.
 * Open: https://your-storefront.up.railway.app/api/debug-storefront
 * Remove or protect this route in production if you prefer.
 */
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const hasSupabaseUrl = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const hasServiceRoleKey = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);

  const payload: {
    ok: boolean;
    env: { hasSupabaseUrl: boolean; hasServiceRoleKey: boolean };
    products?: { total: number; published: number };
    error?: string;
  } = {
    ok: hasSupabaseUrl && hasServiceRoleKey,
    env: { hasSupabaseUrl, hasServiceRoleKey },
  };

  if (!hasSupabaseUrl || !hasServiceRoleKey) {
    return NextResponse.json(payload, { status: 200 });
  }

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    );

    const [totalRes, publishedRes] = await Promise.all([
      supabase.from("products").select("*", { count: "exact", head: true }),
      supabase
        .from("products")
        .select("*", { count: "exact", head: true })
        .eq("is_published", true),
    ]);

    const total = totalRes.count ?? 0;
    const published = publishedRes.count ?? 0;

    payload.products = { total, published };
    return NextResponse.json(payload, { status: 200 });
  } catch (err) {
    payload.error = err instanceof Error ? err.message : String(err);
    return NextResponse.json(payload, { status: 200 });
  }
}
