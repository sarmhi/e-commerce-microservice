import { Client } from '@elastic/elasticsearch';
import winston from 'winston';
import keys from '../config/keys';

const esClient = new Client({
  node: keys.ELASTICSEARCH_URL,
});

const logger = winston.createLogger({
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'app.log' }),
  ],
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
});

export const logEvent = async (event: string, data: any) => {
  const logMessage = { event, data, timestamp: new Date() };

  logger.info(logMessage);

  try {
    await esClient.index({
      index: 'application-logs',
      body: logMessage,
    });
  } catch (error) {
    logger.error('Failed to send log to Elasticsearch', error);
  }
};
