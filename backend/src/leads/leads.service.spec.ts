import { Test, TestingModule } from '@nestjs/testing';
import { LeadsService } from './leads.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Lead } from './entities/lead.entity';
import {
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { LeadCreatedEvent } from './events/lead-created.event';

describe('LeadsService', () => {
  let service: LeadsService;
  let mockRepo: Record<string, jest.Mock>;
  let mockEventEmitter: Record<string, jest.Mock>;

  beforeEach(async () => {
    mockRepo = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      findAndCount: jest.fn(),
    };

    mockEventEmitter = {
      emit: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LeadsService,
        { provide: getRepositoryToken(Lead), useValue: mockRepo },
        { provide: EventEmitter2, useValue: mockEventEmitter },
      ],
    }).compile();

    service = module.get<LeadsService>(LeadsService);
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('deve criar um lead e disparar o evento lead.created', async () => {
      const dto = { name: 'Teste', email: 'teste@email.com' };

      mockRepo.findOne.mockResolvedValue(null);
      mockRepo.create.mockReturnValue(dto);
      mockRepo.save.mockResolvedValue({ id: 'uuid-123', ...dto });

      const result = await service.create(dto);

      expect(result).toHaveProperty('id');
      expect(mockRepo.save).toHaveBeenCalled();
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'lead.created',
        expect.any(LeadCreatedEvent),
      );
    });

    it('deve falhar se o email já existir', async () => {
      const dto = { name: 'Teste', email: 'jaexiste@email.com' };
      mockRepo.findOne.mockResolvedValue({ id: '1', ...dto });

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
      expect(mockRepo.save).not.toHaveBeenCalled();
      expect(mockEventEmitter.emit).not.toHaveBeenCalled();
    });

    it('deve lançar InternalServerErrorException se o banco falhar ao salvar', async () => {
      const dto = { name: 'Teste', email: 'teste@email.com' };

      mockRepo.findOne.mockResolvedValue(null);
      mockRepo.create.mockReturnValue(dto);
      mockRepo.save.mockRejectedValue(new Error('Erro de conexão DB'));

      await expect(service.create(dto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('findOne', () => {
    it('deve retornar um lead se o ID existir', async () => {
      const lead = { id: 'uuid-123', name: 'Teste', email: 'teste@email.com' };
      mockRepo.findOne.mockResolvedValue(lead);

      const result = await service.findOne('uuid-123');

      expect(result).toEqual(lead);
      expect(mockRepo.findOne).toHaveBeenCalledWith({
        where: { id: 'uuid-123' },
      });
    });

    it('deve lançar NotFoundException se o ID não existir', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      await expect(service.findOne('id-inexistente')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAll', () => {
    it('deve retornar dados paginados e metadados corretos', async () => {
      const leads = [
        { id: '1', name: 'Lead 1' },
        { id: '2', name: 'Lead 2' },
      ];
      const total = 20;

      mockRepo.findAndCount.mockResolvedValue([leads, total]);

      const page = 1;
      const limit = 10;
      const result = await service.findAll(page, limit);

      expect(result.data).toEqual(leads);
      expect(result.meta).toEqual({
        total: 20,
        currentPage: 1,
        pageSize: 10,
        totalPages: 2,
      });

      expect(mockRepo.findAndCount).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        order: { name: 'ASC' },
      });
    });

    it('deve calcular corretamente a paginação', async () => {
      mockRepo.findAndCount.mockResolvedValue([[], 0]);

      await service.findAll(2, 5);

      expect(mockRepo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 5,
          take: 5,
        }),
      );
    });

    it('deve corrigir números negativos na paginação', async () => {
      mockRepo.findAndCount.mockResolvedValue([[], 0]);

      await service.findAll(-5, -10);

      expect(mockRepo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0,
          take: 1,
        }),
      );
    });
  });
});
