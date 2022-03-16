import { DdbToS3Archive } from './ddbToS3Archive';

const ddbToS3Archive = new DdbToS3Archive();

// This is a separate lambda function from the main FHIR API server lambda.
// This lambda picks up changes from DDB by way of DDB stream, updates TTL field
// and forward change events that were delete from TTL elapse to Firehose delivery stream.
// Firehose delivery stream would archive them in a S3 bucket.
export async function handleDdbToS3Event(event: any) {
    return ddbToS3Archive.handleDDBStreamEvent(event);
}
