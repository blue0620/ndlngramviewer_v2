import axios from 'axios'
import type { Ngramyear } from '~/src/domain/ngramyear'

const API_BASE_URL = '/api/'
const DATASET_URL = 'https://lab.ndl.go.jp/dataset/ngramviewer/'

export interface SearchResult<T> {
  list: T[]
  hit: number
  from: number
}

export function search(
  keywords: string,
  size: number | null = null,
  from: number | null = null,
  materialtype: string | null = null,
  groupstr: string | null = null,
) {
  const params = new URLSearchParams({ keyword: keywords })

  if (size !== null) params.set('size', String(size))
  if (from !== null) params.set('from', String(from))
  if (groupstr !== null) params.set('groupstr', groupstr)
  if (materialtype !== null) params.set('materialtype', materialtype)

  return axios.get<SearchResult<Ngramyear>>(`${API_BASE_URL}search?${params.toString()}`)
}

export function getyearfreq(materialtype: string) {
  return axios.get<Record<string, number>>(`${DATASET_URL}yearfrequency_${materialtype}.json`)
}

export function downloadurl(
  keywords: string,
  materialtype: string | null = null,
  groupstr: string | null = null,
): string {
  const params = new URLSearchParams({ keyword: keywords, size: '10000' })

  if (materialtype !== null) params.set('materialtype', materialtype)
  if (groupstr !== null) params.set('groupstr', groupstr)

  return `${API_BASE_URL}download?${params.toString()}`
}
