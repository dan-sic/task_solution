import {APP_INITIALIZER, NgModule, Optional, SkipSelf} from '@angular/core';
import {CommonModule} from '@angular/common';
import {HeaderComponent} from './header/header.component';
import {Error} from 'tslint/lib/error';
import {TranslateService} from './translate/translate.service';
import {SharedModule} from '../shared/shared.module';
import {StorageService} from './storage/storage.service';
import {SidebarComponent} from './sidebar/sidebar.component';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {InfiniteScrollModule} from 'ngx-infinite-scroll';


export function setupTranslateFactory(service: TranslateService): Function {
  const storage = new StorageService();
  const lang = storage.get('currentUser') ? storage.get('currentUser').language : 'pl';
  return () => service.use(lang);
}

@NgModule({
  declarations: [HeaderComponent, SidebarComponent],
  imports: [
    CommonModule,
    SharedModule,
    NgbModule,
    InfiniteScrollModule
  ],
  exports: [
    HeaderComponent,
    SidebarComponent
  ],
  providers: [
    TranslateService,
    {
      provide: APP_INITIALIZER,
      useFactory: setupTranslateFactory,
      deps: [TranslateService],
      multi: true
    }
  ]
})
export class CoreModule {
  constructor(
    @Optional()
    @SkipSelf()
      parentModule: CoreModule
  ) {
    // Import guard
    if (parentModule) {
      throw new Error(
        `${parentModule} has already been loaded. Import Core module in the AppModule only.`
      );
    }
  }
}
