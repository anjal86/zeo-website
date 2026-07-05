import { adminReadList, adminUpsertPost } from "@/server/http/mutation-handlers";

export async function GET(request: Request) {
  return adminReadList("posts", request);
}

export function POST(request: Request) {
  return adminUpsertPost(request);
}
