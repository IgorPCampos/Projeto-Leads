import { Test, TestingModule } from '@nestjs/testing';
import { IntentionsService } from './intentions.service';
import { LeadsService } from '../leads/leads.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Intention } from './entities/intention.entity';
import axios from 'axios';
import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

jest.mock('axios');

describe('IntentionsService', () => {
  let service: IntentionsService;
  let mockRepo: Record<string, jest.Mock>;
  let mockLeadsService: Record<string, jest.Mock>;

  beforeEach(async () => {
    mockRepo = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
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

  describe('create', () => {
    it('deve criar intenção com sucesso se os CEPs forem válidos', async () => {
      const dto = { zipcode_start: '01001000', zipcode_end: '20040002' };

      (axios.get as jest.Mock).mockResolvedValue({
        data: { localidade: 'São Paulo', uf: 'SP' },
      });

      mockRepo.create.mockReturnValue(dto);
      mockRepo.save.mockResolvedValue({ id: '1', ...dto });

      const result = await service.create(dto);

      expect(result).toHaveProperty('id');
      expect(axios.get as jest.Mock).toHaveBeenCalledTimes(2);
    });

    it('deve falhar se o ViaCEP retornar { erro: true }', async () => {
      const dto = { zipcode_start: '00000000', zipcode_end: '01001000' };

      (axios.get as jest.Mock).mockResolvedValueOnce({ data: { erro: true } });

      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    });

    it('deve falhar se a requisição ao ViaCEP quebrar (Erro de Rede)', async () => {
      const dto = { zipcode_start: '01001000', zipcode_end: '01001000' };

      (axios.get as jest.Mock).mockRejectedValue(new Error('Network Error'));

      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    });

    it('deve lançar InternalServerErrorException se falhar ao salvar no banco', async () => {
      const dto = { zipcode_start: '01001000', zipcode_end: '01001000' };

      (axios.get as jest.Mock).mockResolvedValue({
        data: { localidade: 'Ok' },
      });
      mockRepo.create.mockReturnValue(dto);
      mockRepo.save.mockRejectedValue(new Error('DB Error'));

      await expect(service.create(dto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('update', () => {
    const updateDto = { lead_id: 'lead-uuid-123' };
    const intentionId = 'intention-uuid-1';

    it('deve associar um lead a uma intenção existente com sucesso', async () => {
      const existingIntention = { id: intentionId, lead: null };
      const existingLead = { id: updateDto.lead_id, name: 'Lead Teste' };

      mockRepo.findOne.mockResolvedValue(existingIntention);
      mockLeadsService.findOne.mockResolvedValue(existingLead);
      mockRepo.save.mockResolvedValue({
        ...existingIntention,
        lead: existingLead,
      });

      const result = await service.update(intentionId, updateDto);

      expect(result.lead).toEqual(existingLead);
      expect(mockRepo.save).toHaveBeenCalled();
    });

    it('deve falhar se a intenção não for encontrada', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      await expect(service.update(intentionId, updateDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockLeadsService.findOne).not.toHaveBeenCalled();
    });

    it('deve falhar se o lead não for encontrado', async () => {
      const existingIntention = { id: intentionId };
      mockRepo.findOne.mockResolvedValue(existingIntention);

      mockLeadsService.findOne.mockResolvedValue(null);

      await expect(service.update(intentionId, updateDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockRepo.save).not.toHaveBeenCalled();
    });

    it('deve lançar InternalServerErrorException se falhar ao atualizar no banco', async () => {
      const existingIntention = { id: intentionId };
      const existingLead = { id: updateDto.lead_id };

      mockRepo.findOne.mockResolvedValue(existingIntention);
      mockLeadsService.findOne.mockResolvedValue(existingLead);

      mockRepo.save.mockRejectedValue(new Error('DB Error'));

      await expect(service.update(intentionId, updateDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
