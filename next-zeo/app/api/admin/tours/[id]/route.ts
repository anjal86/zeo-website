import { adminDeleteTour, adminUpdateTour } from "@/server/http/mutation-handlers";

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  return adminUpdateTour(request, id);
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  return adminDeleteTour(id);
}
