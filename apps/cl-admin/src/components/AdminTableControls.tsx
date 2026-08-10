import { useCallback, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

const PAGE_SIZES = [10, 25, 50, 100] as const;

export function useAdminTableState(defaultSort: string, defaultDirection: 'ASC' | 'DESC' = 'DESC') {
  const [params, setSearchParams] = useSearchParams();
  const page = positiveInteger(params.get('page'), 1);
  const requestedPageSize = positiveInteger(params.get('pageSize'), 10);
  const pageSize = PAGE_SIZES.includes(requestedPageSize as typeof PAGE_SIZES[number]) ? requestedPageSize : 10;
  const search = params.get('q') ?? '';
  const sortBy = params.get('sort') || defaultSort;
  const sortDirection: 'ASC' | 'DESC' = params.get('direction') === 'ASC' ? 'ASC' : params.get('direction') === 'DESC' ? 'DESC' : defaultDirection;

  const update = useCallback((values: Record<string, string | number | null | undefined>, resetPage = true) => {
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      Object.entries(values).forEach(([key, value]) => {
        if (value == null || value === '') next.delete(key);
        else next.set(key, String(value));
      });
      if (resetPage && !Object.prototype.hasOwnProperty.call(values, 'page')) next.delete('page');
      return next;
    }, { replace: true });
  }, [setSearchParams]);

  return useMemo(() => ({
    page,
    pageSize,
    search,
    sortBy,
    sortDirection,
    offset: (page - 1) * pageSize,
    get: (key: string) => params.get(key) ?? '',
    update,
    setPage: (value: number) => update({ page: Math.max(value, 1) }, false),
    setPageSize: (value: number) => update({ pageSize: value, page: 1 }, false),
    setSearch: (value: string) => update({ q: value }),
    setSort: (field: string) => update({
      sort: field,
      direction: sortBy === field && sortDirection === 'DESC' ? 'ASC' : 'DESC',
    }),
  }), [page, pageSize, params, search, sortBy, sortDirection, update]);
}

export function useClampAdminPage(totalCount: number | undefined, page: number, pageSize: number, setPage: (page: number) => void) {
  useEffect(() => {
    if (totalCount == null) return;
    const lastPage = Math.max(1, Math.ceil(totalCount / pageSize));
    if (page > lastPage) setPage(lastPage);
  }, [page, pageSize, setPage, totalCount]);
}

export function AdminPagination({ totalCount, page, pageSize, onPageChange, onPageSizeChange }: {
  totalCount: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}) {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const first = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const last = Math.min(page * pageSize, totalCount);
  const pages = pageWindow(page, totalPages);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t bg-white px-4 py-3 text-sm">
      <p className="text-slate-600">Showing <strong>{first}–{last}</strong> of <strong>{totalCount}</strong></p>
      <div className="flex flex-wrap items-center gap-2">
        <label className="flex items-center gap-2 text-xs text-slate-600">
          Rows
          <select aria-label="Rows per page" value={pageSize} onChange={(event) => onPageSizeChange(Number(event.target.value))} className="h-8 rounded border bg-white px-2">
            {PAGE_SIZES.map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
        </label>
        <button type="button" disabled={page <= 1} onClick={() => onPageChange(page - 1)} className="h-8 rounded border px-3 font-semibold disabled:cursor-not-allowed disabled:opacity-40">Previous</button>
        <div className="flex items-center gap-1" aria-label="Pagination">
          {pages.map((value, index) => value === '…'
            ? <span key={`ellipsis-${index}`} className="px-1 text-slate-400">…</span>
            : <button key={value} type="button" aria-current={value === page ? 'page' : undefined} onClick={() => onPageChange(value)} className={`h-8 min-w-8 rounded border px-2 font-semibold ${value === page ? 'border-blue-600 bg-blue-50 text-blue-700' : 'bg-white'}`}>{value}</button>)}
        </div>
        <button type="button" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)} className="h-8 rounded border px-3 font-semibold disabled:cursor-not-allowed disabled:opacity-40">Next</button>
      </div>
    </div>
  );
}

export function SortableHeader({ field, label, activeField, direction, onSort, className = '' }: {
  field: string;
  label: string;
  activeField: string;
  direction: 'ASC' | 'DESC';
  onSort: (field: string) => void;
  className?: string;
}) {
  const active = field === activeField;
  return <th className={`px-4 py-3 ${className}`}><button type="button" onClick={() => onSort(field)} className="inline-flex items-center gap-1 text-left hover:text-slate-900">{label}<span aria-hidden="true" className={active ? 'text-blue-700' : 'text-slate-300'}>{active ? (direction === 'ASC' ? '↑' : '↓') : '↕'}</span></button></th>;
}

function positiveInteger(value: string | null, fallback: number) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function pageWindow(current: number, total: number): Array<number | '…'> {
  if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1);
  const values = new Set([1, total, current - 1, current, current + 1].filter((value) => value >= 1 && value <= total));
  const sorted = [...values].sort((a, b) => a - b);
  const result: Array<number | '…'> = [];
  sorted.forEach((value, index) => {
    if (index && value - sorted[index - 1] > 1) result.push('…');
    result.push(value);
  });
  return result;
}
