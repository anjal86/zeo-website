export type PaginationInput = {
  page?: string | null;
  limit?: string | null;
};

export type Pagination = {
  page: number;
  limit: number;
  offset: number;
};

export type PaginationMeta = {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};

const defaultLimit = 20;
const maxLimit = 100;

export function getPagination(input: PaginationInput): Pagination {
  const page = Math.max(1, Number.parseInt(input.page ?? "1", 10) || 1);
  const requestedLimit = Number.parseInt(input.limit ?? String(defaultLimit), 10) || defaultLimit;
  const limit = Math.min(maxLimit, Math.max(1, requestedLimit));
  return {
    page,
    limit,
    offset: (page - 1) * limit,
  };
}

export function getPaginationMeta(totalItems: number, pagination: Pagination): PaginationMeta {
  const totalPages = Math.max(1, Math.ceil(totalItems / pagination.limit));
  return {
    currentPage: pagination.page,
    totalPages,
    totalItems,
    itemsPerPage: pagination.limit,
    hasNextPage: pagination.page < totalPages,
    hasPrevPage: pagination.page > 1,
  };
}
