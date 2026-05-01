import * as Axios from "axios";
import type { Ngramyear } from "~/src/domain/ngramyear";
import { useSearchService, SearchServiceError } from "~/composables/useSearchService";

/*export function search(s: string): Axios.AxiosPromise<Ngramyear[]> {
  let fd = new FormData();
  fd.append("bib", s);
  return Axios.default.post<Ngramyear[]>(BASE_URL + "search", fd);
}*/
export interface SearchResult<T> {
  list: T[];
  hit: number;
  from: number;
};

export function search(keywords: string,size:number=null,from:number=null,materialtype:string=null,groupstr: string=null): Axios.AxiosPromise<SearchResult<Ngramyear>> {
  return useSearchService().search(keywords, size, from, materialtype, groupstr) as any;
}
export function getyearfreq(materialtype:string){
  return useSearchService().getyearfreq(materialtype) as any;
}
export function downloadurl(keywords: string,materialtype:string=null,groupstr: string=null): string {
  return useSearchService().downloadurl(keywords, materialtype, groupstr);
}
export { SearchServiceError };
