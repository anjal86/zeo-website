import { getDirectorMessage } from "@/server/repositories/company";
import { ok, serverError } from "@/server/http/api-response";

export async function GET() {
  try {
    return ok(await getDirectorMessage());
  } catch (error) {
    return serverError(error);
  }
}
