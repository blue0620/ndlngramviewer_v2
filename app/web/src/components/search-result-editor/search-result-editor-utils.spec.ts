import { buildGroupStrFromIdxArrays, createTotalingSummary, mergeNgramYearJsonRows } from "./search-result-editor-utils";

function assertEqual(actual: unknown, expected: unknown, message: string) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`${message}\nactual=${JSON.stringify(actual)}\nexpected=${JSON.stringify(expected)}`);
  }
}

const rows = [
  { idx: 2, ngramkeyword: "A", count: 3, ngramyearjson: JSON.stringify({ "1900": 1, "1901": 2 }) },
  { idx: 0, ngramkeyword: "B", count: 5, ngramyearjson: JSON.stringify({ "1901": 4, "1902": 1 }) },
  { idx: 1, ngramkeyword: "C", count: 7, ngramyearjson: JSON.stringify({ "1900": 3 }) }
];

assertEqual(mergeNgramYearJsonRows(rows), { "1900": 4, "1901": 6, "1902": 1 }, "ngramyearjson merge failed");

const summary = createTotalingSummary(rows);
if (summary == null) throw new Error("summary should not be null");
assertEqual(summary.count, 15, "summary count failed");
assertEqual(summary.ngramkeyword, "A=B=C", "summary keyword failed");
assertEqual(JSON.parse(summary.ngramyearjson), { "1900": 4, "1901": 6, "1902": 1 }, "summary ngramyearjson failed");

assertEqual(buildGroupStrFromIdxArrays([[2, 0, 1], [10, 4]]), "0=1=2-4=10", "groupstr format failed");
console.log("search-result-editor-utils.spec: ok");
