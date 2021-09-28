import TSP from '../services/tsp';
import { generalConfig } from '../../config';
import { buildAit, getAitInfos } from './aitParserService';
const config = generalConfig;

// current session id, indicates whether service is in use
let _sessionId: string | undefined = undefined;

export const getCurrentSessionId = (): string | undefined => _sessionId;
export const resetCurrentSessionId = (): void => (_sessionId = undefined);

export const getServerSession = (): string | undefined => {
  if (
    _sessionId &&
    parseInt(_sessionId) <
      Date.now() - parseInt(config.sessionLengthMin) * 60 * 1000
  )
    sessionLogout();
  return _sessionId;
};

/**
 * generates a new session key, if no one already saved or
 * compares session key from client with available session key
 * @param sessionkey session key stored in client to compare
 * @returns either an error, if service is already in use by another client or session key as result
 */
export const sessionLogin = (sessionkey?: string): string | void => {
  if (_sessionId) {
    if (sessionkey === _sessionId) return _sessionId;
    else return;
  } else {
    _sessionId = Date.now().toString();
    return _sessionId;
  }
};

/**
 * clears the session key to free the service from client session
 */
export const sessionLogout = (): void => {
  _sessionId = undefined;
};
