import { Component, OnInit, OnDestroy } from "@angular/core";
import { mapStyle } from "../shared/map-style";
import { LngLatBounds, Map, MapMouseEvent } from "mapbox-gl";
import { Utils } from "../shared/utils";
import { MapServiceCustom } from "./services/map.service";
import { take } from "rxjs/operators";
import { PositionService } from "./services/position.service";
import { Subscription } from "rxjs";

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.css"]
})
export class HomeComponent implements OnInit, OnDestroy {
  public map: Map;
  public center: number[] = [21.02001668629524, 52.2881799498405];
  public zoom: number[] = [6];
  public style;
  public cursorStyle: string;
  public greenImageLoaded = false;
  public supercluster: any;
  public selectedCluster: GeoJSON.Feature<GeoJSON.Point>;
  public selectedUnitPopup: GeoJSON.Feature<GeoJSON.Point>;
  private bounds: LngLatBounds;
  private utils: Utils;
  private _unitPositionSubscription: Subscription;
  private _unitTailSubscription: Subscription;

  unitFeatureCollection: GeoJSON.FeatureCollection<GeoJSON.Point>;
  unitRouteCollection: GeoJSON.FeatureCollection<GeoJSON.LineString>;
  unitTailFeatureCollection: GeoJSON.FeatureCollection<GeoJSON.LineString>;

  constructor(
    private readonly mapService: MapServiceCustom,
    private readonly positionService: PositionService
  ) {
    this.style = mapStyle;
    this.utils = new Utils();
  }

  selectCluster(event: MouseEvent, feature: any) {
    event.stopPropagation();
    this.selectedCluster = { ...feature };
  }

  selectUnit(event: MouseEvent, feature: any) {
    event.stopPropagation();
    this.selectedUnitPopup = { ...feature };
  }

  ngOnInit() {
    this.mapService
      .getInitialUnitFeatureCollection()
      .pipe(take(1))
      .subscribe(unitFeatureCollection => {
        this.unitFeatureCollection = unitFeatureCollection;
      });

    this.mapService
      .getUnitRoutesFeatureCollection()
      .pipe(take(1))
      .subscribe(unitRouteCollection => {
        this.unitRouteCollection = unitRouteCollection;
      });

    this.positionService.subscribe();
    this.positionService.invoke();
    this.subscribeToUnitPositionUpdates();
    this.subscribeToUnitTailUpdates();

    this.onResize();
    this.render();
  }

  ngOnDestroy() {
    this._unitPositionSubscription.unsubscribe();
    this._unitTailSubscription.unsubscribe();
    this.positionService.close();
  }

  render() {
    if (this.map && !this.bounds) {
      const _this = this;
      this.bounds = new LngLatBounds();

      // todo: należy ustalić pozycje graniczne wszystkich pojazdów i odpowiednio dostosować granice mapy

      window.dispatchEvent(new Event("resize"));
      // this.map.fitBounds(this.bounds, {padding: {top: 20, left: 370, bottom: 20, right: 20}});
    }
  }

  onResize() {
    this.utils.debounce(function() {
      const windowHeight = window.innerHeight;
      const navbarHeight = 73;
      const element = <HTMLElement>(
        document.getElementsByClassName("home-map")[0]
      );
      if (element) {
        element.style.height = windowHeight - navbarHeight + "px";
        window.dispatchEvent(new Event("resize"));
      }
    }, 250)();
  }

  private subscribeToUnitPositionUpdates() {
    this._unitPositionSubscription = this.mapService
      .getUnitFeaturesUpdate()
      .subscribe(unitFeatureCollection => {
        this.unitFeatureCollection = unitFeatureCollection;
      });
  }

  private subscribeToUnitTailUpdates() {
    this._unitTailSubscription = this.mapService
      .getUnitTailFeaturesUpdate()
      .subscribe(unitTailFeatureCollection => {
        this.unitTailFeatureCollection = unitTailFeatureCollection;
      });
  }
}
