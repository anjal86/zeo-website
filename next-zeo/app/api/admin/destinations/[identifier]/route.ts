import { adminDeleteDestination, adminGetDestination } from "@/server/http/mutation-handlers";
import { adminUpsertDestinationValidated } from "@/server/http/admin-content-handlers";
import { adminPatchDestinationListed } from "@/server/http/admin-patch-handlers";

export async function GET(_request: Request, context: { params: Promise<{ identifier: string }> }) {
  const { identifier } = await context.params;
  return adminGetDestination(identifier);
}

export async function PUT(request: Request, context: { params: Promise<{ identifier: string }> }) {
  const { identifier } = await context.params;
  return adminUpsertDestinationValidated(request, identifier);
}

export async function PATCH(request: Request, context: { params: Promise<{ identifier: string }> }) {
  const { identifier } = await context.params;
  return adminPatchDestinationListed(request, identifier);
}

export async function DELETE(request: Request, context: { params: Promise<{ identifier: string }> }) {
  const { identifier } = await context.params;
  return adminDeleteDestination(request, identifier);
}
