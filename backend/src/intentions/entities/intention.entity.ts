import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Lead } from '../../leads/entities/lead.entity';

@Entity('intentions')
export class Intention {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  zipcode_start: string;

  @Column()
  zipcode_end: string;

  @Column({ nullable: true })
  lead_id: string;

  @ManyToOne(() => Lead, (lead) => lead.intentions, { nullable: true })
  @JoinColumn({ name: 'lead_id' })
  lead: Lead;
}
