import { adminReadList } from "@/server/http/mutation-handlers";

export async function GET(request: Request) {
  return adminReadList("leads", request);
}
