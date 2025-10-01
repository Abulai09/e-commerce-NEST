import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cart } from './entity/cart-entity';
import { CartItem } from './entity/cart-item-entity';
import { User } from 'src/user/user.entity';
import { Product } from 'src/products/entity/products-entity';

@Module({
  imports: [TypeOrmModule.forFeature([Cart, CartItem, User, Product])],
  providers: [CartService],
  controllers: [CartController],
})
export class CartModule {}
