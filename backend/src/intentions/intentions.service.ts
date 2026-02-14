import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios from 'axios';
import { Intention } from './entities/intention.entity';
import { CreateIntentionDto } from './dto/create-intention.dto';
import { UpdateIntentionDto } from './dto/update-intention.dto';
import { LeadsService } from '../leads/leads.service';

interface ViaCepResponse {
  erro?: boolean;
  cep?: string;
}

@Injectable()
export class IntentionsService {
  private readonly logger = new Logger(IntentionsService.name);

  constructor(
    @InjectRepository(Intention)
    private intentionRepository: Repository<Intention>,
    private leadsService: LeadsService,
  ) {}

  private async validateZipcode(cep: string): Promise<void> {
    try {
      this.logger.log(`Iniciando validação do CEP: ${cep}`);

      const response = await axios.get<ViaCepResponse>(
        `https://viacep.com.br/ws/${cep}/json/`,
      );

      if (response.data.erro) {
        this.logger.log(`CEP ${cep} não foi encontrado.`);
        throw new BadRequestException(`O CEP não foi encontrado.`);
      }
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Erro ao validar CEP ${cep}`, err.stack);
      throw new BadRequestException(
        `O CEP ${cep} é inválido ou não foi encontrado.`,
      );
    }
  }

  async create(createIntentionDto: CreateIntentionDto): Promise<Intention> {
    this.logger.log(
      `Iniciando criação de intenção. Dados: ${JSON.stringify(createIntentionDto)}`,
    );
    await this.validateZipcode(createIntentionDto.zipcode_start);
    await this.validateZipcode(createIntentionDto.zipcode_end);

    try {
      const intention = this.intentionRepository.create(createIntentionDto);
      const savedIntention = await this.intentionRepository.save(intention);

      this.logger.log(`Intenção criada com sucesso. ID: ${savedIntention.id}`);
      return savedIntention;
    } catch (error) {
      const err = error as Error;
      this.logger.error('Erro ao salvar intenção no banco de dados', err.stack);
      throw new InternalServerErrorException(
        'Erro ao processar criação da intenção.',
      );
    }
  }

  async update(
    id: string,
    updateIntentionDto: UpdateIntentionDto,
  ): Promise<Intention> {
    const intention = await this.intentionRepository.findOne({ where: { id } });

    this.logger.log(`Tentativa de atualização da intenção ID: ${id}`);

    if (!intention) {
      this.logger.log(`Intenção com ID ${id} não encontrada.`);
      throw new NotFoundException('Intenção de frete não encontrada.');
    }

    const lead = await this.leadsService.findOne(updateIntentionDto.lead_id);

    if (!lead) {
      this.logger.log(`Lead com ${updateIntentionDto.lead_id} não encontrado.`);
      throw new NotFoundException('Lead não encontrado para associação.');
    }

    intention.lead = lead;

    try {
      const updatedIntention = await this.intentionRepository.save(intention);
      this.logger.log(`Intenção com ID ${id} atualizada com sucesso.`);
      return updatedIntention;
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Erro ao atualizar intenção ID ${id}`, err.stack);
      throw new InternalServerErrorException('Erro ao salvar atualização.');
    }
  }
}
