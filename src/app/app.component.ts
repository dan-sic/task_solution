import {Component} from '@angular/core';
import {TranslateService} from './core/translate/translate.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Teagle';
  hideMenu = true;
  currentUser = false;

  constructor(private translate: TranslateService) { }
}
