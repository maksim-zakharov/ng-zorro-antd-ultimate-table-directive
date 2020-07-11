import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzuSelectComponent } from './select.component';
import { FormsModule } from '@angular/forms';
import { NzSelectModule } from 'ng-zorro-antd';

@NgModule({
  imports: [CommonModule, FormsModule, NzSelectModule],
  declarations: [NzuSelectComponent],
  exports: [NzuSelectComponent],
})
export class OrrSelectModule {}
