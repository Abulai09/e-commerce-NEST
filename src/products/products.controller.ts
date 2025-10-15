import { Role } from 'src/guards/roleDecorator';
import { RoleGuard } from 'src/guards/roleGuard';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ProductDto } from './productDto';
import { ProductService } from './products.service';
import { JwtAuthGuard } from 'src/guards/jwtAuthGuard';

@Controller('product')
export class ProductController {
  constructor(private readonly prodServ: ProductService) {}

  @Get('products')
  async getAllProducts(@Query('page') page = 1, @Query('limit') limit = 3) {
    return await this.prodServ.pagination(page, limit);
  }

  @Get('getAll')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Role('admin')
  async getAll(
    @Query('minPrice') minPrice?: number,
    @Query('maxPrice') maxPrice?: number,
    @Query('word') word?: string,
  ) {
    return await this.prodServ.getProd(minPrice, maxPrice, word);
  }

  @Post('create')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Role('admin')
  async create(@Body() dto: ProductDto) {
    return await this.prodServ.createProd(dto);
  }

  @Delete('delProd/:id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Role('admin')
  async del(@Param('id') id: number) {
    return await this.prodServ.delete(Number(id));
  }
}
