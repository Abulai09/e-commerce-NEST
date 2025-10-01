import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { JwtAuthGuard } from 'src/guards/jwtAuthGuard';

@Controller('cart')
export class CartController {
  constructor(readonly cartServ: CartService) {}

  @Get('getMyCart')
  @UseGuards(JwtAuthGuard)
  async getMyCart(@Req() req) {
    const userId = req.user.id;
    return await this.cartServ.getMyCart(userId);
  }

  @Post('addtoCart/:id')
  @UseGuards(JwtAuthGuard)
  async addToCart(
    @Req() req,
    @Param('id') id: number,
    @Body('quantity') quantity: number,
  ) {
    const userId = req.user.id;
    return await this.cartServ.addToCart(userId, Number(id), Number(quantity));
  }

  @Delete('removeFromCart/:id')
  @UseGuards(JwtAuthGuard)
  async removeFromCart(
    @Req() req,
    @Param('id') id: number,
    @Body('quantity') quantity: number,
  ) {
    const userId = req.user.id;
    return await this.cartServ.removeFromCart(userId, Number(id), quantity);
  }
}
