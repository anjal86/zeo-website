import { adminListSliders, adminUpsertSlider } from "@/server/http/mutation-handlers";

export const GET = adminListSliders;

export function POST(request: Request) {
  return adminUpsertSlider(request);
}
