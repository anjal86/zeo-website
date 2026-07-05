import { NextResponse } from "next/server";

type ErrorBody = {
  error: string;
  code?: string;
  details?: unknown;
};

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, init);
}

export function created<T>(data: T) {
  return NextResponse.json(data, { status: 201 });
}

export function errorResponse(message: string, status = 500, details?: unknown) {
  const body: ErrorBody = { error: message };
  if (details !== undefined) body.details = details;
  return NextResponse.json(body, { status });
}

export function notFound(message = "Not found") {
  return errorResponse(message, 404);
}

export function badRequest(message = "Bad request", details?: unknown) {
  return errorResponse(message, 400, details);
}

export function unauthorized(message = "Authentication required") {
  return errorResponse(message, 401);
}

export function forbidden(message = "Admin access required") {
  return errorResponse(message, 403);
}

export function serverError(error: unknown) {
  console.error(error);
  return errorResponse("Internal server error", 500);
}
