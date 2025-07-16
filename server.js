const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const { TextractClient, AnalyzeDocumentCommand } = require('@aws-sdk/client-textract');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' })); // Increase limit for larger images
app.use(express.static('.'));

console.log('Server starting...');
console.log('Environment variables:');
console.log('PORT:', process.env.PORT);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('AWS_REGION:', process.env.AWS_REGION);
console.log('AWS_ACCESS_KEY_ID configured:', !!process.env.AWS_ACCESS_KEY_ID);
console.log('AWS_SECRET_ACCESS_KEY configured:', !!process.env.AWS_SECRET_ACCESS_KEY);

// AWS Textract Configuration
const textractClient = new TextractClient({
    region: process.env.AWS_REGION || 'ap-southeast-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

// Serve the main HTML file
app.get('/', (req, res) => {
    console.log('Serving index.html');
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Health check endpoint
app.get('/health', (req, res) => {
    console.log('Health check requested');
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        aws_configured: !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY)
    });
});

// Textract API endpoint
app.post('/api/textract/analyze', async (req, res) => {
    try {
        console.log('Received Textract request');
        
        const { image, document_type, features } = req.body;
        
        if (!image) {
            console.log('Error: Image data is required');
            return res.status(400).json({ 
                success: false, 
                message: 'Image data is required' 
            });
        }

        console.log('Image data received, length:', image.length);
        
        // Check AWS credentials
        if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
            console.log('Error: AWS credentials not configured');
            return res.status(500).json({
                success: false,
                message: 'AWS credentials not configured. Please check your .env file.'
            });
        }
        
        // Convert base64 to buffer (remove data:image/jpeg;base64, prefix if present)
        const base64Data = image.replace(/^data:image\/[a-z]+;base64,/, '');
        const imageBuffer = Buffer.from(base64Data, 'base64');
        
        console.log('Image buffer size:', imageBuffer.length);
        
        // For demo purposes, return a mock response
        // In production, uncomment the AWS Textract code below
        console.log('Using mock response for demo');
        
        // Mock response for demo
        const mockResponse = {
            Blocks: [
                {
                    BlockType: 'KEY_VALUE_SET',
                    Id: '1',
                    EntityTypes: ['KEY'],
                    Text: 'NIK',
                    Relationships: [{ Type: 'VALUE', Ids: ['2'] }]
                },
                {
                    BlockType: 'KEY_VALUE_SET',
                    Id: '2',
                    EntityTypes: ['VALUE'],
                    Text: '3201234567890123'
                },
                {
                    BlockType: 'KEY_VALUE_SET',
                    Id: '3',
                    EntityTypes: ['KEY'],
                    Text: 'Nama',
                    Relationships: [{ Type: 'VALUE', Ids: ['4'] }]
                },
                {
                    BlockType: 'KEY_VALUE_SET',
                    Id: '4',
                    EntityTypes: ['VALUE'],
                    Text: 'JOHN DOE'
                },
                {
                    BlockType: 'KEY_VALUE_SET',
                    Id: '5',
                    EntityTypes: ['KEY'],
                    Text: 'Tempat/Tgl Lahir',
                    Relationships: [{ Type: 'VALUE', Ids: ['6'] }]
                },
                {
                    BlockType: 'KEY_VALUE_SET',
                    Id: '6',
                    EntityTypes: ['VALUE'],
                    Text: 'JAKARTA, 01-01-1990'
                },
                {
                    BlockType: 'KEY_VALUE_SET',
                    Id: '7',
                    EntityTypes: ['KEY'],
                    Text: 'Jenis Kelamin',
                    Relationships: [{ Type: 'VALUE', Ids: ['8'] }]
                },
                {
                    BlockType: 'KEY_VALUE_SET',
                    Id: '8',
                    EntityTypes: ['VALUE'],
                    Text: 'LAKI-LAKI'
                },
                {
                    BlockType: 'KEY_VALUE_SET',
                    Id: '9',
                    EntityTypes: ['KEY'],
                    Text: 'Alamat',
                    Relationships: [{ Type: 'VALUE', Ids: ['10'] }]
                },
                {
                    BlockType: 'KEY_VALUE_SET',
                    Id: '10',
                    EntityTypes: ['VALUE'],
                    Text: 'JL. CONTOH NO. 123'
                },
                {
                    BlockType: 'KEY_VALUE_SET',
                    Id: '11',
                    EntityTypes: ['KEY'],
                    Text: 'RT/RW',
                    Relationships: [{ Type: 'VALUE', Ids: ['12'] }]
                },
                {
                    BlockType: 'KEY_VALUE_SET',
                    Id: '12',
                    EntityTypes: ['VALUE'],
                    Text: '001/002'
                }
            ]
        };
        
        // Uncomment for real AWS Textract integration
        /*
        // Prepare Textract parameters
        const params = {
            Document: {
                Bytes: imageBuffer
            },
            FeatureTypes: features || ['FORMS', 'TABLES']
        };
        
        console.log('Calling AWS Textract...');
        const command = new AnalyzeDocumentCommand(params);
        const textractResponse = await textractClient.send(command);
        */
        
        // Use mock response for demo
        const textractResponse = mockResponse;
        
        console.log('Textract response received, blocks count:', textractResponse.Blocks?.length || 0);
        
        return res.json({
            success: true,
            textractResponse,
            message: 'Document analyzed successfully'
        });
        
    } catch (error) {
        console.error('Textract API Error:', error);
        
        let errorMessage = 'Failed to analyze document';
        if (error.name === 'InvalidParameterException') {
            errorMessage = 'Invalid image format or size. Please use a clear JPEG image.';
        } else if (error.name === 'AccessDeniedException') {
            errorMessage = 'AWS access denied. Please check your credentials and permissions.';
        } else if (error.name === 'ThrottlingException') {
            errorMessage = 'Too many requests. Please try again in a moment.';
        }
        
        return res.status(500).json({
            success: false,
            message: errorMessage,
            error: error.message,
            errorCode: error.name
        });
    }
});

// Save KTP data endpoint (for future database integration)
app.post('/api/ktp-data', async (req, res) => {
    try {
        const ktpData = req.body;
        
        console.log('Received KTP data:', ktpData);
        
        // Validate required fields
        if (!ktpData.nik || !ktpData.nama) {
            console.log('Error: NIK and Nama are required fields');
            return res.status(400).json({
                success: false,
                message: 'NIK and Nama are required fields'
            });
        }
        
        // For now, just log the data (in production, save to database)
        console.log('KTP Data to save:', JSON.stringify(ktpData, null, 2));
        
        return res.json({
            success: true,
            id: Date.now().toString(),
            message: 'KTP data received successfully',
            data: ktpData
        });
        
    } catch (error) {
        console.error('Save KTP Data Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to save KTP data',
            error: error.message
        });
    }
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Server Error:', error);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
});

// Start server
app.listen(port, () => {
    console.log('KTP OCR Server running on http://localhost:' + port);
    console.log('Health check: http://localhost:' + port + '/health');
    console.log('AWS Region:', process.env.AWS_REGION || 'ap-southeast-1');
    console.log('AWS Configured:', !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY));
});
