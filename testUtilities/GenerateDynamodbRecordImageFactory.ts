import _ from 'lodash';

const DEFAULT_IMAGE = {
    id: {
        S: 'acdd2370-db4b-43d7-92de-e2e82ebef362',
    },
    vid: {
        N: '2',
    },
    resourceType: {
        S: 'Patient',
    },
    address: {
        L: [
            {
                city: {
                    S: 'Halifax',
                },
            },
            {
                city: {
                    S: 'Toronto',
                },
            },
        ],
    },
};

export default class GenerateDynamodbRecordImageFactory {
    static getImage = (): any => {
        return _.cloneDeep(DEFAULT_IMAGE);
    };

    static getImageWithTTL = (ttlFieldName: string, ttl: number): any => {
        const image = this.getImage();
        image[ttlFieldName] = ttl;
        return image;
    };

    static getImageWithCity = (cities: string[]): any => {
        const image = this.getImage();
        image.address.L = cities.map((city) => {
            return {
                city: {
                    S: city,
                },
            };
        });
        return image;
    };
}
