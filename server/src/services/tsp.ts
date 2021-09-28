import tsduck from 'tsduck';

/**
 * constants necessary for tsduck inline json or xml
 */
const JSON_MARKER = '[_TS_JSON_]';
const XML_MARKER = '[_TS_XML_]';

/**
 * napi TSP and napi report singleton
 */
const rep = new tsduck.CustomReport(JSON_MARKER, XML_MARKER);
const tsp = new tsduck.TSProcessor(rep);

export type TypeTspResult = {
  error?: string;
  log?: string;
  json?: any;
  xml?: string;
};

/**
 * run function to fill tsp with plugins, run it and wait until the process is done
 */
const run = async (
  input: string[],
  plugins: string[][],
  output: string[]
): Promise<TypeTspResult> => {
  console.log(
    `run tsp with \n input: ${input},\n plugins: ${plugins},\n output: ${output}.`
  );
  rep.clearLog(); // to be safe, no older report messages get red and contaminate the results

  tsp.setInput(input);
  tsp.setPlugins(plugins);
  tsp.setOutput(output);

  await tsp.start();

  const error: string | undefined =
    rep.getLog('error').length > 0
      ? rep.getLog('error').slice(-1)[0]
      : undefined;
  const log: string | undefined =
    rep.getLog().length > 0 ? rep.getLog().slice(-1)[0] : undefined;
  const json: any | undefined =
    rep.getLog('json').length > 0
      ? JSON.parse(rep.getLog('json').slice(-1)[0])
      : undefined;
  const xml: string | undefined =
    rep.getLog('xml').length > 0 ? rep.getLog('xml').slice(-1)[0] : undefined;

  return { error, log, json, xml };
};

const stop = () => {
  tsp.abort();
  tsp.clearFields();
};

const isBusy = (): boolean => tsp.isStarted();
const clearReport = (): void => rep.clearLog();
const getLog = (): string[] => rep.getLog();
const getErrorLog = (): string[] => rep.getLog('error');

const TSP = {
  run,
  isBusy,
  clearReport,
  getLog,
  getErrorLog,
  stop,
  JSON_MARKER,
  XML_MARKER,
};

export default TSP;
