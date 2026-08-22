import bcrypt from 'bcryptjs';
import { prisma } from '../../lib/prisma.js';
import { ApiError } from '../../lib/ApiError.js';
import { signAccessToken, signRefreshToken } from '../../lib/jwt.js';
import type { LoginInput, SignupInput } from './auth.schema.js';

const SALT_ROUNDS = 10;

function toPublicUser(user: { id: string; name: string; email: string; role: 'user' | 'admin'; avatarUrl: string | null; languagePref: string }) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatarUrl: user.avatarUrl,
    languagePref: user.languagePref,
  };
}

function issueTokens(user: { id: string; role: 'user' | 'admin' }) {
  const payload = { sub: user.id, role: user.role };
  return {
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken(payload),
  };
}

export async function signup(input: SignupInput) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw ApiError.conflict('An account with this email already exists');
  }

  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
  const user = await prisma.user.create({
    data: { name: input.name, email: input.email, passwordHash },
  });

  return { user: toPublicUser(user), ...issueTokens(user) };
}

export async function login(input: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const passwordMatches = await bcrypt.compare(input.password, user.passwordHash);
  if (!passwordMatches) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  return { user: toPublicUser(user), ...issueTokens(user) };
}

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw ApiError.notFound('User not found');
  }
  return toPublicUser(user);
}
