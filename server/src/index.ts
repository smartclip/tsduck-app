import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { tspRouter } from './routes/tspRouter';
import { sessionRouter } from './routes/sessionRouter';
import { tsFileRouter } from './routes/tsFileRouter';
import { generalConfig as config } from '../config';
import tsduck from 'tsduck';

/**
 * set up db with the start of the app
 */
class App {
  public express: express.Application;

  constructor() {
    this.express = express();
    // this.setupDb();
  }

  // Warning: Accessing non-existent property 'MongoError' of module exports inside circular dependency
  // https://developer.mongodb.com/community/forums/t/warning-accessing-non-existent-property-mongoerror-of-module-exports-inside-circular-dependency/15411/6
  private setupDb(): void {
    const mongoDb: string = config.dbAddress;
    mongoose.connect(mongoDb, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    const db = mongoose.connection;
    db.on('error', console.error.bind(console, 'MongoDB Connection error'));
  }
}

/**
 * create the server with or without db
 */
//const app = new App().express; // version with db
const app = express(); // version without db

/**
 * general stuff
 */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

/**
 * router
 */
app.use(sessionRouter);
app.use(tspRouter);
app.use(tsFileRouter);

/**
 * start server
 */
app.listen(config.port, () => {
  console.log('server is listening on port ' + config.port);
  console.log('using tsduck version ' + tsduck.getVersion());
});
