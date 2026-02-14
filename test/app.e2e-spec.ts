import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { Server } from 'http';
import { LeadsModule } from '../src/leads/leads.module';
import { IntentionsModule } from '../src/intentions/intentions.module';
import { Lead } from '../src/leads/entities/lead.entity';
import { Intention } from '../src/intentions/entities/intention.entity';

interface ResponseBody {
  message: string | string[];
  error: string;
  statusCode: number;
}

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),

        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [Lead, Intention],
          synchronize: true,
        }),

        MailerModule.forRoot({
          transport: {
            jsonTransport: true,
          },
        }),

        EventEmitterModule.forRoot(),

        LeadsModule,
        IntentionsModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();
  });

  it('/lead (POST) - Deve verificar os dados ', async () => {
    return request(app.getHttpServer() as Server)
      .post('/lead')
      .send({
        name: 'Teste',
        email: 'emailInvalido',
      })
      .expect(400)
      .expect((res) => {
        const body = res.body as ResponseBody;
        expect(body.message).toContain('O e-mail informado é inválido.');
      });
  });

  it('/intention (POST) - Deve verificar CEP', async () => {
    return request(app.getHttpServer() as Server)
      .post('/intention')
      .send({
        zipcode_start: '123',
        zipcode_end: '12345678',
      })
      .expect(400)
      .expect((res) => {
        const body = res.body as ResponseBody;
        expect(body.message).toContain('CEP deve conter 8 dígitos.');
      });
  });

  it('/lead (POST) - Deve criar lead com sucesso', async () => {
    return request(app.getHttpServer() as Server)
      .post('/lead')
      .send({
        name: 'Usuario E2E',
        email: 'testeE2E@exemplo.com',
      })
      .expect(201);
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });
});
