import { Component, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';

export class User {
  firstName: string;
  lastName: string;
  havePets: boolean;
  birthDate: string;
  sex: 'man' | 'woman';
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'ng-zorro-antd-ultimate-table-directive';
  public storageKey = 'table-demo';
  public users$: Observable<User[]>;
  public loading = false;
  public sexes = ['man', 'woman'];

  public ngOnInit(): void {
    this.users$ = of(
      [
        { firstName: 'Maksim', lastName: 'Zakharov', havePets: true, sex: 'man', birthDate: '19.02.1995' },
        { firstName: 'Aleksandr', lastName: 'Gregorenko', havePets: false, sex: 'man', birthDate: '19.02.1996' },
      ],
    );
  }
}
