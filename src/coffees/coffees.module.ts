import { Injectable, Module, Scope } from '@nestjs/common';
import { CoffeesService } from './coffees.service';
import { CoffeesController } from './coffees.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Coffee } from './entities/coffee.entity';
import { Flavor } from './entities/flavor.entity';
import { Event } from '../events/entities/event.entity';
import {
  COFFEE_BRANDS,
  COFFEE_BRANDS_FACTORY,
  COFFEE_BRANDS_INJECTABLE_ASYNC_FACTORY,
  COFFEE_BRANDS_INJECTABLE_FACTORY,
} from './coffees.constants';
import { DataSource } from 'typeorm';
import { ConfigModule } from '@nestjs/config';
import coffeesConfig from './config/coffees.config';

class ConfigService {}
class DevelopmentConfigService {}
class ProductionConfigService {}

@Injectable()
export class CoffeeBrandsFactory {
  create() {
    return ['buddy brew', 'nescafe'];
  }
}

@Module({
  imports: [
    TypeOrmModule.forFeature([Coffee, Flavor, Event]),
    ConfigModule.forFeature(coffeesConfig),
    // ConfigModule.forFeature(coffeesConfig),
  ],
  controllers: [CoffeesController],
  providers: [
    CoffeesService,
    {
      provide: COFFEE_BRANDS,
      useValue: ['buddy brew', 'nescafe'],
      scope: Scope.TRANSIENT,
    },
    {
      provide: ConfigService,
      useClass:
        process.env.NODE_ENV === 'development'
          ? DevelopmentConfigService
          : ProductionConfigService,
    },
    {
      provide: COFFEE_BRANDS_FACTORY,
      useFactory: () => ['buddy brew', 'nescafe'],
    },
    CoffeeBrandsFactory,
    {
      provide: COFFEE_BRANDS_INJECTABLE_FACTORY,
      useFactory: (brandsFactory: CoffeeBrandsFactory) =>
        brandsFactory.create(),
      inject: [CoffeeBrandsFactory],
    },
    {
      provide: COFFEE_BRANDS_INJECTABLE_ASYNC_FACTORY,
      useFactory: async (dataSource: DataSource): Promise<string[]> => {
        console.log(dataSource.options);
        const coffeeBrands = await Promise.resolve(['buddy brew', 'nescafe']);
        return coffeeBrands;
      },
      inject: [DataSource],
    },
  ],
  exports: [CoffeesService],
})
export class CoffeesModule {}
