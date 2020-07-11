import { ChangeDetectorRef, Component, ElementRef, forwardRef, Input, OnDestroy, OnInit, TemplateRef } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { NzSizeLDSType } from 'ng-zorro-antd';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'nzu-select',
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NzuSelectComponent),
      multi: true,
    },
  ],
})
export class NzuSelectComponent implements OnInit, ControlValueAccessor, OnDestroy {
  @Input() isDisabled = false;
  @Input() isSearchable = false;
  @Input() placeholder: string;
  @Input() labelField: string;
  @Input() valueField: string;
  @Input() notFoundContent: string;

  /**
   * Шаблон отображения элемента
   */
  @Input() itemTemplate: TemplateRef<any>;
  @Input() allowClear = false;

  /**
   * Отображает спиннер загрузки
   */
  @Input() loading: boolean;

  private _options: any[] = [];

  _size: NzSizeLDSType = 'large'; // Сделано для фильтра таблиц

  get items(): any[] | any {
    return this._options;
  }

  @Input()
  set items(val: any) {
    if (JSON.stringify(this._options) !== JSON.stringify(val)) {
      this._options = val || [];

      this.writeValue(this._value);
    }
  }

  @Input() searchQuery$: BehaviorSubject<string> = new BehaviorSubject<string>(undefined);

  _value: any = undefined;

  constructor(private changeDetectionRef: ChangeDetectorRef, public _elementRef: ElementRef) {
  }

  ngOnInit() {
  }

  onChange: any = () => {
  };

  onTouched: any = () => {
  };

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  writeValue(obj: any): void {
    if (obj === undefined && obj === this._value) {
      return;
    }
    if (!this._options.length && obj) {
      this._value = obj;
      this.items = [obj];
    } else {
      if (this.valueField) {
        const value = this._options.find((i) => JSON.stringify(i[this.valueField]) === JSON.stringify(obj));
        this._value = value ? value[this.valueField] : obj;
      } else {
        this._value = this._options.find((i) => JSON.stringify(i) === JSON.stringify(obj));
      }
      this.onChange(this._value);
    }
  }

  ngOnDestroy(): void {
  }
}
