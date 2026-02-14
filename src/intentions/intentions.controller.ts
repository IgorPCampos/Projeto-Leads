import { Controller, Post, Body, Put, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { IntentionsService } from './intentions.service';
import { CreateIntentionDto } from './dto/create-intention.dto';
import { UpdateIntentionDto } from './dto/update-intention.dto';

@ApiTags('Intentions')
@Controller('intention')
export class IntentionsController {
  constructor(private readonly intentionsService: IntentionsService) {}

  @Post()
  @ApiOperation({ summary: 'Cadastra uma nova intenção de frete' })
  @ApiResponse({ status: 201, description: 'Intenção criada.' })
  @ApiResponse({ status: 400, description: 'CEP inválido.' })
  create(@Body() createIntentionDto: CreateIntentionDto) {
    return this.intentionsService.create(createIntentionDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Associa um lead a uma intenção existente' })
  @ApiResponse({ status: 200, description: 'Intenção atualizada.' })
  @ApiResponse({ status: 404, description: 'Intenção ou Lead não encontrado.' })
  update(
    @Param('id') id: string,
    @Body() updateIntentionDto: UpdateIntentionDto,
  ) {
    return this.intentionsService.update(id, updateIntentionDto);
  }
}
