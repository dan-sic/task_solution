import { Injectable } from '@angular/core';
import {BehaviorSubject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SearchService {

  private searchSource = new BehaviorSubject('');

  constructor() { }

  setSearchText(text: string) {
    this.searchSource.next(text);
  }
}
