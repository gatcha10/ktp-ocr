# 🆔 KTP Scanner - AWS Textract Frontend

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow.svg)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![AWS Textract](https://img.shields.io/badge/AWS-Textract-orange.svg)](https://aws.amazon.com/textract/)

A modern, responsive web application for scanning Indonesian ID cards (KTP) using AWS Textract with **dynamic field configuration** system.

## 🚀 Features

- 📱 **Mobile-First Design** - Optimized for mobile devices and desktop
- 🖼️ **Drag & Drop Upload** - Easy file upload with drag and drop support
- 🔍 **AWS Textract Integration** - Automatic text extraction from KTP images
- ⚙️ **Dynamic Field Configuration** - Easily customizable form fields and API mapping
- ✏️ **Editable Results** - Review and edit extracted data before submission
- 💾 **Database Integration** - Submit processed data to your backend
- 🌙 **Dark Mode Support** - Automatic dark mode based on system preference
- 📱 **PWA Support** - Can be installed as a mobile app
- ✅ **Form Validation** - Built-in validation with custom rules
- 🔄 **API Mapping** - Automatic mapping between form fields and API format

## 🏗️ Architecture

### Dynamic Field System
- **Configuration-driven**: All fields defined in `field-config.js`
- **API-ready**: Built-in mapping between form and API formats
- **Validation**: Configurable validation rules and error messages
- **Flexible**: Support for text, select, and textarea inputs

### File Structure
```
├── index.html              # Main HTML file
├── styles.css              # CSS styles with responsive design
├── script.js               # Main JavaScript functionality
├── field-config.js         # Dynamic field configuration
├── api-example.js          # Real API integration examples
├── manifest.json           # PWA manifest
├── sw.js                   # Service worker for offline support
├── README.md               # This file
└── CONFIGURATION.md        # Field configuration guide
```

## How to Run

### Method 1: Simple File Opening
```bash
open index.html
```

### Method 2: Local Web Server (Recommended)
```bash
# Using Python
python3 -m http.server 8000

# Using Node.js (if you have http-server installed)
npx http-server

# Using PHP
php -S localhost:8000
```

Then open `http://localhost:8000` in your browser.

## AWS Textract Integration

The current implementation includes a mock AWS Textract integration. To connect with real AWS Textract:

### Option 1: Frontend Direct Integration (Not Recommended for Production)

```javascript
// Install AWS SDK
// npm install aws-sdk

import AWS from 'aws-sdk';

// Configure AWS
AWS.config.update({
    accessKeyId: 'YOUR_ACCESS_KEY',
    secretAccessKey: 'YOUR_SECRET_KEY',
    region: 'us-east-1'
});

const textract = new AWS.Textract();

async function callTextractAPI(base64Image) {
    const params = {
        Document: {
            Bytes: Buffer.from(base64Image, 'base64')
        },
        FeatureTypes: ['FORMS', 'TABLES']
    };
    
    try {
        const result = await textract.analyzeDocument(params).promise();
        return parseTextractResponse(result);
    } catch (error) {
        console.error('Textract error:', error);
        throw error;
    }
}
```

### Option 2: Backend API Integration (Recommended)

Create a backend API endpoint that handles AWS Textract calls:

```javascript
async function callTextractAPI(base64Image) {
    const response = await fetch('/api/textract', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            image: base64Image
        })
    });
    
    if (!response.ok) {
        throw new Error('Failed to extract text');
    }
    
    return await response.json();
}
```

## Database Integration

Update the `submitToDatabase` function in `script.js`:

```javascript
async function submitToDatabase(data) {
    const response = await fetch('/api/ktp-data', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    });
    
    if (!response.ok) {
        throw new Error('Failed to save data');
    }
    
    return await response.json();
}
```

## Customization

### Adding New Fields

1. Add the field to the field configuration in `field-config.js`
2. Update the mock data in `getMockExtractedData()` function
3. Add parsing logic in your Textract response handler

See [CONFIGURATION.md](CONFIGURATION.md) for detailed instructions.

### Styling

The application uses CSS custom properties for easy theming. Key variables:

```css
:root {
    --primary-color: #4facfe;
    --secondary-color: #00f2fe;
    --success-color: #10b981;
    --error-color: #ef4444;
    --warning-color: #f59e0b;
}
```

## Browser Support

- Chrome/Edge 80+
- Firefox 75+
- Safari 13+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Security Considerations

1. **Never expose AWS credentials in frontend code**
2. **Use HTTPS in production**
3. **Implement proper file validation**
4. **Sanitize user inputs**
5. **Use CORS properly**
6. **Implement rate limiting**

## Production Deployment

1. **Remove mock data** from `script.js`
2. **Configure real AWS Textract integration**
3. **Set up proper backend API**
4. **Configure HTTPS**
5. **Optimize images and assets**
6. **Set up proper error logging**

## Mobile Installation

Users can install this as a PWA on their mobile devices:

1. Open the website in mobile browser
2. Tap "Add to Home Screen" (iOS) or "Install" (Android)
3. The app will be available as a native-like application

## License

This project is open source and available under the MIT License.

## Support

For issues and questions, please create an issue in the repository or contact the development team.