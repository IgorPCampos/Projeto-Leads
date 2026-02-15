import { Test, TestingModule } from '@nestjs/testing';
import { IntentionsController } from './intentions.controller';
import { IntentionsService } from './intentions.service';
import { CreateIntentionDto } from './dto/create-intention.dto';
import { UpdateIntentionDto } from './dto/update-intention.dto';

describe('IntentionsController', () => {
  let controller: IntentionsController;
  let mockService: Record<string, jest.Mock>;

  beforeEach(async () => {
    mockService = {
      create: jest.fn(),
      update: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [IntentionsController],
      providers: [
        {
          provide: IntentionsService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<IntentionsController>(IntentionsController);
  });

  it('deve estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('deve chamar o service.create com os dados corretos', async () => {
      const dto: CreateIntentionDto = {
        zipcode_start: '01001000',
        zipcode_end: '20040002',
      };

      const expectedResult = { id: 'uuid-1', ...dto };

      mockService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(dto);

      expect(result).toEqual(expectedResult);
      expect(mockService.create).toHaveBeenCalledWith(dto);
      expect(mockService.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('update', () => {
    it('deve chamar o service.update com ID e DTO corretos', async () => {
      const id = 'uuid-intention-1';
      const dto: UpdateIntentionDto = { lead_id: 'uuid-lead-1' };

      const expectedResult = { id, lead: { id: dto.lead_id } };

      mockService.update.mockResolvedValue(expectedResult);

      const result = await controller.update(id, dto);

      expect(result).toEqual(expectedResult);
      expect(mockService.update).toHaveBeenCalledWith(id, dto);
    });
  });
});
