import { JwtService } from '@nestjs/jwt';
import { ResolvedJwtSecrets } from '../config/jwt-secret';
import { JwtPayload } from '../guards/jwt-auth.guard';

/**
 * Verify an access JWT with the primary secret, falling back to
 * JWT_SECRET_PREVIOUS during a rotation window.
 */
export function verifyAccessToken(
  jwtService: JwtService,
  token: string,
  secrets: ResolvedJwtSecrets,
): JwtPayload {
  try {
    return jwtService.verify<JwtPayload>(token, { secret: secrets.primary });
  } catch (primaryErr) {
    if (!secrets.previous) throw primaryErr;
    return jwtService.verify<JwtPayload>(token, { secret: secrets.previous });
  }
}
