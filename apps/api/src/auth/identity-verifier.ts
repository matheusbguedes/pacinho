import { Injectable, UnauthorizedException } from "@nestjs/common";
import type { AuthProvider } from "@pacinho/shared";
import { createRemoteJWKSet, jwtVerify, type JWTPayload } from "jose";

export type VerifiedIdentity = {
  provider: AuthProvider;
  subject: string;
  email: string | null;
  emailVerified: boolean;
  name: string | null;
};

const APPLE_ISSUER = "https://appleid.apple.com";
const GOOGLE_ISSUERS = ["https://accounts.google.com", "accounts.google.com"];

@Injectable()
export class IdentityVerifier {
  private readonly keys = new Map<
    string,
    ReturnType<typeof createRemoteJWKSet>
  >();

  async verify(provider: AuthProvider, token: string): Promise<VerifiedIdentity> {
    const audience =
      provider === "APPLE"
        ? readEnv("APPLE_CLIENT_ID")
        : readEnv("GOOGLE_CLIENT_ID");
    if (!audience) {
      throw new UnauthorizedException({
        message: "Entrada com esse provedor não está configurada",
      });
    }

    const jwksUrl =
      provider === "APPLE"
        ? readEnv("APPLE_JWKS_URL") ?? "https://appleid.apple.com/auth/keys"
        : readEnv("GOOGLE_JWKS_URL") ??
          "https://www.googleapis.com/oauth2/v3/certs";

    try {
      const { payload } = await jwtVerify(token, this.jwks(jwksUrl), {
        issuer: provider === "APPLE" ? APPLE_ISSUER : GOOGLE_ISSUERS,
        audience,
      });
      const subject = payload.sub;
      if (!subject) {
        throw new Error("missing sub");
      }

      return {
        provider,
        subject,
        email: readEmail(payload),
        emailVerified: readEmailVerified(payload),
        name: readName(payload),
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException({ message: "Identidade inválida" });
    }
  }

  private jwks(url: string) {
    const cached = this.keys.get(url);
    if (cached) {
      return cached;
    }
    const created = createRemoteJWKSet(new URL(url));
    this.keys.set(url, created);
    return created;
  }
}

function readEnv(name: string) {
  const value = process.env[name]?.trim();
  return value ? value : null;
}

function readEmail(payload: JWTPayload) {
  const email = payload.email;
  if (typeof email !== "string") {
    return null;
  }
  const trimmed = email.trim().toLowerCase();
  return trimmed.length > 0 ? trimmed : null;
}

function readEmailVerified(payload: JWTPayload) {
  const value = payload.email_verified;
  return value === true || value === "true";
}

function readName(payload: JWTPayload) {
  const name = payload.name;
  if (typeof name !== "string") {
    return null;
  }
  const trimmed = name.trim();
  return trimmed.length >= 2 ? trimmed : null;
}
