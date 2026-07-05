import { listLogos } from "@/server/repositories/company";
import { ok, serverError } from "@/server/http/api-response";

export async function GET() {
  try {
    return ok(await listLogos());
  } catch (error) {
    return serverError(error);
  }
}
