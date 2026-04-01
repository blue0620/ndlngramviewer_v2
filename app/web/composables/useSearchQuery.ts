import type { LocationQuery } from 'vue-router'

export type SearchQueryState = {
  keyword: string
  groupstr: string | null
  size: number
  from: number
  materialtype: string
}

export function parseSearchQuery(query: LocationQuery): SearchQueryState {
  const first = (value: string | string[] | null | undefined) =>
    Array.isArray(value) ? value[0] : value

  const keyword = first(query.keyword as string | string[] | undefined) ?? ''
  const groupstr = first(query.groupstr as string | string[] | undefined) ?? null

  const sizeRaw = first(query.size as string | string[] | undefined)
  const fromRaw = first(query.from as string | string[] | undefined)
  const materialtypeRaw = first(query.materialtype as string | string[] | undefined)

  return {
    keyword,
    groupstr,
    size: Number.parseInt(sizeRaw ?? '100', 10) || 100,
    from: Number.parseInt(fromRaw ?? '0', 10) || 0,
    materialtype: materialtypeRaw ?? 'full',
  }
}
