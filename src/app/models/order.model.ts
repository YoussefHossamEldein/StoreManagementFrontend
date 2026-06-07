export interface OrderItem {
  productId: number;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  orderId: number;
  customerId: number;
  orderDate: string;
  totalAmount: number;
  status: string;
  items: OrderItem[];
}

export interface CreateOrderItemDto {
  productId: number;
  quantity: number;
}

export interface CreateOrderDto {
  customerId: number;
  items: CreateOrderItemDto[];
}
