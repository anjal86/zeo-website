import { adminReadList } from "@/server/http/mutation-handlers";
import { adminUpsertPostValidated } from "@/server/http/admin-content-handlers";

export async function GET(request: Request) {
  return adminReadList("posts", request);
}

export function POST(request: Request) {
  return adminUpsertPostValidated(request);
}
