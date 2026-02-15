import { Test, TestingModule } from '@nestjs/testing';
import { LeadsController } from './leads.controller';
import { LeadsService } from './leads.service';
import { CreateLeadDto } from './dto/create-lead.dto';

describe('LeadsController', () => {
  let controller: LeadsController;
  let mockService: Record<string, jest.Mock>;

  beforeEach(async () => {
    mockService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [LeadsController],
      providers: [{ provide: LeadsService, useValue: mockService }],
    }).compile();

    controller = module.get<LeadsController>(LeadsController);
  });

  it('deve estar definido', () => {
    expect(controller).toBeDefined();
  });

  it('deve chamar o service.create ao criar um lead', async () => {
    const dto: CreateLeadDto = {
      name: 'Teste',
      email: 'teste@email.com',
    };

    const expectedResult = { id: '1', ...dto };

    mockService.create.mockResolvedValue(expectedResult);

    const result = await controller.create(dto);

    expect(result).toEqual(expectedResult);
    expect(mockService.create).toHaveBeenCalledWith(dto);
  });

  it('deve chamar o service.findAll com paginação', async () => {
    const mockResult = { data: [], meta: { total: 0 } };
    mockService.findAll.mockResolvedValue(mockResult);

    await controller.findAll(2, 5);

    expect(mockService.findAll).toHaveBeenCalledWith(2, 5);
  });
});
