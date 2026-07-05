import { getPagination, getPaginationMeta } from "./pagination";

export function searchParams(request: Request) {
  return Object.fromEntries(new URL(request.url).searchParams.entries());
}

export function maybePaginated<T>(
  request: Request,
  key: string,
  items: T[],
  total: number,
) {
  const url = new URL(request.url);
  if (!url.searchParams.has("page") && !url.searchParams.has("limit")) return items;
  const pagination = getPagination({
    page: url.searchParams.get("page"),
    limit: url.searchParams.get("limit"),
  });
  return {
    [key]: items,
    items,
    pagination: getPaginationMeta(total, pagination),
  };
}

export function adminList<T>(request: Request, key: string, items: T[], total: number) {
  const url = new URL(request.url);
  const pagination = getPagination({
    page: url.searchParams.get("page"),
    limit: url.searchParams.get("limit"),
  });
  return {
    [key]: items,
    items,
    pagination: getPaginationMeta(total, pagination),
  };
}
