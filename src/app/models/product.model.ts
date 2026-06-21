export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  isAvailable: boolean;
}

export interface CreateProductDto {
  name: string;
  category: string;
  price: number;
  stock: number;
}

export interface UpdateProductDto {
  name: string;
  category: string;
  price: number;
  stock: number;
}
