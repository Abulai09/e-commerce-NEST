import { Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from 'src/guards/jwtAuthGuard';

@Controller('orders')
export class OrdersController {
  constructor(private orderServ: OrdersService) {}

  @Post('addOrder')
  @UseGuards(JwtAuthGuard)
  async addOrder(@Req() req) {
    const user = req.user.id;
    return await this.orderServ.createOrder(user);
  }

  @Get('getOrder')
  @UseGuards(JwtAuthGuard)
  async getMyOrder(@Req() req) {
    const user = req.user.id;
    return await this.orderServ.getMyOrder(user);
  }

  @Post('cancelOrder/:id')
  @UseGuards(JwtAuthGuard)
  async cancelOrder(@Req() req, @Param('id') id: number) {
    const user = req.user.id;
    return await this.orderServ.cancelOrder(user, Number(id));
  }
}
