import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class SuperadminJwtGuard extends AuthGuard('superadmin-jwt') {}
