import { adminLogosGet } from "@/server/http/mutation-handlers";
import { adminLogosPutValidated } from "@/server/http/admin-extra-handlers";

export const GET = adminLogosGet;
export const PUT = adminLogosPutValidated;
