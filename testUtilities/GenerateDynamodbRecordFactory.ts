import _ from 'lodash';
import GenerateDynamodbRecordImageFactory from './GenerateDynamodbRecordImageFactory';

const DEFAULT_RECORD_EVENT = {
    eventID: '1a3e49152e5fe9f1e5842c17f615d771',
    eventName: 'INSERT',
    eventVersion: '1.1',
    eventSource: 'aws:dynamodb',
    awsRegion: 'us-west-2',
    dynamodb: {
        ApproximateCreationDateTime: 1647264242,
        Keys: {
            vid: {
                N: 1,
            },
            id: {
                S: '5d431a2a-be00-41b5-9cff-111265b2d9a5',
            },
        },
        NewImage: {
            identifier: {
                L: [
                    {
                        M: {
                            value: {
                                S: 'QE2-Halifax',
                            },
                        },
                    },
                ],
            },
            address: {
                L: [
                    {
                        M: {
                            country: {
                                S: 'Canada',
                            },
                            city: {
                                S: 'Halifax',
                            },
                            postalCode: {
                                S: 'B4BC3C',
                            },
                            state: {
                                S: 'NS',
                            },
                        },
                    },
                ],
            },
            gender: {
                S: 'male',
            },
            active: {
                BOOL: true,
            },
            _references: {
                L: [
                    {
                        S: 'Organization/19d9bd55-56fc-4d19-850f-2c1ee651aefb',
                    },
                ],
            },
            birthDate: {
                S: '1996-09-24',
            },
            lockEndTs: {
                N: '1647264242065',
            },
            vid: {
                N: '1',
            },
            managingOrganization: {
                M: {
                    reference: {
                        S: 'Organization/19d9bd55-56fc-4d19-850f-2c1ee651aefb',
                    },
                },
            },
            meta: {
                M: {
                    lastUpdated: {
                        S: '2022-03-14T13:24:02.065Z',
                    },
                    versionId: {
                        S: '1',
                    },
                },
            },
            name: {
                L: [
                    {
                        M: {
                            given: {
                                L: [
                                    {
                                        S: 'IWK',
                                    },
                                ],
                            },
                            family: {
                                S: '6',
                            },
                        },
                    },
                ],
            },
            documentStatus: {
                S: 'AVAILABLE',
            },
            id: {
                S: '5d431a2a-be00-41b5-9cff-111265b2d9a5',
            },
            resourceType: {
                S: 'Patient',
            },
        },
        SequenceNumber: '46107900000000048533287743',
        SizeBytes: 512,
        StreamViewType: 'NEW_AND_OLD_IMAGES',
    },
    eventSourceARN: 'arn:aws:dynamodb:us-west-2:325115894113:table/resource-db-dev/stream/2022-03-04T20:48:00.152',
};

export default class GenerateDynamodbRecordFactory {
    static getInsertRecord = (): any => {
        return _.cloneDeep(DEFAULT_RECORD_EVENT);
    };

    static getUpdateRecord = (vid: number = 2): any => {
        const record = _.cloneDeep(DEFAULT_RECORD_EVENT);
        _.assign(record, {
            eventName: 'MODIFY',
            dynamodb: {
                Keys: {
                    id: {
                        S: '5d431a2a-be00-41b5-9cff-111265b2d9a5',
                    },
                    vid: {
                        N: vid,
                    },
                },
                OldImage: GenerateDynamodbRecordImageFactory.getImage(),
                NewImage: GenerateDynamodbRecordImageFactory.getImageWithCity(['Halifax']),
            },
        });
        return record;
    };
}
