import { Injectable, OnDestroy } from "@angular/core";
import { UnitModel } from "../components/unit-list/UnitModel";
import { Subject, Observable, Subscription } from "rxjs";
import { ApiJSONService } from "src/app/core/api/api-json.service";
import { take } from "rxjs/operators";
import { SearchService } from "src/app/core/sidebar/service/search.service";

@Injectable({
  providedIn: "root"
})
export class UnitService implements OnDestroy {
  private _allUnits: UnitModel[] = [];
  private _unitsToDisplay: Subject<UnitModel[]> = new Subject();
  private _searchTextInputSubscription: Subscription;

  public unitsToDisplay$: Observable<
    UnitModel[]
  > = this._unitsToDisplay.asObservable();

  constructor(
    private readonly apiService: ApiJSONService,
    private readonly searchService: SearchService
  ) {
    this.apiService
      .getUnits()
      .pipe(take(1))
      .subscribe(
        units => {
          this._allUnits = units;
          this._unitsToDisplay.next(this._allUnits);
        },
        err => this._unitsToDisplay.next(null)
      );

    this.listenToSearchTextInput();
  }

  ngOnDestroy() {
    this._searchTextInputSubscription.unsubscribe();
  }

  private listenToSearchTextInput() {
    this._searchTextInputSubscription = this.searchService.searchInputText$.subscribe(
      input => {
        this.filterOutUnits(input);
      }
    );
  }

  private filterOutUnits(searchInputValue: string) {
    const filteredOutUnits = [];

    const regex = new RegExp(searchInputValue, "i");

    for (let unit of this._allUnits) {
      for (let tag of unit.unitTag) {
        const tagValueMatches = regex.test(tag.value);

        if (tagValueMatches) {
          filteredOutUnits.push(unit);
          break;
        }
      }
    }
    this._unitsToDisplay.next(filteredOutUnits);
  }
}
