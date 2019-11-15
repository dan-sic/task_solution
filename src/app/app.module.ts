import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {NgxMapboxGLModule} from 'ngx-mapbox-gl';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';

import {AppComponent} from './app.component';
import {CoreModule} from './core/core.module';
import {HttpClientModule} from '@angular/common/http';
import {HomeComponent} from './home/home.component';
import {AppRoutingModule} from './app-routing.module';
import {LoadingBarHttpClientModule} from '@ngx-loading-bar/http-client';
import {SharedModule} from './shared/shared.module';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent
  ],
  imports: [
    SharedModule,
    LoadingBarHttpClientModule,
    AppRoutingModule,
    HttpClientModule,
    CoreModule,
    BrowserModule,
    NgbModule,
    NgxMapboxGLModule,
    InfiniteScrollModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
