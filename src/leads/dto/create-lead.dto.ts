import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateLeadDto {
  @ApiProperty({ example: 'Igor Campos', description: 'Nome do lead' })
  @IsString()
  @IsNotEmpty({ message: 'O nome não pode ser vazio.' })
  name: string;

  @ApiProperty({ example: 'igor@email.com', description: 'Email válido' })
  @IsEmail({}, { message: 'O e-mail informado é inválido.' })
  email: string;
}
