import express, { Response, Request } from 'express';
import { authenticate } from '../middleware/authentication';
import {
  sessionLogin,
  sessionLogout,
  getServerSession,
} from '../services/sessionService';
import TSP from '../services/tsp';

const router = express.Router();

router.get('/session/logout', (req: Request, res: Response) => {
  sessionLogout();
  res.sendStatus(200);
});

router.get('/session/login', (req: Request, res: Response) => {
  const sessionkey: string | undefined =
    req.headers.sessionkey === 'null'
      ? undefined
      : (req.headers.sessionkey as string);

  const result = sessionLogin(sessionkey);
  if (!result) res.sendStatus(503);
  else {
    TSP.clearReport();
    res.send(result);
  }
});

router.get('/session/status', authenticate, (req: Request, res: Response) => {
  const sessionKey: string | undefined = getServerSession();
  const loggedIn: boolean =
    !!sessionKey && sessionKey === req.headers.sessionkey;
  const busy: boolean = TSP.isBusy();
  const log: string[] = TSP.getLog();
  const error: string[] = TSP.getErrorLog();
  res.send({ sessionKey, loggedIn, busy, log, error });
});

export { router as sessionRouter };
