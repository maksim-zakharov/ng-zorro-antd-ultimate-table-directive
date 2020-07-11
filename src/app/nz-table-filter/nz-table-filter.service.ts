import { Injectable } from '@angular/core';
import { NzTableComponent } from 'ng-zorro-antd';
import { NzTableFilterModel } from './nz-table-filter-model';
import { DatePipe } from '@angular/common';
import {
  filter,
  tap,
} from 'rxjs/operators';
import { BehaviorSubject, Observable } from 'rxjs';
import { NzTableSortModel } from './nz-table-sort-model';
import { fieldExtractor } from './field-extractor';

@Injectable()
export class NzTableFilterService {
  private _genericId = 0;

  private _tableMap: Map<number, NzTableComponent & any>;
  private _tableData: Map<number, any[]>;
  private _tableInits: Map<number, BehaviorSubject<boolean>>;
  private _tableFilters: Map<number, NzTableFilterModel[]>;
  private _tableSorts: Map<number, NzTableSortModel[]>;

  private _tableChanges: Map<number, BehaviorSubject<'page' | 'sort' | 'filter' | 'change'>>;

  constructor(private datePipe: DatePipe) {
  }

  /**
   * Инициализирует данные для сервиса и выбранное таблицы
   * @param table Новая таблица
   */
  initData(table: NzTableComponent | any): BehaviorSubject<boolean> {
    if (!table.genericId) {
      table.genericId = ++this._genericId;
    }
    const nodeIndex = table.genericId;
    // Объявляем мапы если сервис только стартовал
    if (!this._tableMap) {
      this._tableMap = new Map<number, NzTableComponent>();
      this._tableData = new Map<number, any[]>();
      this._tableInits = new Map<number, BehaviorSubject<boolean>>();
      this._tableFilters = new Map<number, NzTableFilterModel[]>();
      this._tableSorts = new Map<number, NzTableSortModel[]>();

      this._tableChanges = new Map<number, BehaviorSubject<'page' | 'sort' | 'filter' | 'change'>>();
    }

    // Добавим дефолтные значения для новой таблицы
    if (!this._tableMap.get(nodeIndex)) {
      this._tableMap.set(nodeIndex, table);
      this._tableMap.get(nodeIndex)._generateDataCustom = _generateDataCustom;
      this._tableData.set(nodeIndex, table.nzData || []);
      this._tableChanges.set(nodeIndex, new BehaviorSubject<'page' | 'sort' | 'filter' | 'change'>('change'));
      this._tableFilters.set(nodeIndex, []);
      this._tableSorts.set(nodeIndex, []);
      this._tableInits.set(nodeIndex, new BehaviorSubject<boolean>(table.nzData && table.nzData.length > 0));

      this._updateChanges(nodeIndex).subscribe();

      this._tableMap
          .get(nodeIndex)
          .nzCurrentPageDataChange.pipe(tap(() => this._tableChanges.get(nodeIndex).next('change')))
          .subscribe();

    }

    return this._tableInits.get(nodeIndex);
  }

  /**
   * Получает актуальные данные для таблицы
   * @param nodeIndex Уникальный индекс таблицы
   */
  public getTableData(nodeIndex: number): any[] {
    return this._tableData.get(nodeIndex);
  }

  sort(nodeIndex: number, model: NzTableSortModel): void {
    this._addSort(nodeIndex, model);

    this._tableChanges.get(nodeIndex).next('sort');
  }

  /**
   * Фильтрует таблицу по выбранному полю фильтрации
   * @param nodeIndex Уникальный индекс таблицы
   * @param model Выбранное поле фильтрации
   */
  filter(nodeIndex: number, model: NzTableFilterModel): void {
    this._addFilter(nodeIndex, model);

    this._tableChanges.get(nodeIndex).next('filter');
  }

  /**
   * Удаляет фильтр в таблице
   * @param nodeIndex Уникальный индекс таблицы
   * @param filterField Уникальное поле фильтрации
   */
  removeFilter(nodeIndex: number, filterField: string): void {
    if (!this._tableFilters.get(nodeIndex)) {
      return;
    }
    this._tableFilters.set(
      nodeIndex,
      this._tableFilters.get(nodeIndex).filter((i) => i.filterField !== filterField),
    );
    if (this._tableFilters.get(nodeIndex).length) {
      return;
    }
    // Если у таблицы больше не осталось фильтров, то удалим все данные по таблице
    this._clearData(nodeIndex);
  }

  private _updateChanges(nodeIndex: number): Observable<'page' | 'sort' | 'filter' | 'change'> {
    return this._tableChanges.get(nodeIndex).pipe(
      tap((value) => {
        if (value === 'change') {
          this._tableData.set(nodeIndex, this._tableMap.get(nodeIndex).nzData || []);
        }
        this._tableMap.get(nodeIndex).data = this._applySorts(nodeIndex, this._applyFilters(nodeIndex));
        this._tableMap.get(nodeIndex)._generateDataCustom();
        this._tableMap.get(nodeIndex).cdr.markForCheck();
      }),
      filter(() => !this._tableInits.get(nodeIndex).value),
      tap(() => this._tableInits.get(nodeIndex).next(true)),
    );
  }

