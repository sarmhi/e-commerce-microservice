import { Client } from '@elastic/elasticsearch';

const esClient = new Client({ node: process.env.ELASTICSEARCH_URL });

export const logStockUpdate = async (data: any) => {
  try {
    await esClient.index({
      index: 'stock-logs',
      body: data,
    });
    console.log('Stock log sent to Elasticsearch');
  } catch (error) {
    console.error('Error logging to Elasticsearch', error);
  }
};
