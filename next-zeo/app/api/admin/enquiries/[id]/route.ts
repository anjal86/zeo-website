import { adminDeleteSimple, adminEnquiryGet, adminEnquiryUpdate } from "@/server/http/mutation-handlers";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  return adminEnquiryGet(id);
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  return adminEnquiryUpdate(request, id);
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  return adminDeleteSimple("enquiries", id, "Enquiry");
}
