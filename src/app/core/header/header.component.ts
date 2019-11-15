import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';
import {TranslateService} from '../translate/translate.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  constructor(
    private router: Router,
    private translateService: TranslateService
  ) { }

  ngOnInit() { }

}
