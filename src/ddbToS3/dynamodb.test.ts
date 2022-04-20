import AWS from 'aws-sdk';
import sinon from 'sinon';
import AWSMock from 'aws-sdk-mock';
import _ from 'lodash';
import Dynamodb from './dynamodb';
import GenerateDynamodbRecordFactory from '../../testUtilities/GenerateDynamodbRecordFactory';

const sandbox = sinon.createSandbox();
const batchExecuteStatementStub = sandbox.stub();
const consoleLogStub = sandbox.stub();
AWSMock.setSDKInstance(AWS);

const DEFAULT_TTL_IN_SECONDS = new Map<string, number>();
DEFAULT_TTL_IN_SECONDS.set('Patient', 150000);
const dynamodb = new Dynamodb();

describe('dynamodb updateRecords', () => {
    beforeEach(() => {
        AWSMock.mock('DynamoDB', 'batchExecuteStatement', batchExecuteStatementStub);
        sandbox.replace(console, 'log', consoleLogStub);
        batchExecuteStatementStub.reset();
    });

    afterEach(() => {
        AWSMock.restore();
        sandbox.restore();
    });

    test('updateRecords fails', async () => {
        batchExecuteStatementStub.yields(new Error('AWS DynamoDB.batchExecuteStatement call failed'), null);
        const records = [GenerateDynamodbRecordFactory.getInsertRecord()];
        await dynamodb.updateRecords(records, DEFAULT_TTL_IN_SECONDS);

        expect(_.startsWith(consoleLogStub.lastCall.firstArg, 'sing sad songs,')).toEqual(true);
    });

    test('partial payload failures in batch logged', async () => {
        batchExecuteStatementStub.yields(null, {
            Responses: [
                {
                    TableName: 'resource-db-dev',
                },
                {
                    Error: {
                        Code: 'ValidationError',
                    },
                    TableName: 'resource-db-dev',
                },
            ],
        });

        const records = [
            GenerateDynamodbRecordFactory.getInsertRecord(),
            GenerateDynamodbRecordFactory.getInsertRecord(),
        ];
        await dynamodb.updateRecords(records, DEFAULT_TTL_IN_SECONDS);

        expect(_.startsWith(consoleLogStub.lastCall.firstArg, 'sing sad songs,')).toEqual(true);
    });

    test('all pass', async () => {
        batchExecuteStatementStub.yields(null, {
            Responses: [
                {
                    TableName: 'resource-db-dev',
                },
                {
                    TableName: 'resource-db-dev',
                },
            ],
        });

        const records = [
            GenerateDynamodbRecordFactory.getInsertRecord(),
            GenerateDynamodbRecordFactory.getUpdateRecord(),
        ];
        await dynamodb.updateRecords(records, DEFAULT_TTL_IN_SECONDS);

        expect(consoleLogStub.lastCall.firstArg).toEqual('sing happy songs, 2 statements succeeded.');
        expect(_.startsWith(consoleLogStub.lastCall.firstArg, 'sing happy songs,')).toEqual(true);
    });

    test('update all previous items', async () => {
        const numStatements = 5;
        const responses = [];
        for (let i = 0; i < numStatements; i += 1) {
            responses.push({
                TableName: 'resource-db-dev',
            });
        }

        batchExecuteStatementStub.yields(null, {
            Responses: responses,
        });

        await dynamodb.updateRecords(
            [GenerateDynamodbRecordFactory.getUpdateRecord(numStatements)],
            DEFAULT_TTL_IN_SECONDS,
        );

        expect(consoleLogStub.lastCall.firstArg).toEqual(`sing happy songs, ${numStatements} statements succeeded.`);
        expect(_.startsWith(consoleLogStub.lastCall.firstArg, 'sing happy songs,')).toEqual(true);
    });
});
