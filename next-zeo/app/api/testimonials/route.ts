import { listTestimonials } from "@/server/repositories/content";
import { ok, serverError } from "@/server/http/api-response";

export async function GET() {
  try {
    return ok(await listTestimonials());
  } catch (error) {
    return serverError(error);
  }
}
