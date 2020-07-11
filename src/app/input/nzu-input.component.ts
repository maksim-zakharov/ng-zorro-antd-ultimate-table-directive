import {
  Component,
  forwardRef,
  Input,
  OnInit,
  OnDestroy,
  ElementRef,
  ViewChild,
  AfterViewInit,
  AfterViewChecked,
  Renderer2, ChangeDetectorRef,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { BehaviorSubject, fromEvent, Subject } from 'rxjs';
import { filter, switchMap, tap } from 'rxjs/operators';

const clean = (number) => {
  return number.toString().replace(/^[.]|^[0][0-9]+|[^0-9.]|[.].*[.]/gm, '');
};

const snilsClean = (valueWithCursorPosition: string) => {
  return valueWithCursorPosition.toString().replace(/[^\d^]/gm, '');
};

const snilsMasks = [
  '1',
  '11',
  '111',
  '111-1',
  '111-11',
  '111-111',
  '111-111-1',
  '111-111-11',
  '111-111-111',
  '111-111-111 1',
  '111-111-111 11',
];

const snilsFormat = (valueWithCursorPosition: string) => {
  let lastCharIndex = 0;
  const cleanValue = snilsClean(valueWithCursorPosition);
  const charCount = cleanValue.replace(/\^/gm, '').length;
  if (charCount === 0) {
    return {
      formatted: '',
      cursorPosition: 3,
    };
  }
  const mask = snilsMasks[charCount - 1];
  if (charCount > 1 && !mask) {
    return null;
  }
  let cursorPosition = 0;
  const formatted = mask.split('').map((currentValue, index) => {
    if (currentValue === '1') {
      if (cleanValue[lastCharIndex] === '^') {
        cursorPosition = index + 1;
        lastCharIndex++;
      }

      lastCharIndex++;
      return cleanValue[lastCharIndex - 1];
    } else {
      return currentValue;
    }
  }).join('');

  if (!cursorPosition) {
    cursorPosition = formatted.length + 2;
  }

  cursorPosition++;
  return {
    formatted: `${formatted}`,
    cursorPosition,
  };
};

const format = (number) => {
  const cursorPosition = 0;
  return {
    formatted: clean(number),
    cursorPosition,
  };
};

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'nzu-input',
  templateUrl: './nzu-input.component.html',
  styleUrls: ['./nzu-input.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NzuInputComponent),
      multi: true,
    },
  ],
})
export class NzuInputComponent implements OnInit, AfterViewInit, AfterViewChecked, OnDestroy, ControlValueAccessor {
  @Input() isDisabled?: boolean;
  @Input() placeholder = '';
  @Input() id?: string;
  @Input() min = -Infinity;
  @Input() max = Infinity;
  @Input() step?: number;
  @Input() name?: string;
  @Input() rows?: number;
  @Input() resizable?: string;
  @Input() public valueType: 'clean' | 'full' = 'clean';

  @ViewChild('hide', { static: false }) hide: ElementRef;
  @ViewChild('input', { static: false }) input: ElementRef;

  nzSize = 'large'; // Сделано для фильтра таблиц
  basicInputType;
  snilsInputType;
  _value: any = undefined;

  get type(): 'text' | 'textarea' | 'number' | 'password' | 'snils' {
    return this._type;
  }

  @Input()
  set type(type: 'text' | 'textarea' | 'number' | 'password' | 'snils') {
    if (this._type === type) {
      return;
    }

    this._type = type;
  }

  private _type: 'text' | 'textarea' | 'number' | 'password' | 'snils' = 'text';
  private oldValue = '';

  updateViewChecked$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor(
    public _elementRef: ElementRef,
    public renderer: Renderer2,
  ) {
  }

  updateInputView() {
    let input;
    let cursorPosition;
    let valueWithCursor = '^';
    let value;

    if (this.input) {
      input = this.input.nativeElement;
      cursorPosition = input.selectionStart;
      value = input.value;

      if (typeof value === 'string') {
        valueWithCursor = value.substring(0, cursorPosition) + '^' + value.substring(cursorPosition);
      }
    }

    if (typeof value === 'number') {
      valueWithCursor = value.toString() + '^';
    }

    const formatted = this.type === 'snils' ?
      snilsFormat(valueWithCursor)
      : format(valueWithCursor);

    if (!formatted && input) {
      input.value = this.oldValue;
      return;
    }

    const newValue = formatted.formatted;
    if (input && newValue !== input.value) {
      input.value = newValue;

      if (typeof value === 'number') {
        input.setSelectionRange(valueWithCursor.length - 1, valueWithCursor.length - 1);
      } else {
        input.setSelectionRange(formatted.cursorPosition, formatted.cursorPosition);
      }
    }

    this.oldValue = newValue;
    this.emitValue(newValue);
  }

  emitValue(v) {
    let value;
    if (this.valueType === 'clean') {
      value = v.replace(/[^\d+.]/gm, '');
    } else if (this.valueType === 'full') {
      value = v;
    }
    this.onChange(value);
  }

  ngOnInit() {
    this.updateViewChecked$.pipe(
      filter(value => value),
      tap(() => {
        this.input.nativeElement.value = this._value;
        this.updateInputView();
      }),
      switchMap(() => fromEvent(this.input.nativeElement, 'input')),
      tap(() => this.updateInputView()),
    ).subscribe();

    this.basicInputType = this.type !== 'textarea' && this.type !== 'snils';
    this.snilsInputType = this.type === 'snils';
  }

  ngAfterViewInit() {
    if (this.resizable) {
      this.activateInputResizeEvent();
    }
  }

  ngAfterViewChecked() {
    if (this.resizable) {
      this.resize();
    }
    if (this.type === 'snils' && !this.updateViewChecked$.value) {
      this.updateViewChecked$.next(true);
    }
  }

  ngOnDestroy() {
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

  writeNumberValue(value: string) {
    // const val = value.slice(0, 16).match('^\\d+(\\.\\d{0,14})?$');
    // console.log(val);
    this.writeValue(this._value);
  }

  writeValue(obj: any): void {
    switch (this.type) {
      case 'number':
        if (obj < this.min) {
          this._value = this.min;
        } else {
          this._value = obj;
        }
        break;
      case 'snils':
        this._value = obj || '';
        // this.updateInputView();
        break;
      default:
        this._value = obj;
    }
    this.onChange(this._value);
  }

  private activateInputResizeEvent(): void {
    const el = (this._elementRef.nativeElement as HTMLElement).children[1] as any;
    const hide = this.hide.nativeElement;

    const resize = () => {
      hide.textContent = el.value;
      el.style.width = hide.offsetWidth + 75 + 'px';
    };

    const e = 'keyup,keypress,focus,blur,change,input'.split(',');
    for (const i in e) {
      if (e.hasOwnProperty(i)) {
        const eventName = e[i];
        el.addEventListener(eventName, resize, false);
      }
    }
  }

  private resize(): void {
    const el = (this._elementRef.nativeElement as HTMLElement).children[1] as any;
    const hide = this.hide.nativeElement;
    hide.textContent = el.value;
    el.style.width = hide.offsetWidth + 75 + 'px';
  }
}
