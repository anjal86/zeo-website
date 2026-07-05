import { adminReadList, adminUpsertDestination } from "@/server/http/mutation-handlers";

export async function GET(request: Request) {
  return adminReadList("destinations", request);
}

export function POST(request: Request) {
  return adminUpsertDestination(request);
}
