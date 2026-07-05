import { listKailashGallery } from "@/server/repositories/company";
import { ok, serverError } from "@/server/http/api-response";

export async function GET() {
  try {
    return ok(await listKailashGallery());
  } catch (error) {
    return serverError(error);
  }
}
