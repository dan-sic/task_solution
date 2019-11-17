import { Component, OnInit, OnDestroy } from "@angular/core";
import { mapStyle } from "../shared/map-style";
import { LngLatBounds, Map, Popup } from "mapbox-gl";
import { Utils } from "../shared/utils";
import { MapUnitsService } from "./services/map-units.service";
import { take } from "rxjs/operators";
import { PositionService } from "./services/position.service";
import { Subscription, Subject } from "rxjs";
import { UnitRouteMapBoundaries } from "./models/UnitRoutesModels";
import { MapRoutesService } from "./services/map-routes.service";
import { UnitService } from "../units/services/unit.service";
import { MapTailsService } from "./services/map-tails.service";

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.css"]
})
export class HomeComponent implements OnInit, OnDestroy {
  public map: Map;
  public popup: Popup;
  public center: number[] = [21.02001668629524, 52.2881799498405];
  public zoom: number[] = [6];
  public style;
  public cursorStyle: string;
  public greenImageLoaded = false;
  public showErrorModal = false;
  public supercluster: any;
  public selectedCluster: GeoJSON.Feature<GeoJSON.Point>;
  public selectedUnitPopup: GeoJSON.Feature<GeoJSON.Point>;
  private bounds: LngLatBounds;
  private utils: Utils;
  private hideOtherRoutesOnSelectedRouteZoom = false;

  private _unitPositionSubscription: Subscription;
  private _unitTailSubscription: Subscription;
  private _unitRouteSelectSub: Subscription;
  private _zoomSub: Subscription;
  private _unitRouteHoverSub: Subscription;

  private _zoomSubject = new Subject<number>();

  unitFeatureCollection: GeoJSON.FeatureCollection<GeoJSON.Point>;
  unitRouteCollection: GeoJSON.FeatureCollection<GeoJSON.LineString>;
  unitTailFeatureCollection: GeoJSON.FeatureCollection<GeoJSON.LineString>;
  unitRouteMapBoundaries: UnitRouteMapBoundaries;

  constructor(
    private readonly mapUnitsService: MapUnitsService,
    private readonly positionService: PositionService,
    private readonly mapRoutesService: MapRoutesService,
    private readonly mapTailsService: MapTailsService,
    private readonly unitService: UnitService
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
    this.getInitialUnitFeatureCollection();
    this.getUnitRoutesFeatureCollection();
    this.getUnitRoutesMapBoundaries();

    this.positionService.subscribe();
    this.positionService.invoke();
    this.subscribeToUnitPositionUpdates();
    this.subscribeToUnitTailUpdates();
    this.subscribeToUnitRouteSelect();
    this.subscribeToZoomEvents();
    this.subscribeToUnitRouteHovers();

    this.generateRoutePopup();
    this.onResize();
    this.render();
  }

  ngOnDestroy() {
    this._unitPositionSubscription.unsubscribe();
    this._unitTailSubscription.unsubscribe();
    this._unitRouteSelectSub.unsubscribe();
    this._zoomSub.unsubscribe();
    this._unitRouteHoverSub.unsubscribe();
    this.positionService.close();
  }

