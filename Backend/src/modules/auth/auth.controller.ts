import type { Request, Response } from 'express';
import { loginSchema, signupSchema } from './auth.schema.js';
import * as authService from './auth.service.js';

export async function signupHandler(req: Request, res: Response) {
  const input = signupSchema.parse(req.body);
  const result = await authService.signup(input);
  res.status(201).json(result);
}

export async function loginHandler(req: Request, res: Response) {
  const input = loginSchema.parse(req.body);
  const result = await authService.login(input);
  res.status(200).json(result);
}

export async function meHandler(req: Request, res: Response) {
  const user = await authService.getMe(req.userId!);
  res.status(200).json(user);
}
