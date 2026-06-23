export interface OrderItem {
  productId: number;
  quantity: number;
  unitPrice: number;
}
export interface Order {
  id: number;
  status: string;
  customerId: number;
  totalAmount: number;
  orderDate: string;
  items: OrderItem[];
  createdByEmail?: string;
}
export interface CreateOrderItemDto {
  quantity: number;
  productId: number;
}
export interface CreateOrderDto {
  customerId: number;
  items: CreateOrderItemDto[];
}
