import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

@Injectable()
export class FlexibleAuthGuard extends AuthGuard(['jwt', 'api-key']) {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    // Extract and type-check headers properly
    const authHeader = request.headers['authorization'];
    const apiKeyHeader = request.headers['x-api-key'];

    // Try JWT first
    if (
      authHeader &&
      typeof authHeader === 'string' &&
      authHeader.startsWith('Bearer ')
    ) {
      try {
        return (await super.canActivate(context)) as boolean;
      } catch {
        // JWT failed, try API key
      }
    }

    // Try API key
    if (apiKeyHeader && typeof apiKeyHeader === 'string') {
      try {
        return (await super.canActivate(context)) as boolean;
      } catch {
        throw new UnauthorizedException('Invalid authentication');
      }
    }

    throw new UnauthorizedException('No authentication provided');
  }
}
