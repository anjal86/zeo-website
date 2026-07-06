import { adminDeletePost, adminGetPost } from "@/server/http/mutation-handlers";
import { adminUpsertPostValidated } from "@/server/http/admin-content-handlers";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  return adminGetPost(id);
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  return adminUpsertPostValidated(request, id);
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  return adminDeletePost(request, id);
}