  /**
   * Добавляет для таблицы новый фильтр
   * @param nodeIndex Уникальный индекс таблицы
   * @param model Новый фильтр для таблицы
   */
  private _addSort(nodeIndex: number, model: NzTableSortModel): void {
    if (!this._tableSorts.get(nodeIndex).find((i) => i.sortName === model.sortName)) {
      this._tableSorts.set(nodeIndex, [...this._tableSorts.get(nodeIndex), model]);
    } else {
      const filters = this._tableSorts.get(nodeIndex);
      const existFilter = filters.find((i) => i.sortName === model.sortName);
      existFilter.sortValue = model.sortValue;
      filters.filter((i) => i.sortName !== model.sortName).forEach((f) => ( f.sortValue = undefined ));
      this._tableSorts.set(nodeIndex, filters);
    }
  }

  /**
   * Добавляет для таблицы новый фильтр
   * @param nodeIndex Уникальный индекс таблицы
   * @param model Новый фильтр для таблицы
   */
  private _addFilter(nodeIndex: number, model: NzTableFilterModel): void {
    if (!this._tableFilters.get(nodeIndex).find((i) => i.filterField === model.filterField)) {
      this._tableFilters.set(nodeIndex, [...this._tableFilters.get(nodeIndex), model]);
    } else {
      const filters = this._tableFilters.get(nodeIndex);
      const existFilter = filters.find((i) => i.filterField === model.filterField);
      existFilter.value = model.value;
      this._tableFilters.set(nodeIndex, filters);
    }
  }

  /**
   * Применяет к таблице все существующие для нее фильтры
   * @param nodeIndex Уникальный индекс таблицы
   * @param filterData данные
   */
  private _applySorts(nodeIndex: number, filterData?: any[]): any[] {
    if (!filterData) {
      filterData = [...this.getTableData(nodeIndex)];
    }
    this._tableSorts
        .get(nodeIndex)
        .filter((i) => i.sortValue !== null && i.sortValue !== undefined)
        .forEach((model) => {
          filterData = [
            ...filterData.sort((_a, _b) => {
              const a = fieldExtractor(model.sortName, _a);
              const b = fieldExtractor(model.sortName, _b);
              if (a > b || !b) {
                return model.sortValue === 'ascend' ? 1 : -1;
              } else if (a < b || !a) {
                return model.sortValue === 'ascend' ? -1 : 1;
              } else {
                return 0;
              }
            }),
          ];
        });
    return filterData;
  }

  /**
   * Применяет к таблице все существующие для нее фильтры
   * @param nodeIndex Уникальный индекс таблицы
   * @param filterData данные
   */
  private _applyFilters(nodeIndex: number, filterData?: any[]): any[] {
    if (!filterData) {
      filterData = [...this.getTableData(nodeIndex)];
    }
    this._tableFilters.get(nodeIndex).forEach((model) => {
      switch (model.filterType) {
        // case 'date':
        //   filterData = filterData.filter(i => {
        //       const field = fieldExtractor(model.filterField, i);
        //       return !model.value ||
        //         field &&
        //       this._isDateEquals(new Date(field as Date), new Date(model.value));
        //     }
        //   );
        //   break;
        case 'select-include':
          filterData = filterData.filter((i) => {
            const field = fieldExtractor(model.filterField, i);
            return (
              model.value === null ||
              model.value === undefined ||
              model.value === '' ||
              (
                field &&
                ( field.toString().length > model.value.length ?
                  field.toString().includes(model.value) :
                  model.value.includes(field.toString()) )
              )
            );
          });
          break;
        case 'select':
          filterData = filterData.filter((i) => {
            const field = fieldExtractor(model.filterField, i);
            return model.value === null || model.value === undefined || model.value === '' || ( field === model.value );
          });
          break;
        case 'checkbox':
          filterData = filterData.filter((i) => {
            const field = fieldExtractor(model.filterField, i);
            return !model.value || ( field && model.value );
          });
          break;
        default:
          filterData = filterData.filter((i) => {
            const field = fieldExtractor(model.filterField, i);
            return !model.value || ( field && this._isValueIncludes(field, model.value) );
          });
          break;
      }
    });
    return filterData;
  }

  /**
   * Проверяет равенство двух дат (без времени)
   * @param leftDate Дата1
   * @param rightDate Дата2
   */
  private _isDateEquals(leftDate: Date, rightDate: Date): boolean {
    return this.datePipe.transform(leftDate, 'dd.MM.yyyy') === this.datePipe.transform(rightDate, 'dd.MM.yyyy');
  }

  /**
   * Проверяет равенство двух значений
   * @param leftValue Значение1
   * @param rightValue Значение2
   */
  private _isValueIncludes(leftValue: any, rightValue: any): boolean {
    return leftValue
      .toString()
      .toLowerCase()
      .includes(rightValue.toString().toLowerCase());
  }

  /**
   * Очищает все данные по таблице
   * @param nodeIndex Уникальный индекс таблицы
   */
  private _clearData(nodeIndex: number): void {
    this._tableChanges.delete(nodeIndex);
    this._tableSorts.delete(nodeIndex);
    this._tableFilters.delete(nodeIndex);
    this._tableMap.delete(nodeIndex);
    this._tableData.delete(nodeIndex);
  }
}

function _generateDataCustom(): void {
  let data = this.data || [];
  this.nzTotal = data.length;
  const maxPageIndex = Math.ceil(data.length / this.nzPageSize) || 1;
  const pageIndex = this.nzPageIndex && this.nzPageIndex > maxPageIndex ? maxPageIndex : this.nzPageIndex || 1;
  this.nzPageIndex = pageIndex;
  this.nzPageIndexChange.emit(pageIndex);
  data = data.slice(( this.nzPageIndex - 1 ) * this.nzPageSize, this.nzPageIndex * this.nzPageSize);
  this.data = [...data];
}
