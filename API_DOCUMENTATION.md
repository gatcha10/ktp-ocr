# KTP Scanner API Documentation

This document outlines the API endpoints and integration points for the KTP Scanner application.

## Overview

The KTP Scanner application provides two main integration points:
1. **Text Extraction API** - For extracting text from KTP images using AWS Textract
2. **Data Storage API** - For storing processed KTP data in your database

## API Endpoints

### Text Extraction API

**Endpoint:** `/api/textract/extract`

**Method:** POST

**Request Headers:**
```
Content-Type: application/json
Authorization: Bearer <your-auth-token>
```

**Request Body:**
```json
{
  "image": "base64-encoded-image-data",
  "document_type": "ktp",
  "features": ["FORMS", "TABLES"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "nik": "3201234567890123",
    "full_name": "JOHN DOE EXAMPLE",
    "birth_place_date": "JAKARTA, 15 JANUARI 1990",
    "gender": "LAKI-LAKI",
    "blood_type": "A",
    "address": "JL. CONTOH NO. 123 RT 001 RW 004",
    "rt_rw": "001/004",
    "village": "MARGAHAYU",
    "district": "BEKASI TIMUR",
    "religion": "ISLAM",
    "marital_status": "KAWIN",
    "occupation": "KARYAWAN SWASTA",
    "nationality": "WNI",
    "valid_until": "SEUMUR HIDUP"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Failed to extract text from image",
  "code": "EXTRACTION_ERROR"
}
```

### Data Storage API

**Endpoint:** `/api/textract/ktp-data`

**Method:** POST

**Request Headers:**
```
Content-Type: application/json
Authorization: Bearer <your-auth-token>
```

**Request Body:**
```json
{
  "nik": "3201234567890123",
  "full_name": "JOHN DOE EXAMPLE",
  "birth_place_date": "JAKARTA, 15 JANUARI 1990",
  "gender": "LAKI-LAKI",
  "blood_type": "A",
  "address": "JL. CONTOH NO. 123 RT 001 RW 004",
  "rt_rw": "001/004",
  "village": "MARGAHAYU",
  "district": "BEKASI TIMUR",
  "religion": "ISLAM",
  "marital_status": "KAWIN",
  "occupation": "KARYAWAN SWASTA",
  "nationality": "WNI",
  "valid_until": "SEUMUR HIDUP",
  "timestamp": "2023-04-15T10:30:00.000Z",
  "source": "ktp_scanner"
}
```

**Response:**
```json
{
  "success": true,
  "id": "generated-record-id",
  "message": "Data saved successfully"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Failed to save data",
  "code": "DATABASE_ERROR"
}
```

## Integration Examples

### Frontend Integration

```javascript
// Example of calling the Text Extraction API
async function extractTextFromImage(base64Image) {
  try {
    const response = await fetch('/api/textract/extract', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify({
        image: base64Image,
        document_type: 'ktp',
        features: ['FORMS', 'TABLES']
      })
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Extraction error:', error);
    throw error;
  }
}

// Example of calling the Data Storage API
async function saveKtpData(ktpData) {
  try {
    const response = await fetch('/api/textract/ktp-data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify({
        ...ktpData,
        timestamp: new Date().toISOString(),
        source: 'ktp_scanner'
      })
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Save error:', error);
    throw error;
  }
}
```

### Backend Implementation (Node.js/Express)

```javascript
const express = require('express');
const AWS = require('aws-sdk');
const router = express.Router();

// Configure AWS
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
  region: process.env.AWS_REGION || 'us-east-1'
});

const textract = new AWS.Textract();

// Text Extraction API
router.post('/extract', async (req, res) => {
  try {
    const { image, document_type, features } = req.body;
    
    if (!image) {
      return res.status(400).json({
        success: false,
        error: 'Image data is required',
        code: 'MISSING_IMAGE'
      });
    }
    
    // Call AWS Textract
    const params = {
      Document: {
        Bytes: Buffer.from(image, 'base64')
      },
      FeatureTypes: features || ['FORMS', 'TABLES']
    };
    
    const textractResult = await textract.analyzeDocument(params).promise();
    
    // Process Textract result to extract KTP fields
    const extractedData = processTextractResult(textractResult, document_type);
    
    return res.json({
      success: true,
      data: extractedData
    });
  } catch (error) {
    console.error('Textract API error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to extract text from image',
      code: 'EXTRACTION_ERROR'
    });
  }
});

// Data Storage API
router.post('/ktp-data', async (req, res) => {
  try {
    // Validate required fields
    const { nik, full_name } = req.body;
    
    if (!nik || !full_name) {
      return res.status(400).json({
        success: false,
        error: 'NIK and full_name are required',
        code: 'MISSING_REQUIRED_FIELDS'
      });
    }
    
    // Save to database (example using MongoDB)
    const result = await db.collection('ktp_data').insertOne({
      ...req.body,
      created_at: new Date()
    });
    
    return res.json({
      success: true,
      id: result.insertedId,
      message: 'Data saved successfully'
    });
  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to save data',
      code: 'DATABASE_ERROR'
    });
  }
});

module.exports = router;
```

## Authentication

The API uses Bearer token authentication. To obtain a token, implement an authentication system or use a service like AWS Cognito, Auth0, or Firebase Authentication.

Example authentication header:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Error Codes

| Code | Description |
|------|-------------|
| `EXTRACTION_ERROR` | Failed to extract text from image |
| `DATABASE_ERROR` | Failed to save data to database |
| `MISSING_IMAGE` | Image data is missing in request |
| `MISSING_REQUIRED_FIELDS` | Required fields are missing |
| `INVALID_TOKEN` | Authentication token is invalid |
| `TOKEN_EXPIRED` | Authentication token has expired |

## Rate Limiting

The API implements rate limiting to prevent abuse:
- 10 requests per minute for text extraction
- 20 requests per minute for data storage

Exceeding these limits will result in a 429 Too Many Requests response.

## CORS Configuration

The API supports Cross-Origin Resource Sharing (CORS) for specified origins. Configure your backend to allow requests from your frontend domain.

Example CORS configuration (Express):
```javascript
app.use(cors({
  origin: ['https://your-frontend-domain.com'],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```