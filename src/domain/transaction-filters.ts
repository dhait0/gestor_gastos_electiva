export const TRANSACTIONS_PAGE_SIZE = 25;

export interface TransactionFilters {
  type?: "INCOME" | "EXPENSE" | "TRANSFER";
  accountId?: string;
  categoryId?: string;
  /** YYYY-MM-DD inclusivo */
  from?: string;
  /** YYYY-MM-DD inclusivo */
  to?: string;
  search?: string;
  page: number;
}

type Raw = Record<string, string | string[] | undefined>;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

function first(value: string | string[] | undefined): string | undefined {
  const v = Array.isArray(value) ? value[0] : value;
  return v && v.trim() !== "" ? v.trim() : undefined;
}

function validDate(value: string | undefined): string | undefined {
  if (!value || !DATE.test(value)) return undefined;
  const d = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== value ? undefined : value;
}

/**
 * Normaliza los parámetros de la URL a filtros seguros (UC-21). Todo valor
 * inválido se descarta en lugar de fallar, y un rango invertido se ordena.
 */
export function parseTransactionFilters(raw: Raw): TransactionFilters {
  const type = first(raw.type);
  const account = first(raw.account);
  const category = first(raw.category);
  let from = validDate(first(raw.from));
  let to = validDate(first(raw.to));
  if (from && to && from > to) [from, to] = [to, from];

  const search = first(raw.q)?.slice(0, 100);
  const page = Number.parseInt(first(raw.page) ?? "1", 10);

  return {
    type: type === "INCOME" || type === "EXPENSE" || type === "TRANSFER" ? type : undefined,
    accountId: account && UUID.test(account) ? account : undefined,
    categoryId: category && UUID.test(category) ? category : undefined,
    from,
    to,
    search,
    page: Number.isFinite(page) && page >= 1 ? Math.min(page, 10000) : 1,
  };
}

/** Cantidad de filtros activos (sin contar la página), para mostrar "Limpiar". */
export function countActiveFilters(f: TransactionFilters): number {
  return [f.type, f.accountId, f.categoryId, f.from, f.to, f.search].filter(Boolean).length;
}

export function getTotalPages(count: number, pageSize = TRANSACTIONS_PAGE_SIZE): number {
  return Math.max(1, Math.ceil(count / pageSize));
}
