import { IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateIntentionDto {
  @ApiProperty({
    example: '01001000',
    description: 'CEP de origem',
  })
  @IsString()
  @Length(8, 8, { message: 'CEP deve conter 8 dígitos.' })
  zipcode_start: string;

  @ApiProperty({
    example: '20040002',
    description: 'CEP de destino',
  })
  @IsString()
  @Length(8, 8, { message: 'CEP deve conter 8 dígitos.' })
  zipcode_end: string;
}
