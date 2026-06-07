import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CreateProductDto, Product, UpdateProductDto } from '../models/product.model';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private apiUrl = 'https://localhost:7127/api/products';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl);
  }
  getById(Id: number): Observable<Product> {
    return this.http.get<Product>('${this.apiUrl}/${id}');
  }
  create(dto: CreateProductDto): Observable<number> {
    return this.http.post<number>(this.apiUrl, dto);
  }
  update(id: number, dto: UpdateProductDto): Observable<void> {
    return this.http.put<void>(this.apiUrl, dto);
  }
  delete(id: number): Observable<void> {
    return this.http.delete<void>('${this.apiUrl/${id}');
  }
}
