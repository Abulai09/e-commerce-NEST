import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entity/order-entity';
import { OrderItem } from './entity/orderItem-entity';
import { User } from 'src/user/user.entity';
import { Cart } from 'src/cart/entity/cart-entity';
import { CartItem } from 'src/cart/entity/cart-item-entity';
import { Product } from 'src/products/entity/products-entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem, User, Cart, CartItem, Product]),
  ],
  providers: [OrdersService],
  controllers: [OrdersController],
  exports: [OrdersService],
})
export class OrdersModule {}
