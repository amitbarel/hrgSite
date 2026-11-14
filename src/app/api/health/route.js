// מתי השגרות רצו לאחרונה (לבדיקה ידנית: /api/health)
import { getHealth } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json(await getHealth(), { headers: { "Cache-Control": "no-store" } });
}
