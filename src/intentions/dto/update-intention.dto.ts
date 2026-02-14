import { IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateIntentionDto {
  @ApiProperty({
    example: 'uuid-do-lead',
    description: 'ID do lead a ser associado',
  })
  @IsUUID('4', { message: 'ID do lead inválido.' })
  @IsNotEmpty()
  lead_id: string;
}
