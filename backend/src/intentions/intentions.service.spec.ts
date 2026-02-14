import { Test, TestingModule } from '@nestjs/testing';
import { IntentionsService } from './intentions.service';
import { LeadsService } from '../leads/leads.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Intention } from './entities/intention.entity';
import axios from 'axios';
import { BadRequestException } from '@nestjs/common';

jest.mock('axios');

describe('IntentionsService', () => {
  let service: IntentionsService;
  let mockRepo: Record<string, jest.Mock>;
  let mockLeadsService: Record<string, jest.Mock>;

  beforeEach(async () => {
    mockRepo = {
      create: jest.fn(),
      save: jest.fn(),
    };

    mockLeadsService = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IntentionsService,
        { provide: getRepositoryToken(Intention), useValue: mockRepo },
        { provide: LeadsService, useValue: mockLeadsService },
      ],
    }).compile();

    service = module.get<IntentionsService>(IntentionsService);
  });

  it('deve criar intenção se os CEPs forem válidos', async () => {
    const dto = { zipcode_start: '01001000', zipcode_end: '20040002' };

    (axios.get as jest.Mock).mockResolvedValue({
      data: { localidade: 'Teste' },
    });

    mockRepo.create.mockReturnValue(dto);
    mockRepo.save.mockResolvedValue({ id: '1', ...dto });

    const result = await service.create(dto);
    expect(result).toHaveProperty('id');
  });

  it('deve falhar se o ViaCEP retornar erro', async () => {
    const dto = { zipcode_start: '00000000', zipcode_end: '01001000' };

    (axios.get as jest.Mock).mockResolvedValueOnce({ data: { erro: true } });

    await expect(service.create(dto)).rejects.toThrow(BadRequestException);
  });
});
