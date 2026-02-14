import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { MailerService } from '@nestjs-modules/mailer';
import { LeadCreatedEvent } from '../events/lead-created.event';

@Injectable()
export class LeadListener {
  private readonly logger = new Logger(LeadListener.name);

  constructor(private readonly mailerService: MailerService) {}

  @OnEvent('lead.created')
  async handleLeadCreatedEvent(event: LeadCreatedEvent) {
    try {
      await this.mailerService.sendMail({
        to: event.email,
        subject: 'Bem-vindo à Plataforma de Fretes!',
        html: `
          <div style="font-family: Arial, sans-serif; color: #333;">
            <h2 style="color: #2c3e50;">Olá, ${event.name}!</h2>
            <p>Obrigado por se cadastrar em nossa plataforma.</p>
            <p>Recebemos seus dados e em breve nossa equipe entrará em contato.</p>
            <br>
            <p>Atenciosamente,<br><strong>Equipe Projeto Leads</strong></p>
          </div>
        `,
      });
      this.logger.log(`E-mail de boas-vindas enviado para: ${event.email}`);
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Falha ao enviar e-mail para ${event.email}: ${err.message}`,
      );
    }
  }
}
