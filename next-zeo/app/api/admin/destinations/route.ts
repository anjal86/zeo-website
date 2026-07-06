import { adminReadList } from "@/server/http/mutation-handlers";
import { adminUpsertDestinationValidated } from "@/server/http/admin-content-handlers";

export async function GET(request: Request) {
  return adminReadList("destinations", request);
}

export function POST(request: Request) {
  return adminUpsertDestinationValidated(request);
}
