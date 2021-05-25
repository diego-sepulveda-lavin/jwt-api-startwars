import {
    Entity, Column, PrimaryGeneratedColumn, ManyToMany,
    BaseEntity, JoinTable
} from 'typeorm';
import { User } from './User';

@Entity()
export class Planet extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @ManyToMany(() => User, user => user.planets)
    @JoinTable()
    users: User[];

}