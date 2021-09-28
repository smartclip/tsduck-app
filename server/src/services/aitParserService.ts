import * as xml2js from 'xml2js';
import { TsAit, TsAitTable } from '../models/models';

/**
 * retrieve all relevant data from the ait
 * uses xml2js to parse the xml into a first json and get the relevant keys
 * @param xml the ait in xml form
 * @returns a json containing the relevant ait keys or an error message
 */
export const getAitInfos = (
  xml: string
): { error?: string; result?: TsAit } => {
  let finalResult: unknown;
  xml2js.parseString(xml, (error: any, result: any) => {
    if (error) finalResult = { error: error.message };
    const aitInfos = {
      tables: result.tsduck.AIT[0].application.map((x: any) => ({
        controlCode: parseInt(x['$']?.control_code, 16),
        appId: parseInt(
          x.application_identifier?.find(Boolean)['$']?.application_id,
          16
        ),
        appName: x.application_name_descriptor
          ?.find(Boolean)
          .language?.find(Boolean)['$']?.application_name,
        version: x.application_descriptor?.find(Boolean).profile?.find(Boolean)[
          '$'
        ]?.version,
        url:
          (x.transport_protocol_descriptor
            ?.find(Boolean)
            .http?.find(Boolean)
            .url?.find(Boolean)['$']?.base || '') +
          (x.simple_application_location_descriptor?.find(Boolean)['$']
            ?.initial_path || ''),
      })),
    };
    finalResult = { result: aitInfos };
  });
  return finalResult as { error?: string; result?: TsAit };
};

/**
 * creates an AIT in the structure of the old AIT with infos from the new AIT
 * @param oldAitJson old AIT in json form before the infos get retrieved by getAitInfos
 * @param newAit infos of the updated AIT in form of the infos gotten by getAitInfos
 * @returns an AIT in the structure of the old AIT with infos from the new AIT
 */
export const buildAit = (oldAitJson: any, newAit: TsAit) => {
  const root = oldAitJson.tsduck.AIT[0];
  if (root.metadata) delete root.metadata;
  root.application = newAit.tables.map((t: TsAitTable, i: number) => {
    const table = root.application[i];
    // control code
    table['$'].control_code = t.controlCode?.toString(16) || '';
    // app id
    table.application_identifier[0]['$'].application_id = t.appId;
    // app name
    if (!table.application_name_descriptor[0].language[0]['$'].application_name)
      table.application_name_descriptor[0].language = [{ $: {} }];
    table.application_name_descriptor[0].language[0]['$'].application_name =
      t.appName || '';
    // version
    if (!table.application_descriptor[0].profile[0]['$'].version)
      table.application_descriptor[0].profile = [];
    table.application_descriptor[0].profile[0]['$'].version = t.version || '';
    // url
    let url1: string = '';
    let url2: string = '';
    if (t.url && t.url !== '') {
      const splitUrl = t.url.split('/');
      url1 = splitUrl[0] + '//' + splitUrl[2] || '';
      if (splitUrl.length > 3) {
        url2 = t.url.substr(url1.length) || '';
      }
    }
    if (url1 !== '') {
      if (!table.transport_protocol_descriptor[0].http) {
        ['object_carousel', 'protocol', 'ip_mpe'].forEach((key: string) => {
          delete table.transport_protocol_descriptor[0][key];
        });
        table.transport_protocol_descriptor[0].http = [{ url: [{ $: {} }] }];
      }
      table.transport_protocol_descriptor[0].http[0].url[0]['$'].base =
        url1 || '';
    } else if (
      url1 === '' &&
      table.transport_protocol_descriptor
        ?.find(Boolean)
        .http?.find(Boolean)
        .url?.find(Boolean)['$']?.base
    )
      delete table.transport_protocol_descriptor[0].http[0].url[0]['$'].base;

    if (url2 !== '') {
      if (!table.simple_application_location_descriptor) {
        table.simple_application_location_descriptor = [{ $: {} }];
      }
      table.simple_application_location_descriptor[0]['$'].initial_path =
        url2 || '';
    } else if (
      url2 === '' &&
      table.simple_application_location_descriptor &&
      table.simple_application_location_descriptor[0]['$'].initial_path
    )
      delete table.simple_application_location_descriptor[0]['$'].initial_path;

    return table;
  });
  oldAitJson.tsduck.AIT[0] = root;
  return oldAitJson;
};
