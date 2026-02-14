import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailerModule } from '@nestjs-modules/mailer';
import { LeadsModule } from './leads/leads.module';
import { Lead } from './leads/entities/lead.entity';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { Intention } from './intentions/entities/intention.entity';
import { IntentionsModule } from './intentions/intentions.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    EventEmitterModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [Lead, Intention],
      synchronize: true,
      ssl: true,
    }),

    MailerModule.forRoot({
      transport: {
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      },
      defaults: {
        from: 'Frete Leads <noreply@gmail.com>',
      },
    }),

    LeadsModule,
    IntentionsModule,
  ],
})
export class AppModule {}
