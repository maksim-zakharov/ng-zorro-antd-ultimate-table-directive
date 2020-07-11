import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzTableFilterDirective } from './nz-table-filter.directive';
import { NzDatePickerComponent, NzDatePickerModule, NzInputModule } from 'ng-zorro-antd';
import { NzTableFilterService } from './nz-table-filter.service';
import { NzuInputComponent } from 'src/app/input/nzu-input.component';
import { NzuCheckboxComponent } from 'src/app/checkbox/nzu-checkbox.component';
import { InputModule } from '../input/input.module';
import { NzuSelectComponent } from '../select/select.component';
import { CheckboxModule } from '../checkbox/checkbox.module';
import { OrrSelectModule } from '../select/select.module';

@NgModule({
  imports: [CommonModule, CheckboxModule, NzDatePickerModule, NzInputModule, InputModule, OrrSelectModule],
  providers: [NzTableFilterService],
  declarations: [NzTableFilterDirective],
  exports: [NzTableFilterDirective],
  entryComponents: [NzDatePickerComponent, NzuInputComponent, NzuSelectComponent, NzuCheckboxComponent],
})
export class NzTableFilterModule {}
