import { adminReadList } from "@/server/http/mutation-handlers";
import { adminCreateTourValidated } from "@/server/http/admin-tour-handlers";

export async function GET(request: Request) {
  return adminReadList("tours", request);
}

export const POST = adminCreateTourValidated;
