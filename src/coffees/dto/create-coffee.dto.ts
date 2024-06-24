import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateCoffeeDto {
  @ApiProperty({ description: 'The name of a coffee.' })
  @IsString()
  @IsNotEmpty()
  readonly name: string;

  @ApiProperty({ description: 'The brand of a coffee.' })
  @IsString()
  @IsNotEmpty()
  readonly brand: string;

  @ApiProperty({ example: [] })
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  readonly flavors: string[];
}
