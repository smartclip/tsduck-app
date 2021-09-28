import { tsduck } from 'napi-tsduck';
import fs from 'fs';
import {
  TsTable,
  TsService,
  TsAit,
  TsAitTable,
  InputType,
  PluginType,
  OutputType,
} from '../models/models';
import * as xml2js from 'xml2js';
import { fileConfig, liveConfig } from '../../config';
import { buildAit, getAitInfos } from './aitParserService';
const config = { ...fileConfig, ...liveConfig };

/**
 * environment stuff
 */
const TUNING_FILE_PATH: string = config.tuningFilePath;
const DELIVERY_SYSTEM: string = config.deliverySystem;

/**
 * directories
 */
const DATA_INPUT_DIR: string = config.dataInputDir;
const DATA_OUTPUT_DIR: string = config.dataOutputDir;

/**
 * for live input
 */
const liveInput: string[] = [
  'dvb',
  '--delivery-system',
  DELIVERY_SYSTEM,
  '--tuning-file',
  TUNING_FILE_PATH,
];

/**
 * napi TSP and napi report singleton
 */
const rep = new tsduck.NapiTsReport();
const tsp = new tsduck.NapiTsProcessor(rep);

/**
 * constants necessary for tsduck inline json or xml
 */
const JSON_MARKER = '[_TS_JSON_]';
const XML_MARKER = '[_TS_XML_]';

/**
 * get the json log of the report
 * @returns the json log as json object array
 */
// just use with ANALYZE plugin not with TABLES
const getJsonLog = () => {
  return rep.getLog().reduce((result: string[], entry: string) => {
    entry.split(JSON_MARKER).forEach((el: string, i: number) => {
      if (i % 2 !== 0) result.push(JSON.parse(el));
    });
    return result;
  }, []);
};

/**
 * get the xml log of the report
 * @returns the xml log as string array
 */
const getXmlLog = () => {
  return rep.getLog().reduce((result: string[], entry: string) => {
    entry.split(XML_MARKER).forEach((el: string, i: number) => {
      if (i % 2 !== 0) result.push(el);
    });
    return result;
  }, []);
};

/**
 * get the log of the report except of messages in json or xml form
 * @returns the xml log as string array
 */
export const getNormalLog = () => {
  return rep.getLog().reduce((result: string[], entry: string) => {
    if (!entry.includes(XML_MARKER) && !entry.includes(JSON_MARKER))
      result.push(entry);
    return result;
  }, []);
};

/**
 * parse the given tuning file and extract the channel names
 */
export const getTuningChannels = () => {
  let finalResult: unknown;
  const tuningFile: string = fs.readFileSync(TUNING_FILE_PATH, 'utf8');
  xml2js.parseString(tuningFile, (error: any, result: any) => {
    finalResult = result.tsduck.network
      .map((x: any) =>
        x.ts.map((x: any) => x.service.map((x: any) => x['$'].name)).flat()
      )
      .flat();
  });

  return {
    channels: finalResult,
    file: TUNING_FILE_PATH,
    system: DELIVERY_SYSTEM,
  };
};

/**
 * get the status of the tsp
 * @returns a boolean whether the tsp is currently running
 */
export const isBusy = (): boolean => {
  return tsp.isStarted();
};

/**
 * stops the tsp
 */
export const stopTsp = (): void => {
  tsp.abort();
  resetTsp();
};

/**
 * clear array fields of tsp (no 100% safety but better than nothing)
 */
const resetTsp = () => {
  tsp.setInput([]);
  tsp.setPlugins([]);
  tsp.setOutput([]);
};

let busy: boolean = false;

/**
 * clear report of tsp
 */
export const clearReport = () => {
  rep.clearLog();
};

/**
 * private run function to fill tsp with plugins, run it and wait until the process is done
 * if an error occurs, the given callback function get called with an error message
 * if no error occurs, the given callback function get called without parameters
 * @param callback function to be called when the tsp is done or an error occurs
 */
