import { Routes } from '@angular/router';
import { ProductComponent } from './components/product.component/product.component';
import { CustomerComponent } from './components/customer.component/customer.component';
import { OrderComponent } from './components/order.component/order.component';
import { DashboardComponent } from './components/dashboard.component/dashboard.component';
import { LoginComponent } from './components/login.component/login.component';
import { RegisterComponent } from './components/register.component/register.component';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard, adminGuard] },
  { path: 'products', component: ProductComponent, canActivate: [authGuard] },
  { path: 'customers', component: CustomerComponent, canActivate: [authGuard] },
  { path: 'orders', component: OrderComponent, canActivate: [authGuard] },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
];
