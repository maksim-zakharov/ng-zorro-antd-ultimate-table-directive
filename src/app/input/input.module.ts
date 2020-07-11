import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzuInputComponent } from 'src/app/input/nzu-input.component';
import { NzInputModule } from 'ng-zorro-antd';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  imports: [CommonModule, NzInputModule, FormsModule, ReactiveFormsModule],
  declarations: [NzuInputComponent],
  exports: [NzuInputComponent],
})
export class InputModule {}
