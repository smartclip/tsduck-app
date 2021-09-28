import { NextFunction, Request, Response } from 'express';
import {
  getCurrentSessionId,
  resetCurrentSessionId,
} from './../services/sessionService';

import { generalConfig } from '../../config';
const config = generalConfig;

export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void | Response> {
  const localKey: string | undefined = req.header('SessionKey');

  const sessionId: string | undefined = getCurrentSessionId();

  if (!localKey || localKey !== sessionId) {
    res.sendStatus(401);
  } else if (
    sessionId &&
    parseInt(sessionId) <
      Date.now() - parseInt(config.sessionLengthMin) * 60 * 1000
  ) {
    resetCurrentSessionId();
    res.sendStatus(403);
  } else next();
}
