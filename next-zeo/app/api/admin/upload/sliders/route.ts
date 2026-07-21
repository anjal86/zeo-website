import { uploadHandler } from "@/server/http/mutation-handlers";

export function POST(request: Request) {
  return uploadHandler(request, {
    folder: "sliders",
    entityType: "slider",
  });
}
