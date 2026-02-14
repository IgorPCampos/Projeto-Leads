import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Lead } from './entities/lead.entity';
import { CreateLeadDto } from './dto/create-lead.dto';
import { LeadCreatedEvent } from './events/lead-created.event';

@Injectable()
export class LeadsService {
  private readonly logger = new Logger(LeadsService.name);

  constructor(
    @InjectRepository(Lead)
    private leadRepository: Repository<Lead>,
    private eventEmitter: EventEmitter2,
  ) {}

  async create(createLeadDto: CreateLeadDto): Promise<Lead> {
    this.logger.log(
      `Iniciando criação de lead para o email: ${createLeadDto.email}`,
    );

    const existingLead = await this.leadRepository.findOne({
      where: { email: createLeadDto.email },
    });

    if (existingLead) {
      this.logger.warn(
        `Tentativa de cadastro duplicado: ${createLeadDto.email}`,
      );
      throw new ConflictException(
        'Este e-mail já está cadastrado em nossa base.',
      );
    }

    const lead = this.leadRepository.create(createLeadDto);
    let savedLead: Lead;

    try {
      savedLead = await this.leadRepository.save(lead);
      this.logger.log(`Lead salvo no banco de dados com ID: ${savedLead.id}`);
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Erro ao salvar lead no banco: ${err.message}`,
        err.stack,
      );
      throw new InternalServerErrorException('Erro ao processar o cadastro.');
    }

    this.eventEmitter.emit(
      'lead.created',
      new LeadCreatedEvent(savedLead.email, savedLead.name),
    );
    this.logger.log(`Evento 'lead.created' emitido com sucesso.`);

    return savedLead;
  }

  async findOne(id: string): Promise<Lead | null> {
    this.logger.log(`Buscando lead com ID: ${id}`);

    const lead = await this.leadRepository.findOne({ where: { id } });

    if (!lead) {
      this.logger.warn(`Lead com ID ${id} não encontrado.`);

      throw new NotFoundException('Lead não encontrado.');
    } else {
      this.logger.log(`Lead encontrado: ${lead.name}`);
    }

    return lead;
  }

  async findAll(page: number = 1, limit: number = 10): Promise<Lead[]> {
    const pageNumber = page < 1 ? 1 : page;
    const limitNumber = limit < 1 ? 1 : limit;

    this.logger.log(
      `Listando leads - Página: ${pageNumber}, Limite: ${limitNumber}`,
    );

    const [results, total] = await this.leadRepository.findAndCount({
      skip: (pageNumber - 1) * limitNumber,
      take: limitNumber,
      order: { name: 'ASC' },
    });

    this.logger.log(
      `Encontrados ${results.length} leads nesta página (Total no banco: ${total})`,
    );

    return results;
  }
}
