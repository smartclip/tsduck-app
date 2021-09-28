import express, { Request, Response } from 'express';
import fs from 'fs';
import Busboy from 'busboy';
import { fileConfig as config } from '../../config';

/**
 * directories of input and output ts files
 */
const DATA_INPUT_DIR: string = config.dataInputDir;
const DATA_OUTPUT_DIR: string = config.dataOutputDir;

/**
 * create router
 */
const router = express.Router();

/**
 * return the file names (without .ts) of all files in DATA_INPUT_DIR
 */
router.get('/api/tsfiles/input', (req: Request, res: Response) => {
  const inputFiles: string[] = fs
    .readdirSync(DATA_INPUT_DIR)
    .map((file: string) => {
      // remove the .ts at the end
      return file.substring(0, file.length - 3);
    });
  res.send(inputFiles);
});

/**
 *  file upload
 * @param file name to store the file in DATA_INPUT_DIR and represent it in the app
 */
router.post('/api/tsfiles/input/:file', (req: Request, res: Response) => {
  const fileAddress = `${DATA_INPUT_DIR}${req.params.file}.ts`;
  const busboy = new Busboy({ headers: req.headers });
  busboy.on(
    'file',
    (
      fieldname: string,
      file: any,
      filename: string,
      encoding: string,
      mimetype: string
    ) => {
      const fileWriteStream = fs.createWriteStream(fileAddress);
      file.pipe(fileWriteStream);
    }
  );
  busboy.on('finish', function () {
    res.sendStatus(201);
  });
  req.pipe(busboy);
});

/**
 * file download
 * @param file the name of the file (without .ts) in DATA_OUTPUT_DIR
 */
router.get('/api/tsfiles/output/:type/:file', (req: Request, res: Response) => {
  const fileAddress = `${DATA_OUTPUT_DIR}${req.params.file}.${req.params.type}`;
  res.download(fileAddress);
});

/**
 *  get the result files
 * @return a list of file names (with .ts) which are stored in DATA_OUTPUT_DIR
 */
router.get('/api/tsfiles/output/', (req: Request, res: Response) => {
  const outputFiles: string[] = fs.readdirSync(DATA_OUTPUT_DIR);
  const xml: string[] = [];
  const ts: string[] = [];
  outputFiles.forEach((f: string) => {
    const end: string = f.split('.')[1];
    if (end === 'xml') xml.push(f);
    else ts.push(f);
  });
  res.send({ xml, ts });
});

router.get('/api/tsfiles/output/xml/:file', (req: Request, res: Response) => {
  const fileAddress = `${DATA_OUTPUT_DIR}${req.params.file}.xml`;
  const xml: string = fs.readFileSync(fileAddress).toString();
  res.send(xml);
});

export { router as tsFileRouter };
