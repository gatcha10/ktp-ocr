# AWS Textract Integration Guide

This guide explains how to integrate the KTP Scanner application with AWS Textract for production use.

## Prerequisites

1. AWS Account with access to Textract service
2. AWS Access Key and Secret Key with appropriate permissions
3. Basic knowledge of AWS services and API calls

## Integration Options

There are two main ways to integrate with AWS Textract:

1. **Backend Integration (Recommended)**: Create a backend service that communicates with AWS Textract and exposes a simplified API for the frontend.
2. **Direct Integration**: Use AWS SDK directly in the frontend (not recommended for production due to security concerns).

## Backend Integration

### 1. Set Up Backend Server

Use the provided `backend-example.js` as a starting point:

```bash
# Install dependencies
npm install express body-parser cors @aws-sdk/client-textract

# Set environment variables
export AWS_REGION=ap-southeast-1
export AWS_ACCESS_KEY_ID=your_access_key
export AWS_SECRET_ACCESS_KEY=your_secret_key

# Run the server
node backend-example.js
```

### 2. Configure Frontend

Update the API endpoint in your application:

```javascript
// Initialize with your backend API endpoint
const apiIntegration = new TextractAPIIntegration('http://localhost:3000/api/textract');

// Add to KTPScanner instance
ktpScanner.apiIntegration = apiIntegration;
```

## Understanding the Code Structure

### TextractKTPParser

The `TextractKTPParser` class in `textract-parser.js` handles parsing the raw AWS Textract response into structured data that matches our application's field configuration.

Key methods:
- `parseTextractResponse(textractResponse)`: Main method to parse Textract response
- `extractKeyValuePairs(textractResponse)`: Extracts key-value pairs from Textract blocks
- `getTextFromBlock(block, textractResponse)`: Gets text from a block by following relationships
- `handleSpecialCases(result)`: Handles special formatting for specific fields

### TextractAPIIntegration

The `TextractAPIIntegration` class in `api-example.js` handles communication with the backend API or directly with AWS Textract.

Key methods:
- `callTextractAPI(base64Image)`: Calls the backend API to analyze the image
- `callTextractDirectly(base64Image)`: Direct AWS SDK integration (requires credentials)
- `useSampleResponse()`: Uses sample response for demonstration
- `submitToDatabase(apiData)`: Submits processed data to the database

## Sample Response Structure

The AWS Textract response follows this structure:

```json
{
  "DocumentMetadata": {
    "Pages": 1
  },
  "Blocks": [
    {
      "BlockType": "PAGE",
      "Geometry": { ... },
      "Id": "...",
      "Relationships": [ ... ]
    },
    {
      "BlockType": "LINE",
      "Confidence": 99.93,
      "Text": "PROVINSI JAWA TIMUR",
      "Geometry": { ... },
      "Id": "...",
      "Relationships": [ ... ]
    },
    {
      "BlockType": "KEY_VALUE_SET",
      "EntityTypes": ["KEY"],
      "Geometry": { ... },
      "Id": "...",
      "Relationships": [
        {
          "Type": "VALUE",
          "Ids": ["..."]
        },
        {
          "Type": "CHILD",
          "Ids": ["...", "..."]
        }
      ]
    },
    // More blocks...
  ]
}
```

The parser extracts key-value pairs from `KEY_VALUE_SET` blocks and maps them to our application fields.

## Field Mapping

The field mapping in `TextractKTPParser` connects Textract's extracted fields to our application fields:

```javascript
this.fieldMappings = {
    'NIK': 'nik',
    'Nama': 'full_name',
    'Tempat/Tgl Lahir': 'birth_place_date',
    'Jenis Kelamin': 'gender',
    'Gol. Darah': 'blood_type',
    'Alamat': 'address',
    'RT/RW': 'rt_rw',
    'Kel/Desa': 'village',
    'Kecamatan': 'district',
    'Agama': 'religion',
    'Status Perkawinan': 'marital_status',
    'Pekerjaan': 'occupation',
    'Kewarganegaraan': 'nationality',
    'Berlaku Hingga': 'valid_until'
};
```

## Troubleshooting

### Common Issues

1. **Authentication Errors**: Ensure your AWS credentials have the correct permissions for Textract.
2. **CORS Errors**: Configure your backend to allow cross-origin requests from your frontend domain.
3. **Image Format Issues**: Ensure images are in JPEG format and properly base64 encoded.
4. **Parsing Errors**: Check the console for parsing errors and adjust the parser as needed.

### Debugging

1. Enable console logging in the parser:

```javascript
console.log('Raw Textract response:', textractResponse);
console.log('Extracted key-value pairs:', keyValuePairs);
console.log('Parsed result:', result);
```

2. Check the AWS CloudWatch logs for Textract API errors.

## Production Considerations

1. **Security**: Never expose AWS credentials in frontend code. Always use a backend service.
2. **Rate Limiting**: Implement rate limiting to prevent abuse of your Textract quota.
3. **Error Handling**: Implement robust error handling and user feedback.
4. **Validation**: Validate extracted data before saving to database.
5. **Monitoring**: Set up monitoring for Textract API calls and errors.

## Resources

- [AWS Textract Documentation](https://docs.aws.amazon.com/textract/)
- [AWS SDK for JavaScript](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/textract/)
- [Express.js Documentation](https://expressjs.com/)
