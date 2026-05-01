import * as Axios from "axios";
import type { Ngramyear } from "~/src/domain/ngramyear";

const DATASET_URL = "https://lab.ndl.go.jp/dataset/ngramviewer/";

export interface SearchResult<T> {
  list: T[];
  hit: number;
  from: number;
}

export class SearchServiceError extends Error {
  constructor(
    message: string,
    public readonly code: "invalid_query" | "network_error" = "invalid_query",
  ) {
    super(message);
    this.name = "SearchServiceError";
  }
}

const normalizeError = (error: unknown): SearchServiceError => {
  if (error instanceof SearchServiceError) return error;
  if (Axios.default.isAxiosError(error)) {
    return new SearchServiceError("エラーが発生しました。不正なクエリ文字列の可能性があります", "invalid_query");
  }
  return new SearchServiceError("エラーが発生しました。不正なクエリ文字列の可能性があります", "invalid_query");
};

const buildApiBase = () => {
  const config = useRuntimeConfig();
  const apiBase = config.public.apiBase;
  return apiBase.endsWith("/") ? apiBase : `${apiBase}/`;
};

export const useSearchService = () => {
  const search = async (
    keywords: string,
    size: number | null = null,
    from: number | null = null,
    materialtype: string | null = null,
    groupstr: string | null = null,
  ): Promise<SearchResult<Ngramyear>> => {
    let resstring = `${buildApiBase()}search?keyword=${keywords}`;
    if (size !== null) {
      resstring += `&size=${size}`;
    }
    if (from !== null) {
      resstring += `&from=${from}`;
    }
    if (groupstr !== null) {
      resstring += `&groupstr=${groupstr}`;
    }
    if (materialtype !== null) {
      resstring += `&materialtype=${materialtype}`;
    }
    try {
      const response = await Axios.default.get<SearchResult<Ngramyear>>(encodeURI(resstring));
      return response.data;
    } catch (error) {
      throw normalizeError(error);
    }
  };

  const getyearfreq = async (materialtype: string) => {
    try {
      const resstring = `${DATASET_URL}yearfrequency_${materialtype}.json`;
      const response = await Axios.default.get(encodeURI(resstring));
      return response.data;
    } catch (error) {
      throw normalizeError(error);
    }
  };

  const downloadurl = (keywords: string, materialtype: string | null = null, groupstr: string | null = null): string => {
    let resstring = `${buildApiBase()}download?keyword=${keywords}&size=10000`;
    if (materialtype !== null) {
      resstring += `&materialtype=${materialtype}`;
    }
    if (groupstr !== null) {
      resstring += `&groupstr=${groupstr}`;
    }
    return encodeURI(resstring);
  };

  return { search, getyearfreq, downloadurl };
};