const run = async (
  input: string[],
  plugins: string[][],
  output: string[]
): Promise<{ error?: string }> => {
  //rep.clearLog(); // to be safe, no older report messages get red and contaminate the results
  tsp.setInput(input);
  tsp.setPlugins(plugins);
  tsp.setOutput(output);
  console.log(
    `run tsp with \n input: ${input},\n plugins: ${plugins},\n output: ${output}.`
  );
  while (tsp.isStarted()) {}
  try {
    busy = true;
    await tsp.start();
  } catch (error: any) {
    console.error(error);
    return { error };
  }

  tsp.waitForTermination();
  tsp.abort();
  while (tsp.isStarted()) {}
  busy = false;
  resetTsp();
  return {};
};
/**
 * public run function to call the private run function with prepared plugin arrays
 */
export const runTsp = async ({
  input,
  plugins,
  output,
}: {
  input: InputType;
  plugins: PluginType[];
  output: OutputType;
}): Promise<{ error?: string; log: string[] }> => {
  // for every plugin an array is built and filled depending on the plugin type and options

  // input array gets filled with strings
  const tsInput: string[] = [];
  if (input.type === 'file') {
    tsInput.push('file', `${DATA_INPUT_DIR}${input.file!}.ts`);
  } else if (input.type === 'live') {
    tsInput.push(...liveInput, '-c', plugins[0].service!);
  }
  if (input.infinite) tsInput.push('-i');

  // plugin array gets filled with a string array for each plugin
  const tsPlugins: string[][] = [];
  for (const plugin of plugins) {
    // zap plugin
    if (plugin.type === 'zap') {
      tsPlugins.push(['zap', plugin.service!]);

      // replace ait plugin
    } else if (plugin.type === 'replace_ait') {
      // the new ait gets written into a temporary xml file because the tsp needs a file path to retrieve it
      const newAit = 'data/tmp/' + Date.now() + '.xml';
      // get the old ait by tsp request (xml form and then transform to json by xml2js)
      const oldAit: any = await getAit(input.file!, plugin.ait!.pid!);
      if (oldAit.error) return { error: oldAit.error, log: getNormalLog() };

      const oldAitXml: string = oldAit.result.xml;
      let oldAitJson: unknown;
      xml2js.parseString(
        oldAitXml.replace('\ufeff', ''),
        (error: any, result: string) => {
          if (error) oldAitJson = { error: error.message } as { error: string };
          else oldAitJson = { result: result || '' };
        }
      );
      // build the new ait with old ait as template and filled with the infos from client
      const { id, ...newAitJson } = buildAit(
        (oldAitJson as { result: string }).result,
        plugin.ait!
      );
      const builder = new xml2js.Builder();
      const aitToReplace: string = builder.buildObject(newAitJson);
      // save the new ait in xml form as file, the path to the new ait.xml gets passed to the tsp
      fs.writeFileSync(newAit, aitToReplace, 'utf-8');
      tsPlugins.push([
        'inject',
        '--replace',
        `--pid=${plugin.ait!.pid}`,
        newAit,
      ]);

      // synchronize plugin
    } else if (plugin.type === 'synchronize') {
      tsPlugins.push(['regulate', '--pcr-synchronous']);
    }
  }

  // output array gets filled with strings
  const tsOutput: string[] = [];
  if (output.type === 'drop') {
    tsOutput.push('drop');
  } else if (output.type === 'file') {
    tsOutput.push(...['file', `${DATA_OUTPUT_DIR}${output.file}.ts`]);
  } else if (output.type === 'live') {
    tsOutput.push(...['hides', '-h', '3/4', '-f', '482000000']);
  }

  clearReport();

  // private run function gets called with the prepared plugin arrays and the callback to send error messages or the confirmation that the process is finished
  const result = await run(tsInput, tsPlugins, tsOutput);
  // clear tmp dir
  fs.readdirSync('data/tmp').forEach((file: string) =>
    fs.unlinkSync(`data/tmp/${file}`)
  );
  return { error: result.error, log: getNormalLog() };
};

/**
 * get all the infos of a tsp analyze
 * @param file file address of the ts file
 * @return an object with infos about tables, services and pids
 */
