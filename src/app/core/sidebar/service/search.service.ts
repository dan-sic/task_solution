import { Injectable } from "@angular/core";
import { Subject } from "rxjs";

@Injectable({
  providedIn: "root"
})
export class SearchService {
  private _searchSource = new Subject<string>();
  public searchInputText$ = this._searchSource.asObservable();

  constructor() {}

  setSearchText(text: string) {
    this._searchSource.next(text);
  }
}
