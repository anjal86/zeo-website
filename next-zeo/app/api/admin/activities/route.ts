import { adminReadList } from "@/server/http/mutation-handlers";
import { adminUpsertActivityValidated } from "@/server/http/admin-content-handlers";

export async function GET(request: Request) {
  return adminReadList("activities", request);
}

export function POST(request: Request) {
  return adminUpsertActivityValidated(request);
}