export const analyze = async (params: {
  type: 'live' | 'file';
  file?: string;
  service?: string;
}): Promise<{
  error?: string;
  result?: { tables: TsTable[]; services: TsService[]; aits: TsAit[] };
}> => {
  const tsInput: string[] = [];
  if (params.type === 'file')
    tsInput.push('file', `${DATA_INPUT_DIR}${params.file}.ts`);
  else if (params.type === 'live')
    tsInput.push(...liveInput, '-c', params.service!);
  const tsPlugins: string[][] = [];
  if (params.service) tsPlugins.push(['zap', params.service]);
  tsPlugins.push(['analyze', '--json-line=' + JSON_MARKER]);
  if (params.type === 'live') tsPlugins.push(['until', '--seconds', '10']);
  const tsOutput = ['drop'];

  // call private run function with prepared plugin arrays
  const result = await run(tsInput, tsPlugins, tsOutput);

  if (result.error) return result;

  // get the json result from the report
  const jsonLog: any[] = getJsonLog();
  const json: Record<string, any> = jsonLog[jsonLog.length - 1];
  if (!json || !json.tables || !json.services) {
    const log: string[] = getNormalLog();
    const msg: string = log[log.length - 1];
    if (msg.startsWith('dvb: error reading file'))
      return { error: `TSP analyze error: Could not find tuning file.` };
    else if (msg.startsWith('dvb: error opening /dev/dvb0.frontend0:'))
      return { error: `TSP analyze error: Could not find DVB adapter.` };
    else return { error: `TSP analyze error: ${msg}` };
  }
  const tables: TsTable[] = json.tables.map((table: Record<string, any>) => ({
    tid: table.tid,
    pid: table.pid,
  }));
  const services: TsService[] = json.services.map(
    (service: Record<string, any>) => ({
      id: service.id,
      name: service.name,
      pids: service.pids,
    })
  );
  const aitTables: TsTable[] = tables.filter((t: TsTable) => t.tid === 116);

  const aits: TsAit[] = [];

  // in sequence, otherwise tsp explodes :)
  for (const t of aitTables) {
    const resultXml = await getAitXml(params, t.pid);
    const aitInfos: { error?: string; result?: TsAit } = getAitInfos(
      resultXml.result || ''
    );
    if (aitInfos.error) return aitInfos as { error: string };
    else aits.push({ ...aitInfos.result, pid: t.pid } as TsAit);
  }

  resetTsp();
  return { result: { tables, services, aits } };
};

/**
 * get the xml form of an ait from a ts file
 * @param file file address of the ts file
 * @param pid the pid of the ait
 * @return the ait in xml form as string
 */
const getAitXml = async (
  params: { type: 'live' | 'file'; file?: string; service?: string },
  pid?: number
): Promise<{ error?: string; result?: string }> => {
  const tsInput: string[] = [];
  if (params.type === 'file')
    tsInput.push('file', `${DATA_INPUT_DIR}${params.file!}.ts`);
  else if (params.type === 'live')
    tsInput.push(...liveInput, '-c', params.service!);
  const tsPlugins: string[][] = [];
  if (params.service) tsPlugins.push(['zap', params.service]);
  if (params.type === 'live') tsPlugins.push(['until', '--seconds', '10']);
  tsPlugins.push([
    'tables',
    '--pid=' + pid!.toString(),
    '--max=1',
    '--log-xml-line=' + XML_MARKER,
  ]);
  const tsOutput = ['drop'];

  // call private run function with prepared plugin arrays
  const result = await run(tsInput, tsPlugins, tsOutput);
  if (result.error) return result;

  // get the xml result from the report as string
  const xmlLog: string[] = getXmlLog();
  if (!xmlLog) return { error: 'TSP table error' };
  const table: string = xmlLog[xmlLog.length - 1];

  resetTsp();

  return { result: table };
};

/**
 * get the ait from a ts file in xml form and json form
 * @param file file address of the ts file
 * @param pid the pid of the ait
 * @return the ait in xml form as string and the json form as object
 */
const getAit = async (
  file: string,
  pid: number
): Promise<{ error?: string; result?: { xml: string; json: TsAit } }> => {
  const xml: { error?: string; result?: string } = await getAitXml(
    { type: 'file', file },
    pid
  );
  if (xml.error) return { error: xml.error };
  const json: { error?: string; result?: TsAit } = getAitInfos(
    xml?.result || ''
  );
  if (json.error) return json as { error: string };
  else return { result: { xml: xml.result || '', json: json.result as TsAit } };
};
