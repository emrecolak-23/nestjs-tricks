/* eslint-disable @typescript-eslint/no-unused-vars */
import { Inject, Injectable, NotFoundException, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import { Coffee } from './entities/coffee.entity';
import { Flavor } from './entities/flavor.entity';
import { CreateCoffeeDto, UpdateCoffeeDto } from './dto';
import { PaginationQueryDto } from 'src/common/dto';
// import { Event } from 'src/events/entities/event.entity';
// import {
//   COFFEE_BRANDS,
//   COFFEE_BRANDS_FACTORY,
//   COFFEE_BRANDS_INJECTABLE_ASYNC_FACTORY,
//   COFFEE_BRANDS_INJECTABLE_FACTORY,
// } from './coffees.constants';
import { ConfigService, ConfigType } from '@nestjs/config';
import coffeesConfig from './config/coffees.config';

export type CoffeesConfigType = ConfigType<typeof coffeesConfig>;

@Injectable({ scope: Scope.DEFAULT })
export class CoffeesService {
  constructor(
    @InjectRepository(Coffee)
    private readonly coffeeRepository: Repository<Coffee>,
    @InjectRepository(Flavor)
    private readonly flavorRepository: Repository<Flavor>,
    private readonly dataSource: DataSource,
    // @Inject(COFFEE_BRANDS) coffeeBrands: string[],
    // @Inject(COFFEE_BRANDS_FACTORY) coffeeBrandsFactory: string[],
    // @Inject(COFFEE_BRANDS_INJECTABLE_FACTORY)
    // coffeeBrandsInjectableFactory: string[],
    // @Inject(COFFEE_BRANDS_INJECTABLE_ASYNC_FACTORY)
    // coffeeBrandsInjectableAsyncFactory: string[],
    // private readonly configService: ConfigService,
    // @Inject(coffeesConfig.KEY)
    // private readonly coffeesConfig: CoffeesConfigType,
  ) {
    console.log('CoffeesService instantiated');
    // console.log(coffeesConfig.foo);
    // console.log(
    //   this.configService.get<string>('database.host', 'localhost'),
    //   'database.host',
    // );
    // console.log(this.configService.get('coffees.foo'));
    // console.log(coffeeBrands, 'coffeeBrands');
    // console.log(coffeeBrandsFactory, 'coffeeBrandsFactory');
    // console.log(coffeeBrandsInjectableFactory, 'coffeeBrandsInjectableFactory');
    // console.log(
    //   coffeeBrandsInjectableAsyncFactory,
    //   'coffeeBrandsInjectableAsyncFactory',
    // );
  }

  async findAll(paginationQuery: PaginationQueryDto) {
    const { limit, offset } = paginationQuery;
    return await this.coffeeRepository.find({
      relations: {
        flavors: true,
      },
      skip: offset,
      take: limit,
    });
  }

  async findOne(id: string) {
    const coffee = await this.coffeeRepository.findOne({
      where: { id: +id },
      relations: ['flavors'],
    });

    if (!coffee) throw new NotFoundException(`Coffee #${id} not found`);

    return coffee;
  }

  async create(createCoffeeDto: CreateCoffeeDto) {
    const flavors = await Promise.all(
      createCoffeeDto.flavors.map((name) => this.preloadFlavorByName(name)),
    );

    const coffee = this.coffeeRepository.create({
      ...createCoffeeDto,
      flavors,
    });
    return await this.coffeeRepository.save(coffee);
  }

  async update(id: string, updateCoffeeDto: UpdateCoffeeDto) {
    const flavors =
      updateCoffeeDto.flavors &&
      (await Promise.all(
        updateCoffeeDto.flavors.map((name) => this.preloadFlavorByName(name)),
      ));

    const coffee = await this.coffeeRepository.preload({
      id: +id,
      ...updateCoffeeDto,
      flavors,
    });

    if (!coffee) throw new NotFoundException(`Coffee #${id} not found`);

    return await this.coffeeRepository.save(coffee);
  }

  async remove(id: string) {
    const coffee = await this.findOne(id);
    return await this.coffeeRepository.remove(coffee);
  }

  // async recommendCoffee(coffee: Coffee) {
  //   const queryRunner = this.dataSource.createQueryRunner();
  //   await queryRunner.connect();
  //   await queryRunner.startTransaction();

  //   try {
  //     coffee.recommendations++;
  //     const recommendEvent = new Event();
  //     recommendEvent.name = 'recommend_coffee';
  //     recommendEvent.type = 'coffee';
  //     recommendEvent.payload = { coffeeId: coffee.id };

  //     await queryRunner.manager.save(coffee);
  //     await queryRunner.manager.save(recommendEvent);
  //     await queryRunner.commitTransaction();
  //   } catch (error) {
  //     await queryRunner.rollbackTransaction();
  //   } finally {
  //     await queryRunner.release();
  //   }
  // }

  private async preloadFlavorByName(name: string): Promise<Flavor> {
    const existingFlavor = await this.flavorRepository.findOne({
      where: { name },
    });

    if (existingFlavor) {
      return existingFlavor;
    }

    return this.flavorRepository.create({ name });
  }
}
