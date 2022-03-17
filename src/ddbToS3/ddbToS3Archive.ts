import Firehose from './firehose';
import DynamoDB from './dynamodb';
import utility from './utility';
import getComponentLogger from '../loggerBuilder';

const logger = getComponentLogger();

const ttlsInSeconds = utility.parseArchiveConfig(process.env.ARCHIVE_CONFIG);

export class DdbToS3Archive {
    private readonly firehose: Firehose;

    private readonly dynamodb: DynamoDB;

    constructor() {
        this.firehose = new Firehose();
        this.dynamodb = new DynamoDB();
    }

    async handleDDBStreamEvent(event: any) {
        if (event && event.Records) {
            console.log(`DynamoDB stream published ${event.Records.length} records to process.`);

            // get records that were removed from TTL elapse
            let records = utility.filterRemovedRecordsFromTTL(event.Records);
            logger.info(`DynamoDB stream published ${records.length} records removed by TTL to process.`);
            try {
                await this.firehose.putRecords(records);
            } catch (e) {
                logger.error('Failed to put records to Firehose', e);
                throw e;
            }

            // get records that need to be updated with TTL field
            records = utility.filterRecordsNeedUpdateTTL(event.Records, ttlsInSeconds);
            logger.info(`DynamoDB stream published ${records.length} records that need to be updated with TTL field.`);
            try {
                await this.dynamodb.updateRecords(records, ttlsInSeconds);
            } catch (e) {
                logger.error('Failed to update records with TTL fields', e);
                throw e;
            }
        } else {
            logger.info('No records published by Dynamodb stream.');
        }
    }
}
