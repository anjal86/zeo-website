import { adminDeleteDestination, adminGetDestination, adminUpsertDestination } from "@/server/http/mutation-handlers";

export async function GET(_request: Request, context: { params: Promise<{ identifier: string }> }) {
  const { identifier } = await context.params;
  return adminGetDestination(identifier);
}

export async function PUT(request: Request, context: { params: Promise<{ identifier: string }> }) {
  const { identifier } = await context.params;
  return adminUpsertDestination(request, identifier);
}

export async function DELETE(_request: Request, context: { params: Promise<{ identifier: string }> }) {
  const { identifier } = await context.params;
  return adminDeleteDestination(identifier);
}
