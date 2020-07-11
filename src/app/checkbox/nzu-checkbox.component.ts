import { ChangeDetectorRef, Component, ElementRef, forwardRef, Input, OnInit } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'nzu-checkbox',
  templateUrl: './nzu-checkbox.component.html',
  styleUrls: ['./nzu-checkbox.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NzuCheckboxComponent),
      multi: true,
    },
  ],
})
export class NzuCheckboxComponent implements OnInit, ControlValueAccessor {
  @Input() label;

  _value = false;

  constructor(private changeDetectionRef: ChangeDetectorRef, public _elementRef: ElementRef) {}

  ngOnInit() {}

  onChange: any = () => {};

  onTouched: any = () => {};

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  writeValue(obj: any): void {
    this._value = obj;
    this.onChange(obj);
  }
}