  render() {
    if (this.map && !this.bounds) {
      const _this = this;
      this.bounds = new LngLatBounds();

      for (let routeId in this.unitRouteMapBoundaries) {
        this.bounds.extend(this.unitRouteMapBoundaries[routeId]);
      }

      window.dispatchEvent(new Event("resize"));
      this.map.fitBounds(this.bounds, {
        padding: { top: 40, left: 370, bottom: 20, right: 20 }
      });
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

  // Type any used intentionally, as type MapMouseEvent does not have 'features' property
  openRoutePopup(event: any) {
    const popupInnerHTML = `<p>Trasa pojazdu:</p>
      <hr>
      <p>Nazwa: ${event.features[0].properties.unitName}</p>
      <p>Seria: ${event.features[0].properties.unitSerial}</p>
      `;

    this.popup
      .setLngLat(event.lngLat)
      .setHTML(popupInnerHTML)
      .addTo(this.map);
  }

  closeRoutePopup() {
    this.popup.remove();
  }

  setLatestZoom() {
    this._zoomSubject.next(this.map.getZoom());
  }

  private getInitialUnitFeatureCollection() {
    this.mapUnitsService
      .getInitialUnitFeatureCollection()
      .pipe(take(1))
      .subscribe(
        unitFeatureCollection => {
          this.unitFeatureCollection = unitFeatureCollection;
        },
        err => this.handleConnectionError()
      );
  }

  private getUnitRoutesFeatureCollection() {
    this.mapRoutesService
      .getUnitRoutesFeatureCollection()
      .pipe(take(1))
      .subscribe(
        unitRouteCollection => {
          this.unitRouteCollection = unitRouteCollection;
        },
        err => this.handleConnectionError()
      );
  }

  private getUnitRoutesMapBoundaries() {
    this.mapRoutesService
      .getUnitRoutesMapBoundaries()
      .pipe(take(1))
      .subscribe(
        unitRouteMapBoundaries => {
          this.unitRouteMapBoundaries = unitRouteMapBoundaries;
        },
        err => this.handleConnectionError()
      );
  }

  private subscribeToUnitPositionUpdates() {
    this._unitPositionSubscription = this.mapUnitsService
      .getUnitFeaturesUpdate()
      .subscribe(
        unitFeatureCollection => {
          this.unitFeatureCollection = unitFeatureCollection;
        },
        err => this.handleConnectionError()
      );
  }

  private subscribeToUnitTailUpdates() {
    this._unitTailSubscription = this.mapTailsService
      .getUnitTailFeaturesUpdate()
      .subscribe(
        unitTailFeatureCollection => {
          this.unitTailFeatureCollection = unitTailFeatureCollection;
        },
        err => this.handleConnectionError()
      );
  }

  private subscribeToUnitRouteSelect() {
    this._unitRouteSelectSub = this.mapRoutesService.selectedUnitRoute$.subscribe(
      unitId => {
        this.hideOtherRoutesOnSelectedRouteZoom = true;
        this.fitBoundsToSelectedRoute(unitId);
        this.hideOtherRoutesAndUnits(unitId);
      }
    );
  }

  private subscribeToUnitRouteHovers() {
    this._unitRouteHoverSub = this.mapRoutesService.hoveredUnitRoute$.subscribe(
      unitId => {
        if (unitId) {
          this.hideOtherRoutesAndUnits(unitId);
        } else {
          this.showOtherRoutesAndUnits();
        }
      }
    );
  }

  private subscribeToZoomEvents() {
    this._zoomSub = this._zoomSubject.subscribe(zoom => {
      if (zoom < 10) {
        this.hideOtherRoutesOnSelectedRouteZoom = false;
        this.showOtherRoutesAndUnits();
      }
    });
  }

  private generateRoutePopup() {
    this.popup = new Popup({
      closeButton: false,
      className: "route-popup"
    });
  }

  private fitBoundsToSelectedRoute(routeId: number) {
    this.bounds = this.unitRouteMapBoundaries[routeId];

    this.map.fitBounds(this.bounds, {
      padding: { top: 50, left: 340, bottom: 40, right: 20 }
    });
  }

  private hideOtherRoutesAndUnits(routeId: number) {
    const filter = ["match", ["get", "unitId"], routeId, true, false];

    this.setLayerFilters(filter);
  }

  private showOtherRoutesAndUnits() {
    if (!this.hideOtherRoutesOnSelectedRouteZoom) {
      const filter = ["has", "unitId"];
    }
  }

  private setLayerFilters(filter: any[]) {
    this.map.setFilter("routes", filter);

    if (this.map.getLayer("unitPositions")) {
      this.map.setFilter("unitPositions", filter);
    }

    if (this.map.getLayer("tail")) {
      this.map.setFilter("tail", filter);
    }
  }

  private handleConnectionError() {
    this.showErrorModal = true;

    this.unitService.hideUnitListings();
  }
}
