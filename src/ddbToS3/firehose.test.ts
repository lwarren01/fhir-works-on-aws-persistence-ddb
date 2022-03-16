import AWS from 'aws-sdk';
import sinon from 'sinon';
import AWSMock from 'aws-sdk-mock';
import _ from 'lodash';
import Firehose from './firehose';
import GenerateDynamodbRecordFactory from '../../testUtilities/GenerateDynamodbRecordFactory';

const sandbox = sinon.createSandbox();
const putRecordBatchStub = sandbox.stub();
const consoleLogStub = sandbox.stub();
AWSMock.setSDKInstance(AWS);

const firehose = new Firehose();

describe('firehose putRecords', () => {
    beforeEach(() => {
        AWSMock.mock('Firehose', 'putRecordBatch', putRecordBatchStub);
        sandbox.replace(console, 'log', consoleLogStub);
        putRecordBatchStub.reset();
    });

    afterEach(() => {
        AWSMock.restore();
        sandbox.restore();
    });

    test('putRecordBatch fails', async () => {
        putRecordBatchStub.yields(new Error('AWS Firehose.putRecordBatch call failed'), null);
        const event = {
            Records: [GenerateDynamodbRecordFactory.getInsertRecord()],
        };

        await firehose.putRecords(event.Records);

        expect(_.startsWith(consoleLogStub.lastCall.firstArg, 'sing sad songs,')).toEqual(true);
    });

    test('partial payload failures in batch logged', async () => {
        putRecordBatchStub.yields(null, {
            FailedPutCount: 1,
            Encrypted: true,
            RequestResponses: [
                {
                    RecordId: Math.random().toString(16).substring(2),
                },
                {
                    RecordId: Math.random().toString(16).substring(2),
                    ErrorCode: Math.random().toString(16).substring(2),
                    ErrorMessage: 'Stuff done broke',
                },
            ],
        });

        const event = {
            Records: [GenerateDynamodbRecordFactory.getInsertRecord(), GenerateDynamodbRecordFactory.getInsertRecord()],
        };

        await firehose.putRecords(event.Records);

        expect(_.startsWith(consoleLogStub.lastCall.firstArg, 'sing sad songs,')).toEqual(true);
    });

    test('all pass', async () => {
        putRecordBatchStub.yields(null, {
            FailedPutCount: 0,
            Encrypted: true,
            RequestResponses: [
                {
                    RecordId: Math.random().toString(16).substring(2),
                },
                {
                    RecordId: Math.random().toString(16).substring(2),
                },
            ],
        });

        const event = {
            Records: [GenerateDynamodbRecordFactory.getInsertRecord(), GenerateDynamodbRecordFactory.getUpdateRecord()],
        };

        await firehose.putRecords(event.Records);

        expect(consoleLogStub.lastCall.firstArg).toEqual('sing happy songs, 2 records pushed to delivery stream');
        expect(_.startsWith(consoleLogStub.lastCall.firstArg, 'sing happy songs,')).toEqual(true);
    });
});
