import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Intention } from '../../intentions/entities/intention.entity';

@Entity('leads')
export class Lead {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @OneToMany(() => Intention, (intention) => intention.lead)
  intentions: Intention[];
}
