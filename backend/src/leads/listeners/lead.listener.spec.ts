import { Test, TestingModule } from '@nestjs/testing';
import { LeadListener } from './lead.listener';
import { MailerService } from '@nestjs-modules/mailer';
import { LeadCreatedEvent } from '../events/lead-created.event';
import { Logger } from '@nestjs/common';

describe('LeadListener', () => {
  let listener: LeadListener;
  let mockMailerService: Record<string, jest.Mock>;

  beforeEach(async () => {
    mockMailerService = {
      sendMail: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LeadListener,
        { provide: MailerService, useValue: mockMailerService },
      ],
    }).compile();

    listener = module.get<LeadListener>(LeadListener);
  });

  it('deve estar definido', () => {
    expect(listener).toBeDefined();
  });

  it('deve enviar um e-mail quando o evento lead.created for recebido', async () => {
    const event = new LeadCreatedEvent('teste@email.com', 'Igor Teste');

    mockMailerService.sendMail.mockResolvedValue('Email enviado');

    await listener.handleLeadCreatedEvent(event);

    expect(mockMailerService.sendMail).toHaveBeenCalledTimes(1);
    expect(mockMailerService.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'teste@email.com',
        subject: 'Bem-vindo à Plataforma de Fretes!',
        html: expect.stringContaining('Igor Teste') as string,
      }),
    );
  });

  it('deve logar o erro e NÃO quebrar a aplicação se o envio de e-mail falhar', async () => {
    const event = new LeadCreatedEvent('erro@email.com', 'Usuário Erro');

    mockMailerService.sendMail.mockRejectedValue(new Error('SMTP Error'));

    const loggerSpy = jest
      .spyOn(Logger.prototype, 'error')
      .mockImplementation();

    await listener.handleLeadCreatedEvent(event);

    expect(mockMailerService.sendMail).toHaveBeenCalled();
    expect(loggerSpy).toHaveBeenCalled();
  });
});
