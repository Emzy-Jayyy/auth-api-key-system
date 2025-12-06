import {
  Injectable,
  NotFoundException,
  //   UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiKey } from '../../entities/api-key.entity';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ApiKeysService {
  constructor(
    @InjectRepository(ApiKey)
    private apiKeysRepository: Repository<ApiKey>,
  ) {}

  async create(userId: string, name: string, expiresAt?: Date) {
    // Generate secure random key
    const rawKey = `sk_live_${crypto.randomBytes(32).toString('hex')}`;
    const keyHash = await bcrypt.hash(rawKey, 10);
    const prefix = rawKey.substring(0, 15);

    const apiKey = this.apiKeysRepository.create({
      keyHash,
      name,
      prefix,
      userId,
      expiresAt,
    });

    await this.apiKeysRepository.save(apiKey);

    // Return plain key only once
    return {
      id: apiKey.id,
      name: apiKey.name,
      key: rawKey, // ONLY returned here
      prefix: apiKey.prefix,
      expiresAt: apiKey.expiresAt,
      createdAt: apiKey.createdAt,
    };
  }

  async validateApiKey(
    rawKey: string,
  ): Promise<{ userId: string; keyId: string } | null> {
    // Get all non-revoked, non-expired keys
    const apiKeys = await this.apiKeysRepository.find({
      where: { isRevoked: false },
      relations: ['user'],
    });

    for (const apiKey of apiKeys) {
      // Check expiration
      if (apiKey.expiresAt && new Date() > apiKey.expiresAt) {
        continue;
      }

      // Compare hashes
      const isValid = await bcrypt.compare(rawKey, apiKey.keyHash);

      if (isValid) {
        // Update last used timestamp
        await this.apiKeysRepository.update(apiKey.id, {
          lastUsedAt: new Date(),
        });

        return {
          userId: apiKey.userId,
          keyId: apiKey.id,
        };
      }
    }

    return null;
  }

  async listUserKeys(userId: string) {
    const keys = await this.apiKeysRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });

    return keys.map((key) => ({
      id: key.id,
      name: key.name,
      prefix: key.prefix,
      isRevoked: key.isRevoked,
      expiresAt: key.expiresAt,
      lastUsedAt: key.lastUsedAt,
      createdAt: key.createdAt,
    }));
  }

  async revokeKey(userId: string, keyId: string) {
    const key = await this.apiKeysRepository.findOne({
      where: { id: keyId, userId },
    });

    if (!key) {
      throw new NotFoundException('API key not found');
    }

    key.isRevoked = true;
    await this.apiKeysRepository.save(key);

    return { message: 'API key revoked successfully' };
  }
}
