import { adminDeleteSimple, adminEnquiryGet } from "@/server/http/mutation-handlers";
import { adminEnquiryUpdateValidated } from "@/server/http/admin-extra-handlers";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  return adminEnquiryGet(id);
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  return adminEnquiryUpdateValidated(request, id);
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  return adminDeleteSimple("enquiries", id, "Enquiry");
}
