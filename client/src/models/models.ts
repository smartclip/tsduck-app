export type TsService = {
  name: string;
  id: number;
  pids: number[];
};

export type Response = {
  error?: string;
  result?: any;
};

export type TsAit = {
  pid: number;
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
  type: 'file';
  file: string;
  infinite?: boolean;
};

export type PluginType =
  | {
      type: 'replace_ait';
      ait: TsAit;
    }
  | {
      type: 'synchronize';
    }
  | {
      type: 'zap';
      service: string;
    }
  | {
      type: 'show_streamevent';
      file: string;
    };

export type OutputType =
  | {
      type: 'file';
      file: string;
    }
  | { type: 'drop' };

export type ServerStatus = {
  sessionKey: string;
  loggedIn: boolean;
  busy: boolean;
  log: string[];
  error: string[];
};
