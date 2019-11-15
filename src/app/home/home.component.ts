import {Component, OnInit} from '@angular/core';
import {mapStyle} from '../shared/map-style';
import {LngLatBounds, Map, MapMouseEvent} from 'mapbox-gl';
import {Utils} from '../shared/utils';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

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

  constructor() {
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
    this.onResize();
    this.render();
  }

  render() {
    if (this.map && !this.bounds) {
      const _this = this;
      this.bounds = new LngLatBounds();

      // todo: należy ustalić pozycje graniczne wszystkich pojazdów i odpowiednio dostosować granice mapy

      window.dispatchEvent(new Event('resize'));
      // this.map.fitBounds(this.bounds, {padding: {top: 20, left: 370, bottom: 20, right: 20}});
    }
  }

  onResize() {
    this.utils.debounce(function () {
      const windowHeight = window.innerHeight;
      const navbarHeight = 73;
      const element = (<HTMLElement> document.getElementsByClassName('home-map')[0]);
      if (element) {
        element.style.height = windowHeight - navbarHeight + 'px';
        window.dispatchEvent(new Event('resize'));
      }
    }, 250)();
  }

}
