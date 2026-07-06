import { adminOnly, listKailashGallery } from "@/server/http/mutation-handlers";
import { adminGalleryCreateValidated } from "@/server/http/admin-extra-handlers";
import { ok } from "@/server/http/api-response";

export async function GET() {
  const denied = await adminOnly();
  if (denied) return denied;
  return ok(await listKailashGallery(true));
}

export const POST = adminGalleryCreateValidated;
