import { adminCreateTestimonialValidated, adminListTestimonialsPaginated } from "@/server/http/admin-patch-handlers";

export const GET = adminListTestimonialsPaginated;
export const POST = adminCreateTestimonialValidated;
