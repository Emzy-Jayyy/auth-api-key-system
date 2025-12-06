import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class FlexibleAuthGuard extends AuthGuard(['jwt', 'api-key']) {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // Try JWT first
    if (request.headers.authorization?.startsWith('Bearer ')) {
      try {
        return (await super.canActivate(context)) as boolean;
      } catch (error) {
        // JWT failed, try API key
      }
    }

    // Try API key
    if (request.headers['x-api-key']) {
      try {
        return (await super.canActivate(context)) as boolean;
      } catch (error) {
        throw new UnauthorizedException('Invalid authentication');
      }
    }

    throw new UnauthorizedException('No authentication provided');
  }
}

