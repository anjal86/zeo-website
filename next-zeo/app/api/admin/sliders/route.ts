import { adminListSliders } from "@/server/http/mutation-handlers";
import { adminUpsertSliderValidated } from "@/server/http/admin-extra-handlers";

export const GET = adminListSliders;

export function POST(request: Request) {
  return adminUpsertSliderValidated(request);
}
