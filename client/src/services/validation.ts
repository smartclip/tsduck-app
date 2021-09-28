/**
 * build the params for the tsp request
 * @returns an error if params are missing or the collected params as result
 */

import { InputType, TsAit, OutputType, PluginType } from '../models/models';

type FormParams = {
  input: InputType;
  plugins: {
    type: string;
    zap?: string;
    streamevent_file?: string;
    synchronize: boolean;
  };
  output: OutputType;
};

export const validateTspParams = (
  values: FormParams,
  extraValues: { aitToReplace?: TsAit }
): {
  error?: string;
  result?: { input: InputType; plugins: PluginType[]; output: OutputType };
} => {
  /**
   * check plugin params
   */
  // replace_ait: existing ait to replace
  if (values.plugins.type === 'replace_ait' && !extraValues.aitToReplace)
    return { error: 'Replace AIT Plugin requires an edited AIT' };

  /**
   * build plugin params
   */

  const tspPlugins: PluginType[] = [];

  // synchronize
  if (values.plugins.synchronize) {
    tspPlugins.push({ type: 'synchronize' });
  }

  // zap
  if (values.plugins.zap)
    tspPlugins.push({ type: 'zap', service: values.plugins.zap });

  // type: play, show_streamevent or replace_ait
  switch (values.plugins.type) {
    case 'replace_ait':
      tspPlugins.push({
        type: 'replace_ait',
        ait: extraValues.aitToReplace!,
      });
      break;
    case 'show_streamevent':
      tspPlugins.push({
        type: 'show_streamevent',
        file: values.plugins.streamevent_file!,
      });
      break;
  }

  return {
    result: {
      input: values.input,
      plugins: tspPlugins,
      output: values.output,
    },
  };
};
