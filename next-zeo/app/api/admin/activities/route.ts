import { adminReadList, adminUpsertActivity } from "@/server/http/mutation-handlers";

export async function GET(request: Request) {
  return adminReadList("activities", request);
}

export function POST(request: Request) {
  return adminUpsertActivity(request);
}
