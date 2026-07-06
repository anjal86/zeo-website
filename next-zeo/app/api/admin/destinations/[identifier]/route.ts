import { adminDeleteDestination, adminGetDestination } from "@/server/http/mutation-handlers";
import { adminUpsertDestinationValidated } from "@/server/http/admin-content-handlers";

export async function GET(_request: Request, context: { params: Promise<{ identifier: string }> }) {
  const { identifier } = await context.params;
  return adminGetDestination(identifier);
}

export async function PUT(request: Request, context: { params: Promise<{ identifier: string }> }) {
  const { identifier } = await context.params;
  return adminUpsertDestinationValidated(request, identifier);
}

export async function DELETE(_request: Request, context: { params: Promise<{ identifier: string }> }) {
  const { identifier } = await context.params;
  return adminDeleteDestination(_request, identifier);
}
