import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entity/products-entity';
import { OrderItem } from 'src/orders/entity/orderItem-entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product, OrderItem])],
  providers: [ProductsService],
  controllers: [ProductsController],
})
export class ProductsModule {}
