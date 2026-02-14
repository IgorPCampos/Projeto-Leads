import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IntentionsService } from './intentions.service';
import { IntentionsController } from './intentions.controller';
import { Intention } from './entities/intention.entity';
import { LeadsModule } from '../leads/leads.module';

@Module({
  imports: [TypeOrmModule.forFeature([Intention]), LeadsModule],
  controllers: [IntentionsController],
  providers: [IntentionsService],
})
export class IntentionsModule {}
