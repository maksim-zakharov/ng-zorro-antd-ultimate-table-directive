import {
  ComponentFactoryResolver,
  ComponentRef,
  Directive,
  ElementRef,
  InjectionToken,
  Injector,
  Input,
  OnDestroy,
  OnInit,
  Renderer2,
  Type,
  ViewContainerRef,
} from '@angular/core';
import {
  NzDatePickerComponent,
  NzTableComponent,
} from 'ng-zorro-antd';
import {
  debounceTime,
  distinctUntilChanged,
  filter,
  switchMap,
  tap,
} from 'rxjs/operators';
import { NzTableFilterService } from './nz-table-filter.service';
import { NzTableFilterModel } from './nz-table-filter-model';
import { NzTableSortModel } from './nz-table-sort-model';
import {
  BehaviorSubject,
  fromEvent,
} from 'rxjs';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { NzuInputComponent } from 'src/app/input/nzu-input.component';
import { NzuCheckboxComponent } from 'src/app/checkbox/nzu-checkbox.component';
import { NzuSelectComponent } from '../select/select.component';

@Directive({
  // tslint:disable-next-line:directive-selector
  selector: 'nz-table th[nzFilter], nz-table th[nzSort]',
})
export class NzTableFilterDirective implements OnInit, OnDestroy {
  @Input() nzFilter: string;
  @Input() nzSelectSearch: boolean;
  @Input() nzSort: string;
  @Input() nzInitSort: 'ascend' | 'descend' | null;
  @Input() nzFilterType: 'text' | 'number' | 'date' | 'select' | 'checkbox' | 'select-include';
  @Input() nzPlaceHolder = '';
  @Input() debounce = 300;
  @Input() nzSortLabel = '';
  @Input() nzLocalStorageKey: string;

  private _filterValue: any;

  @Input('nzFilterValue')
  set filterValue(value: any) {
    if (this._filterValue === value) {
      return;
    }
    if (this._input) {
      this._input.writeValue(value);
    }
    this._filterValue = value;
  }

  @Input() nzSelectLabel: string;
  @Input() nzSelectValue: string;

  @Input('nzSelectItems')
  set selectItems(value: any[]) {
    this._selectItems = value;
    if (this._input) {
      this._input.items = this._selectItems;
    }
  }

  private _selectItems = [];

  private _inputRef: ComponentRef<NzuInputComponent | NzDatePickerComponent | NzuSelectComponent | (NzuCheckboxComponent & any)>;
  private _input: NzuInputComponent | NzDatePickerComponent | NzuSelectComponent | (NzuCheckboxComponent & any);

  private filterSubject: BehaviorSubject<any> = new BehaviorSubject<any>('init');

  private sortSubject: BehaviorSubject<string> = new BehaviorSubject<string>(null);

  constructor(
    private resolver: ComponentFactoryResolver,
    private element: ElementRef,
    private viewContainerRef: ViewContainerRef,
    private injector: Injector,
    private service: NzTableFilterService,
    public table: NzTableComponent,
    private renderer: Renderer2,
  ) {}

  ngOnInit(): void {
    if (!this.nzFilter && !this.nzSort) {
      throw new Error('Не выбрано поле для фильтрации или сортировки');
    }

    this.service
      .initData(this.table)
      .pipe(
        filter((value) => value),
        tap(() => {
          if (this.nzSort !== undefined) {
            this._createSort();

            this.sortSubject
              .pipe(
                // distinctUntilChanged(),
                // debounce(this.debounce ? this.debounce : 500),
                tap((value) =>
                  this.service.sort((this.table as any).genericId, {
                    sortValue: value,
                    sortName: this.nzSort || this.nzFilter,
                  } as NzTableSortModel),
                ),
              )
              .subscribe();
          }

          if (this.nzFilter) {
            switch (this.nzFilterType) {
              case 'date':
                this._createInput(NzDatePickerComponent);
                break;
              case 'select-include':
                this._createInput(NzuSelectComponent);
                break;
              case 'select':
                this._createInput(NzuSelectComponent);
                break;
              case 'checkbox':
                this._createInput(NzuCheckboxComponent);
                break;
              default:
                this._createInput(NzuInputComponent);
                break;
            }
          }
        }),
        switchMap(() => this.filterSubject),
        filter((i) => i !== 'init'),
        distinctUntilChanged(),
        debounceTime(this.debounce ? this.debounce : 500),
        tap((value: unknown) => {
          if (this.nzLocalStorageKey) {
            if (value) {
              localStorage.setItem(this.nzLocalStorageKey, value as string);
            } else {
              localStorage.removeItem(this.nzLocalStorageKey);
            }
          }
          this.service.filter((this.table as any).genericId, {
            filterType: this.nzFilterType,
            filterField: this.nzFilter || this.nzSort,
            value,
          } as NzTableFilterModel);
        }),
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this._destroyInput();
    this.service.removeFilter((this.table as any).genericId, this.nzFilter);
  }

  private _createSort(): void {
    const link = document.createElement('a');
    link.innerText = this.nzSortLabel ? this.nzSortLabel : this.viewContainerRef.element.nativeElement.innerText;
    link.classList.add('sort-link');
    this.viewContainerRef.element.nativeElement.innerText = '';

    fromEvent(link, 'click')
      .pipe(
        untilDestroyed(this),
        tap(() => {
          switch (this.sortSubject.value) {
            default:
              this.sortSubject.next('ascend');
              break;
            case 'ascend':
              this.sortSubject.next('descend');
              break;
            case 'descend':
              this.sortSubject.next(null);
              break;
          }
        }),
      )
      .subscribe();

    this.renderer.appendChild(this.viewContainerRef.element.nativeElement, link);

    if (this.nzInitSort) {
      this.sortSubject.next(this.nzInitSort);
    }
  }

  private _createInput<T>(
    component: Type<NzuInputComponent | NzDatePickerComponent | NzuSelectComponent | NzuCheckboxComponent> | InjectionToken<T>,
  ): void {
    if (!this._inputRef) {
      this._inputRef = this.viewContainerRef.createComponent(
        this.resolver.resolveComponentFactory(
          component as Type<NzuInputComponent | NzDatePickerComponent | NzuSelectComponent | (NzuCheckboxComponent & any)>,
        ),
      );
      this._input = this._inputRef.instance;

      this._input.nzPlaceHolder = this.nzPlaceHolder;
      if (this.nzFilterType === 'number') {
        this._input.type = 'number';
      }
      if (this.nzFilterType === 'checkbox') {
        this._input.label = this.nzPlaceHolder;
      }
      if (this.nzFilterType === 'select' || this.nzFilterType === 'select-include') {
        this._input._size = 'default';
        this._input.isSearchable = this.nzSelectSearch;
        this._input.labelField = this.nzSelectLabel;
        this._input.valueField = this.nzSelectValue;
        this._input.items = this._selectItems;
        this._input.allowClear = true;
      }
      this._input.placeholder = this.nzPlaceHolder;
      this._input.nzSize = 'default';

      this._input.onChange = (value) => this.filterSubject.next(value);

      if (this._filterValue) {
        this._input.writeValue(this._filterValue);
      } else if (localStorage.getItem(this.nzLocalStorageKey)) {
        this._input.writeValue(+localStorage.getItem(this.nzLocalStorageKey) || localStorage.getItem(this.nzLocalStorageKey));
      }

      this.renderer.appendChild(
        this.viewContainerRef.element.nativeElement,
        (this._input.inputElement || this._input._elementRef).nativeElement,
      );
    }
  }

  private _destroyInput(): void {
    if (this._inputRef) {
      this._inputRef.destroy();
    }
  }
}
