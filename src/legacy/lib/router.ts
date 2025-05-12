import { useLocation } from 'react-router';

export type Search = Record<string, string | number>;

export function useSearch<T extends Record<string, any>>(defaultParams = {} as T) {
  const { search: searchString } = useLocation();
  const sp = new URLSearchParams(searchString);
  const search = {} as Search;

  for (const [k, v] of sp.entries()) {
    search[k] = v;
  }

  for (const [k, v] of Object.entries(defaultParams)) {
    const value = search[k] ?? v;
    search[k] = typeof v === 'number' ? Number(value) : value;
  }

  return search as T;
}

export function buildSearch(search: Record<string, string | number>) {
  const searchParams = new URLSearchParams();
  Object.entries(search).forEach(([k, v]) => searchParams.set(k, v.toString()));
  return searchParams.toString();
}
