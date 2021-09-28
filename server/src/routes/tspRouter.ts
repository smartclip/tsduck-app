import express, { Request, Response } from 'express';
import { authenticate } from '../middleware/authentication';
import {
  runTsp,
  analyze,
  getTuningChannels,
  stopTsp,
} from '../services/tspService';

/**
 * create router
 */
const router = express.Router();

/**
 * run tsp with defined plugins
 * passes a callback to notice when process is done
 * if an error occurs while the process, the error message get sent to client
 */
router.post('/api/tsp/run', async (req: Request, res: Response) => {
  try {
    const result = await runTsp(req.body);
    if (result.error) res.status(500).send(result);
    else res.status(200).send(result);
  } catch (e: any) {
    console.error(e);
    res.status(500).send(e);
  }
});

/**
 * stops the tsp
 */
router.get('/api/tsp/stop', (req: Request, res: Response) => {
  stopTsp();
  res.sendStatus(200);
});

/**
 * get all the infos of a tsp analyze
 * @param file file name of the ts file (without .ts)
 * @return an object with infos about tables, services and pids
 */
router.post('/api/tsp/analyze', async (req: Request, res: Response) => {
  const result = await analyze(req.body);
  if (result.error) res.status(500).send(result);
  else res.send(result);
});

/**
 * get channels from tuning file
 */
router.get('/api/tsp/tuning-channels', (req: Request, res: Response) => {
  const result = getTuningChannels();
  res.send(result);
});

export { router as tspRouter };
