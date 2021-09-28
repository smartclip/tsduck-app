export type TsTable = {
  pid: number;
  tid: number;
};

export type TsService = {
  name: string;
  id: number;
  pids: number[];
};

export type TsAit = {
  pid?: number;
  tables: TsAitTable[];
};

export type TsAitTable = {
  controlCode: number;
  appName: string;
  version: string;
  url?: string;
  appId: number;
};

export type InputType = {
  type: 'live' | 'file';
  file?: string;
  infinite?: boolean;
};

export type PluginType = {
  type: 'replace_ait' | 'synchronize' | 'zap' | 'show_streamevent';
  ait?: TsAit;
  service?: string;
  file?: string;
};

export type OutputType = {
  type: 'file' | 'drop' | 'live';
  file: string;
};
