import { z } from "zod";
import { subscribeNewsletter } from "@/server/repositories/catalog";
import { badRequest, created, serverError } from "@/server/http/api-response";

const schema = z.object({
  email: z.string().email(),
  name: z.string().trim().min(1).optional(),
  source: z.string().trim().min(1).optional(),
});

export async function POST(request: Request) {
  try {
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) return badRequest("Invalid newsletter payload", parsed.error.flatten());
    await subscribeNewsletter(parsed.data.email, parsed.data.name ?? null, parsed.data.source);
    return created({ success: true, message: "Subscribed successfully" });
  } catch (error) {
    return serverError(error);
  }
}
