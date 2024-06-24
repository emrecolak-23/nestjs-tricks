import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  HttpCode,
  HttpStatus,
  Patch,
  Delete,
  Query,
  Inject,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { CoffeesService } from './coffees.service';

import { CreateCoffeeDto, UpdateCoffeeDto } from './dto';
import { PaginationQueryDto } from 'src/common/dto';
import { Request } from 'express';
import { Public } from 'src/common/decorators/public.decorator';

import { ParseIntPipe } from 'src/common/pipes/parse-int.pipe';
import { Protocol } from 'src/common/decorators/protocol.decorator';
import { ApiForbiddenResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('coffees')
@UsePipes(ValidationPipe)
@Controller('coffees')
export class CoffeesController {
  constructor(
    private readonly coffeesService: CoffeesService,
    @Inject(REQUEST) private readonly request: Request,
  ) {
    console.log('CoffeesController instantiated');
  }

  @Get()
  @Public()
  @ApiForbiddenResponse({ description: 'Forbidden.' })
  findAll(
    @Protocol('https') protocol: string,
    @Query() paginationQuery: PaginationQueryDto,
  ) {
    console.log(protocol);
    return this.coffeesService.findAll(paginationQuery);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.coffeesService.findOne('' + id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createCoffeeDto: CreateCoffeeDto) {
    console.log(createCoffeeDto instanceof CreateCoffeeDto);
    return this.coffeesService.create(createCoffeeDto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateCoffeeDto: UpdateCoffeeDto,
  ) {
    return this.coffeesService.update(id, updateCoffeeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.coffeesService.remove(id);
  }
}
