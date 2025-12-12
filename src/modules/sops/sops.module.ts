// src/modules/sops/sops.module.ts
import { Module } from '@nestjs/common';
import { SopsController } from './sops.controller';
import { SopsService } from './sops.service';

@Module({ controllers: [SopsController], providers: [SopsService], exports: [SopsService] })
export class SopsModule { }