import { Routes } from '@angular/router';
import { GridComponent } from './components/grid/grid.component';
import { PaymentsComponent } from './components/payments/payments.component';

export const routes: Routes = [
    { path: '', component: GridComponent },
    { path: 'payments', component: PaymentsComponent }
];
