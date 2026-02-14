import { Test, TestingModule } from '@nestjs/testing';
import { LeadsService } from './leads.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Lead } from './entities/lead.entity';
import { ConflictException } from '@nestjs/common';
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
      find: jest.fn(),
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

  it('deve falhar se o email já existir e não disparar o evento', async () => {
    const dto = { name: 'Teste', email: 'jaexiste@email.com' };
    mockRepo.findOne.mockResolvedValue({ id: '1', ...dto });

    await expect(service.create(dto)).rejects.toThrow(ConflictException);

    expect(mockEventEmitter.emit).not.toHaveBeenCalled();
  });
});
