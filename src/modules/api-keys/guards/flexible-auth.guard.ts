import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class FlexibleAuthGuard extends AuthGuard(['jwt', 'api-key']) {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    // Try JWT first
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const authHeader = request.headers['authorization'];
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
    if (request.headers['x-api-key']) {
      try {
        return (await super.canActivate(context)) as boolean;
      } catch {
        throw new UnauthorizedException('Invalid authentication');
      }
    }

    throw new UnauthorizedException('No authentication provided');
  }
}
