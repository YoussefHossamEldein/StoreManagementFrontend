export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
}

export interface CreateProductDto {
  name: string;
  category: string;
  price: number;
  stock: number;
}

export interface UpdateProductDto {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
}
