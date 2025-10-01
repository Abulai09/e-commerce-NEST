import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from './entity/cart-entity';
import { CartItem } from './entity/cart-item-entity';
import { Product } from 'src/products/entity/products-entity';
import { User } from 'src/user/user.entity';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart) private readonly cartRepo: Repository<Cart>,
    @InjectRepository(CartItem)
    private readonly cartItemRepo: Repository<CartItem>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  async addToCart(userId: number, productId: number, quantity: number) {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['cart'],
    });
    if (!user) throw new NotFoundException('User not found');

    const product = await this.productRepo.findOne({
      where: { id: productId },
    });
    if (!product) throw new NotFoundException('Product not found');

    let cart = user.cart;
    if (!cart) {
      cart = this.cartRepo.create({ user, items: [], isActive: true });
      await this.cartRepo.save(cart);
    }

    let cartItem = await this.cartItemRepo.findOne({
      where: { cart: { id: cart.id }, product: { id: product.id } },
    });

    if (cartItem) {
      cartItem.quantity += quantity;
    } else {
      cartItem = this.cartItemRepo.create({ cart, product, quantity });
    }
    console.log(`userId: ${userId} added`);
    await this.cartItemRepo.save(cartItem);
    return cartItem;
  }

  async getMyCart(userId: number) {
    const cart = await this.cartRepo.findOne({
      where: { userId, isActive: true },
      relations: ['items', 'items.product'],
    });

    if (!cart) throw new NotFoundException('Not Found');

    const items = cart.items.map((i) => ({
      productId: i.productId,
      productName: i.product.name,
      price: Number(i.product.price),
      quantity: i.quantity,
      total: Number(i.product.price) * i.quantity,
    }));

    const grandTotal = items.reduce((sum, i) => sum + i.total, 0);
    console.log(`userId: ${userId} got cart`);

    return { cartId: cart.id, items, grandTotal, isActive: cart.isActive };
  }

  async removeFromCart(userId: number, productId: number, quantity: number) {
    const cartItem = await this.cartItemRepo.findOne({
      where: {
        productId,
        cart: { userId, isActive: true },
      },
      relations: ['cart', 'product'],
    });

    if (!cartItem)
      throw new NotFoundException('Product not found in your cart');
    console.log(`userId: ${userId} removed product`);

    if (cartItem.quantity > quantity) {
      cartItem.quantity -= quantity;
      await this.cartItemRepo.save(cartItem);
      return { message: `Reduced quantity by ${quantity}`, cartItem };
    } else {
      await this.cartItemRepo.remove(cartItem);
      return { message: 'Product removed from cart' };
    }
  }
}
