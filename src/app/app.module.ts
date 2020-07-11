import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NzTableFilterModule } from 'src/app/nz-table-filter/nz-table-filter.module';
import { en_US, NZ_DATE_LOCALE, NZ_I18N, NzTableModule } from 'ng-zorro-antd';
import { CommonModule, DatePipe } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import * as enDateLocale from 'date-fns/locale/en-US';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    CommonModule,
    NzTableFilterModule,
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    NzTableModule,
  ],
  providers: [
    // {provide: NZ_I18N, useValue: en_US},
    // {provide: NZ_DATE_LOCALE, useValue: enDateLocale},
    DatePipe
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
