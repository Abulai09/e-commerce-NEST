import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/user.entity';
import { Repository } from 'typeorm';
import { Order } from './entity/order-entity';
import { OrderItem } from './entity/orderItem-entity';
import { Cart } from 'src/cart/entity/cart-entity';
import { CartItem } from 'src/cart/entity/cart-item-entity';
import { Product } from 'src/products/entity/products-entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Order) private orderRepo: Repository<Order>,
    @InjectRepository(OrderItem) private OrderItemRepo: Repository<OrderItem>,
    @InjectRepository(Cart) private CartRepo: Repository<Cart>,
    @InjectRepository(CartItem) private CartItemRepo: Repository<CartItem>,
    @InjectRepository(Product) private ProductRepo: Repository<Product>,
  ) {}

  async createOrder(userId: number) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const cart = await this.CartRepo.findOne({
      where: { userId, isActive: true },
      relations: ['items', 'items.product'],
    });
    if (!cart || cart.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }
    const totalPrice = cart.items.reduce(
      (sum, item) => sum + Number(item.product.price) * item.quantity,
      0,
    );

    for (let items of cart.items) {
      if (items.product.stock < items.quantity) {
        throw new BadRequestException(
          `Not enough stock for product: ${items.product.name}`,
        );
      }
    }

    const order = await this.orderRepo.create({
      user,
      userId,
      totalPrice,
      status: 'pending',
      items: [],
    });
    await this.orderRepo.save(order);

    const orderItems = this.OrderItemRepo.create(
      cart.items.map((cartItem) => ({
        order,
        orderId: order.id,
        product: cartItem.product,
        productId: cartItem.productId,
        quantity: cartItem.quantity,
        priceAtPurchase: cartItem.product.price,
      })),
    );
    await this.OrderItemRepo.save(orderItems);

    for (let items of cart.items) {
      items.product.stock -= items.quantity;
      await this.ProductRepo.save(items.product);
    }

    await this.CartItemRepo.remove(cart.items);
    console.log(`user ${userId} added order`);
    return {
      message: 'Order created successfully',
      orderId: order.id,
      totalPrice,
      status: order.status,
      items: orderItems.map((i) => ({
        name: i.product.name,
        quantity: i.quantity,
      })),
    };
  }

  async getMyOrder(userId: number) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const orders = await this.orderRepo.find({
      where: { userId },
      relations: ['items', 'items.product'],
      order: { id: 'DESC' },
    });
    console.log(`user ${userId} got order`);

    return orders.map((o) => ({
      id: o.id,
      totalPrice: o.totalPrice,
      status: o.status,
      items: o.items.map((i) => ({
        name: i.product.name,
        quantity: i.quantity,
        price: i.product.price,
      })),
    }));
  }

  async cancelOrder(userId: number, orderId: number) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const order = await this.orderRepo.findOne({
      where: { userId, id: orderId },
      relations: ['items', 'items.product'],
    });
    if (!order) throw new NotFoundException('order not found');

    if (order.status !== 'pending') {
      throw new BadRequestException(
        `Order cannot be cancelled. Current status: ${order.status}`,
      );
    }

    for (let item of order.items) {
      item.product.stock += item.quantity;
      await this.ProductRepo.save(item.product);
    }

    order.status = 'cancelled';
    await this.orderRepo.save(order);
    console.log(`user ${userId} cancelled order`);

    return { message: 'order cancelled' };
  }
}
