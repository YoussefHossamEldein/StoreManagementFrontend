import { Routes } from '@angular/router';
import { ProductComponent } from './components/product.component/product.component';
import { CustomerComponent } from './components/customer.component/customer.component';
import { OrderComponent } from './components/order.component/order.component';
import { DashboardComponent } from './components/dashboard.component/dashboard.component';

export const routes: Routes = [
  { path: 'products', component: ProductComponent },
  { path: 'customers', component: CustomerComponent },
  { path: 'orders', component: OrderComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
];
