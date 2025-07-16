// Example backend implementation using Node.js and Express
// This is a reference implementation - not part of the frontend code

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { TextractClient, AnalyzeDocumentCommand } = require('@aws-sdk/client-textract');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' })); // Increase limit for base64 images

// AWS Configuration
const textractClient = new TextractClient({
    region: process.env.AWS_REGION || 'ap-southeast-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

// Simple authentication middleware
const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    
    const token = authHeader.split(' ')[1];
    
    // In a real application, validate the token
    // For this example, we'll just check if it exists
    if (!token) {
        return res.status(401).json({ success: false, message: 'Invalid token' });
    }
    
    // Add user info to request object if needed
    // req.user = { id: 'user_id', ... };
    
    next();
};

// API Routes
app.post('/api/textract/analyze', authenticate, async (req, res) => {
    try {
        const { image, document_type, features } = req.body;
        
        if (!image) {
            return res.status(400).json({ success: false, message: 'Image is required' });
        }
        
        // Convert base64 to buffer
        const imageBuffer = Buffer.from(image, 'base64');
        
        // Call AWS Textract
        const params = {
            Document: {
                Bytes: imageBuffer
            },
            FeatureTypes: features || ['FORMS']
        };
        
        const command = new AnalyzeDocumentCommand(params);
        const textractResponse = await textractClient.send(command);
        
        // Return raw Textract response
        // Client-side will handle parsing
        return res.json({
            success: true,
            textractResponse
        });
        
    } catch (error) {
        console.error('Textract API Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to analyze document',
            error: error.message
        });
    }
});

// Store KTP data in database
app.post('/api/textract/ktp-data', authenticate, async (req, res) => {
    try {
        const ktpData = req.body;
        
        // Validate required fields
        if (!ktpData.nik || !ktpData.full_name) {
            return res.status(400).json({
                success: false,
                message: 'NIK and full_name are required'
            });
        }
        
        // In a real application, store data in database
        // Example with MongoDB:
        /*
        const db = req.app.locals.db;
        const result = await db.collection('ktp_data').insertOne({
            ...ktpData,
            created_at: new Date(),
            user_id: req.user.id // From authentication middleware
        });
        
        return res.json({
            success: true,
            id: result.insertedId,
            message: 'Data saved successfully'
        });
        */
        
        // For this example, just return success
        return res.json({
            success: true,
            id: Date.now().toString(),
            message: 'Data saved successfully'
        });
        
    } catch (error) {
        console.error('Database Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to save data',
            error: error.message
        });
    }
});

// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

/*
To run this backend:
1. Install dependencies:
   npm install express body-parser cors @aws-sdk/client-textract

2. Set environment variables:
   export AWS_REGION=ap-southeast-1
   export AWS_ACCESS_KEY_ID=your_access_key
   export AWS_SECRET_ACCESS_KEY=your_secret_key

3. Run the server:
   node backend-example.js
*/
