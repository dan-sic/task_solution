import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { TranslatePipe } from "../translate/translate.pipe";
import { SearchService } from "./service/search.service";
import { debounceTime, distinctUntilChanged } from "rxjs/operators";

@Component({
  selector: "app-sidebar",
  templateUrl: "./sidebar.component.html",
  styleUrls: ["./sidebar.component.scss"],
  providers: [TranslatePipe]
})
export class SidebarComponent implements OnInit {
  selectedView = "units";
  searchUnits: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private searchService: SearchService
  ) {}

  ngOnInit() {
    this.searchUnits = this.formBuilder.group({
      search: [""]
    });

    this.onSearchChange();
  }

  onSearchChange(): void {
    this.searchUnits
      .get("search")
      .valueChanges.pipe(debounceTime(400), distinctUntilChanged())
      .subscribe(val => {
        this.searchService.setSearchText(val);
      });
  }

  changeView(view) {
    this.selectedView = view;
  }
}
