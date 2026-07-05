import { adminCreateTour, adminReadList } from "@/server/http/mutation-handlers";

export async function GET(request: Request) {
  return adminReadList("tours", request);
}

export const POST = adminCreateTour;
