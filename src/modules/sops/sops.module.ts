// src/modules/sops/sops.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SopsController } from './sops.controller';
import { SopsService } from './sops.service';
import { Sop } from '../../entities/sop.entity';
import { User } from '../../entities/user.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Sop, User])],
    controllers: [SopsController],
    providers: [SopsService],
    exports: [SopsService],
})
export class SopsModule { }