export interface Product {
  id: number;
  category: string;
  name: string;
  price: number;
  stock: number;
}
export interface CreateProductDto {
  category: string;
  name: string;
  price: number;
  stock: number;
}
export interface UpdateProductDto {
  name: string;
  category: string;
  stock: number;
  price: number;
}
