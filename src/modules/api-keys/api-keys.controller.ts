import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiKeysService } from './api-keys.service';
import { CreateApiKeyDto } from './dto/create-api-key.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { RequestWithUser } from '../../utils/types/request-with-user.interface';

@Controller('keys')
@UseGuards(JwtAuthGuard)
export class ApiKeysController {
  constructor(private apiKeysService: ApiKeysService) {}

  @Post('create')
  async create(
    @Request() req: RequestWithUser,
    @Body() createApiKeyDto: CreateApiKeyDto,
  ) {
    const expiresAt = createApiKeyDto.expiresAt
      ? new Date(createApiKeyDto.expiresAt)
      : undefined;

    return this.apiKeysService.create(
      req.user.userId,
      createApiKeyDto.name,
      expiresAt,
    );
  }

  @Get()
  async listKeys(@Request() req: RequestWithUser) {
    return this.apiKeysService.listUserKeys(req.user.userId);
  }

  @Delete(':id')
  async revokeKey(@Request() req: RequestWithUser, @Param('id') keyId: string) {
    return this.apiKeysService.revokeKey(req.user.userId, keyId);
  }
}
