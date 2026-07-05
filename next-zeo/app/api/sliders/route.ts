import { listSliders } from "@/server/repositories/content";
import { ok, serverError } from "@/server/http/api-response";

export async function GET() {
  try {
    return ok(await listSliders());
  } catch (error) {
    return serverError(error);
  }
}
