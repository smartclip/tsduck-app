/**
 * set up dotenv
 */

import dotenv from 'dotenv';
dotenv.config();

/**
 * set up configs
 */
export const generalConfig = {
  port: process.env.SERVER_PORT || 3001,
  dbAddress: process.env.DB_ADDRESS || 'mongodb://127.0.0.1/my_database',
  sessionLengthMin: process.env.SESSION_LENGTH_MIN || '60',
};

export const fileConfig = {
  dataInputDir: process.env.DATA_INPUT_DIR || 'data/tsFiles/input/',
  dataOutputDir: process.env.DATA_OUTPUT_DIR || 'data/tsFiles/output/',
};

export const liveConfig = {
  deliverySystem: process.env.DELIVERY_SYSTEM || 'DVB-T2',
  tuningFilePath:
    process.env.TUNING_FILE_PATH || 'data/tsFiles/tuning/channels.xml',
};

export const config = { ...generalConfig, ...fileConfig, ...liveConfig };

export default config;
