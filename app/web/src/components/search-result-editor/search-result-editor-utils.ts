export type NgramYearMap = Record<string, number>;

export interface ResultRowLike {
  idx: number;
  ngramkeyword: string;
  count: number;
  ngramyearjson: string;
}

export function mergeNgramYearJsonRows(rows: ResultRowLike[]): NgramYearMap {
  const merged: NgramYearMap = {};
  for (const row of rows) {
    const json = JSON.parse(row.ngramyearjson) as Record<string, number>;
    for (const [year, value] of Object.entries(json)) {
      merged[year] = (merged[year] ?? 0) + Number(value);
    }
  }
  return merged;
}

export function buildGroupStrFromIdxArrays(idxarrays: number[][]): string {
  return idxarrays
    .map((idxarray) => idxarray.slice().sort((a, b) => a - b).join("="))
    .join("-")
    .trim();
}

export function createTotalingSummary(rows: ResultRowLike[]) {
  if (rows.length < 2) {
    return null;
  }

  const summarycount = rows.reduce((sum, row) => sum + row.count, 0);
  const summaryngramkeyword = rows.map((row) => row.ngramkeyword).join("=");
  const summaryidxarray = rows.map((row) => row.idx);
  const summaryjsonobj = mergeNgramYearJsonRows(rows);

  return {
    ngramkeyword: summaryngramkeyword,
    count: summarycount,
    idxarray: summaryidxarray,
    ngramyearjson: JSON.stringify(summaryjsonobj)
  };
}

export function validateCanTotal(rows: unknown[]): boolean {
  return rows.length >= 2;
}
