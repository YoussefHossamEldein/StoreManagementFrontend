import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CreateOrderDto, Order } from '../models/order.model';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private apiUrl = 'https://localhost:7099/api/orders';
  constructor(private http: HttpClient) {}
  getAll(): Observable<Order[]> {
    return this.http.get<Order[]>(this.apiUrl);
  }
  getById(id: number): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/${id}`);
  }
  create(dto: CreateOrderDto): Observable<Order> {
    return this.http.post<Order>(this.apiUrl, dto);
  }
  update(id: number, status: string): Observable<void> {
    const params = new HttpParams().set('status', status);
    return this.http.put<void>(`${this.apiUrl}/${id}`, null, { params });
  }
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
