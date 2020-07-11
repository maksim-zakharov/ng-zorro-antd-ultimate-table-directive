import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzuCheckboxComponent } from 'src/app/checkbox/nzu-checkbox.component';
import { NzCheckboxModule } from 'ng-zorro-antd';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [NzuCheckboxComponent],
  imports: [NzCheckboxModule, CommonModule, FormsModule],
  exports: [NzuCheckboxComponent],
})
export class CheckboxModule {}
