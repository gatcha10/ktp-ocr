// AWS Textract API Integration for KTP Scanner
// This file provides real AWS Textract integration

class TextractAPIIntegration {
    constructor(apiEndpoint) {
        this.apiEndpoint = apiEndpoint || '/api/textract';
        this.parser = new TextractKTPParser();
    }

    /**
     * Call AWS Textract API to extract text from KTP image
     * @param {String} base64Image - Base64 encoded image
     * @returns {Object} - Structured KTP data
     */
    async callTextractAPI(base64Image) {
        try {
            // Call backend API that interfaces with AWS Textract
            const response = await fetch(`${this.apiEndpoint}/analyze`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.getAuthToken()}` // If using auth
                },
                body: JSON.stringify({
                    image: base64Image,
                    document_type: 'ktp', // Specify document type
                    features: ['FORMS'] // Textract features to use
                })
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status} ${response.statusText}`);
            }

            // Get raw Textract response
            const result = await response.json();
            
            // If backend already parsed the response
            if (result.data && typeof result.data === 'object') {
                return result.data;
            }
            
            // If backend returns raw Textract response, parse it
            if (result.textractResponse) {
                return this.parser.parseTextractResponse(result.textractResponse);
            }
            
            throw new Error('Invalid API response format');
        } catch (error) {
            console.error('Textract API Error:', error);
            throw new Error('Failed to extract text from image');
        }
    }

    /**
     * Direct AWS Textract integration without backend
     * Note: This requires AWS SDK and proper credentials
     * @param {String} base64Image - Base64 encoded image
     * @returns {Object} - Structured KTP data
     */
    async callTextractDirectly(base64Image) {
        try {
            // This is a placeholder for direct AWS SDK integration
            // You would need to include AWS SDK and configure credentials
            
            // Example with AWS SDK v3:
            /*
            import { TextractClient, AnalyzeDocumentCommand } from "@aws-sdk/client-textract";
            
            const client = new TextractClient({ region: "ap-southeast-1" });
            
            const params = {
                Document: {
                    Bytes: Buffer.from(base64Image, 'base64')
                },
                FeatureTypes: ["FORMS"]
            };
            
            const command = new AnalyzeDocumentCommand(params);
            const textractResponse = await client.send(command);
            
            return this.parser.parseTextractResponse(textractResponse);
            */
            
            // For now, we'll use the sample response for demonstration
            return this.useSampleResponse();
        } catch (error) {
            console.error('Direct Textract Error:', error);
            throw new Error('Failed to extract text from image');
        }
    }
    
    /**
     * Use sample response for demonstration
     * @returns {Object} - Parsed KTP data from sample
     */
    async useSampleResponse() {
        try {
            // Fetch the sample response file
            const response = await fetch('/SAMPLE OUTPUT/38images(27)/analyzeDocResponse.json');
            if (!response.ok) {
                throw new Error('Failed to load sample response');
            }
            
            const sampleResponse = await response.json();
            return this.parser.parseTextractResponse(sampleResponse);
        } catch (error) {
            console.error('Sample response error:', error);
            
            // Fallback to hardcoded sample
            const sampleData = {
                nik: '3506042602660001',
                full_name: 'SULISTYONO',
                birth_place_date: 'KEDIRI, 26-02-1966',
                gender: 'LAKI-LAKI',
                blood_type: '',
                address: 'JLRAYA- - DSN PURWOKERTO',
                rt_rw: '002/003',
                village: 'PURWOKERTO',
                district: 'NGADILUWIH',
                religion: 'ISLAM',
                marital_status: 'KAWIN',
                occupation: 'GURU',
                nationality: 'WNI',
                valid_until: '26-02-2017'
            };
            
            return sampleData;
        }
    }

    /**
     * Submit processed KTP data to database
     * @param {Object} apiData - Structured KTP data
     * @returns {Object} - API response
     */
    async submitToDatabase(apiData) {
        try {
            const response = await fetch(`${this.apiEndpoint}/ktp-data`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.getAuthToken()}`
                },
                body: JSON.stringify({
                    ...apiData,
                    timestamp: new Date().toISOString(),
                    source: 'ktp_scanner'
                })
            });

            if (!response.ok) {
                throw new Error(`Database Error: ${response.status} ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Database Error:', error);
            throw new Error('Failed to save data to database');
        }
    }

    /**
     * Get authentication token
     * @returns {String} - Auth token
     */
    getAuthToken() {
        // Example: return localStorage.getItem('auth_token');
        return 'your-auth-token-here';
    }
}

// Example backend API endpoints you need to implement:

/*
POST /api/textract/analyze
Request:
{
    "image": "base64-encoded-image",
    "document_type": "ktp",
    "features": ["FORMS"]
}

Response (Option 1 - Raw Textract response):
{
    "success": true,
    "textractResponse": {
        "DocumentMetadata": { "Pages": 1 },
        "Blocks": [ ... ]
    }
}

Response (Option 2 - Parsed data):
{
    "success": true,
    "data": {
        "nik": "3506042602660001",
        "full_name": "SULISTYONO",
        "birth_place_date": "KEDIRI, 26-02-1966",
        "gender": "LAKI-LAKI",
        "blood_type": "",
        "address": "JLRAYA- - DSN PURWOKERTO",
        "rt_rw": "002/003",
        "village": "PURWOKERTO",
        "district": "NGADILUWIH",
        "religion": "ISLAM",
        "marital_status": "KAWIN",
        "occupation": "GURU",
        "nationality": "WNI",
        "valid_until": "26-02-2017"
    }
}

POST /api/textract/ktp-data
Request:
{
    "nik": "3506042602660001",
    "full_name": "SULISTYONO",
    // ... other fields
    "timestamp": "2024-07-16T15:30:00.000Z",
    "source": "ktp_scanner"
}

Response:
{
    "success": true,
    "id": "generated-record-id",
    "message": "Data saved successfully"
}
*/

// To use this in your application:
// 1. Replace the mock methods in KTPScanner class
// 2. Initialize with your API endpoint:
//    const apiIntegration = new TextractAPIIntegration('https://your-api.com/api/textract');
// 3. Update the methods in KTPScanner to use apiIntegration.callTextractAPI() and apiIntegration.submitToDatabase()
