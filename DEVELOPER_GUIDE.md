# KTP Scanner Developer Guide

This guide provides technical information for developers who want to understand, modify, or extend the KTP Scanner application.

## Architecture Overview

The KTP Scanner is a client-side web application built with vanilla JavaScript that uses AWS Textract for OCR processing. The application follows these key architectural principles:

1. **Configuration-driven UI** - Form fields are defined in a configuration file
2. **API mapping** - Automatic mapping between form fields and API formats
3. **Progressive enhancement** - Works without JavaScript, but enhanced with it
4. **Mobile-first design** - Responsive layout optimized for all devices
5. **Progressive Web App (PWA)** - Can be installed as a native-like app

## Project Structure

```
├── index.html              # Main HTML structure
├── styles.css              # CSS styles with responsive design
├── script.js               # Main JavaScript functionality
├── field-config.js         # Dynamic field configuration
├── api-example.js          # Real API integration examples
├── manifest.json           # PWA manifest
└── sw.js                   # Service worker for offline support
```

## Key Components

### 1. KTPScanner Class

The main application logic is encapsulated in the `KTPScanner` class in `script.js`. This class handles:

- File upload and validation
- AWS Textract API integration
- Form generation and management
- Data validation and submission

```javascript
class KTPScanner {
    constructor() {
        this.currentFile = null;
        this.extractedData = {};
        this.fieldConfig = this.getFieldConfiguration();
        this.initializeEventListeners();
        this.generateForm();
    }
    
    // Methods for handling the application logic
    // ...
}
```

### 2. Dynamic Field Configuration

Fields are defined in `field-config.js` using a declarative approach:

```javascript
const KTP_FIELD_CONFIG = {
    nik: {
        label: 'NIK',
        type: 'text',
        placeholder: 'Nomor Induk Kependudukan',
        required: true,
        apiKey: 'nik',
        validation: /^\d{16}$/,
        errorMessage: 'NIK harus 16 digit angka'
    },
    // Other fields...
};
```

This configuration is used to:
- Generate the form UI
- Map between form fields and API data
- Validate user input
- Display appropriate error messages

### 3. AWS Textract Integration

The application includes a mock implementation of AWS Textract integration in `script.js`:

```javascript
async callTextractAPI(base64Image) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock extracted text data
    return this.getMockExtractedData();
}
```

For production, replace this with real AWS Textract integration as shown in `api-example.js`.

## Extending the Application

### Adding New Fields

1. Add the field configuration to `field-config.js`:

```javascript
newField: {
    label: 'New Field Label',
    type: 'text',
    placeholder: 'Placeholder text',
    required: false,
    apiKey: 'new_field_api_key',
    validation: /^[a-zA-Z0-9]+$/,
    errorMessage: 'Invalid format'
}
```

2. Update the mock data in `getMockExtractedData()` to include the new field:

```javascript
getMockExtractedData() {
    return {
        // Existing fields...
        new_field_api_key: 'Sample Value'
    };
}
```

3. If needed, add custom parsing logic for the field in your Textract response handler.

### Customizing the UI

The UI is built using CSS custom properties for easy theming:

```css
:root {
    --primary-color: #4facfe;
    --secondary-color: #00f2fe;
    --success-color: #10b981;
    --error-color: #ef4444;
    --warning-color: #f59e0b;
}
```

To change the appearance:

1. Modify these variables in `styles.css`
2. Add new CSS classes as needed
3. Update the HTML structure in `index.html` or the dynamic form generation in `script.js`

### Implementing Real AWS Textract Integration

Replace the mock implementation with real AWS Textract calls:

#### Option 1: Direct AWS SDK Integration (Frontend)

```javascript
async callTextractAPI(base64Image) {
    const textract = new AWS.Textract();
    
    const params = {
        Document: {
            Bytes: Buffer.from(base64Image, 'base64')
        },
        FeatureTypes: ['FORMS', 'TABLES']
    };
    
    try {
        const result = await textract.analyzeDocument(params).promise();
        return this.parseTextractResponse(result);
    } catch (error) {
        console.error('Textract error:', error);
        throw error;
    }
}

parseTextractResponse(textractResult) {
    // Extract key-value pairs from Textract response
    const extractedData = {};
    
    if (textractResult && textractResult.Blocks) {
        // Implementation of parsing logic
        // This depends on the structure of your KTP
        // and how Textract recognizes the fields
    }
    
    return extractedData;
}
```

#### Option 2: Backend API Integration (Recommended)

```javascript
async callTextractAPI(base64Image) {
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

### Implementing Database Integration

Replace the mock database submission with real API calls:

```javascript
async submitToDatabase(data) {
    const response = await fetch('/api/ktp-data', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify(data)
    });
    
    if (!response.ok) {
        throw new Error('Failed to save data');
    }
    
    return await response.json();
}

getAuthToken() {
    // Implement your authentication logic
    return localStorage.getItem('auth_token');
}
```

## Advanced Customization

### Custom Validation Rules

Add custom validation rules by extending the `validateFormData` method:

```javascript
validateFormData(formData) {
    const errors = [];
    
    Object.entries(this.fieldConfig).forEach(([fieldKey, config]) => {
        const value = formData[fieldKey];
        
        // Check required fields
        if (config.required && (!value || value.trim() === '')) {
            errors.push(`${config.label} wajib diisi`);
        }
        
        // Check validation patterns
        if (value && config.validation && !config.validation.test(value)) {
            errors.push(config.errorMessage || `Format ${config.label} tidak valid`);
        }
        
        // Add custom validation rules
        if (fieldKey === 'customField' && value) {
            // Custom validation logic
            if (!this.validateCustomField(value)) {
                errors.push('Custom validation error message');
            }
        }
    });
    
    return errors;
}

validateCustomField(value) {
    // Implement custom validation logic
    return true; // or false if validation fails
}
```

### Adding New Field Types

To add new field types beyond text, select, and textarea:

1. Update the field configuration:

```javascript
newFieldType: {
    label: 'Custom Field',
    type: 'custom-type',
    // Other properties...
}
```

2. Extend the form generation logic in `generateForm` method:

```javascript
// Create input element based on type
let inputElement;
switch (config.type) {
    case 'select':
        // Existing select logic...
        break;
    case 'textarea':
        // Existing textarea logic...
        break;
    case 'custom-type':
        // Custom field type implementation
        inputElement = document.createElement('div');
        inputElement.className = 'custom-field';
        // Add custom field implementation
        break;
    default:
        // Existing default logic...
}
```

## Performance Optimization

### Image Optimization

For better performance with large images:

```javascript
processFile(file) {
    // Existing validation...
    
    // Compress image before processing
    this.compressImage(file)
        .then(compressedFile => {
            this.currentFile = compressedFile;
            this.displayImagePreview(compressedFile);
            this.enableExtractButton();
        });
}

compressImage(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                // Create canvas for compression
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                // Set target dimensions (max 1200px width)
                const maxWidth = 1200;
                let width = img.width;
                let height = img.height;
                
                if (width > maxWidth) {
                    height = (maxWidth / width) * height;
                    width = maxWidth;
                }
                
                canvas.width = width;
                canvas.height = height;
                
                // Draw and compress
                ctx.drawImage(img, 0, 0, width, height);
                
                // Convert to Blob
                canvas.toBlob((blob) => {
                    resolve(new File([blob], file.name, {
                        type: 'image/jpeg',
                        lastModified: Date.now()
                    }));
                }, 'image/jpeg', 0.8); // 80% quality
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
}
```

### Lazy Loading

Implement lazy loading for better performance:

```javascript
// In the constructor
constructor() {
    // Existing initialization...
    
    // Lazy load non-critical resources
    this.lazyLoadResources();
}

lazyLoadResources() {
    // Lazy load AWS SDK only when needed
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        const script = document.createElement('script');
        script.src = 'https://sdk.amazonaws.com/js/aws-sdk-2.1048.0.min.js';
        script.async = true;
        document.body.appendChild(script);
    }
}
```

## Testing

### Manual Testing Checklist

- [ ] File upload (both click and drag-drop)
- [ ] Image preview and removal
- [ ] Data extraction
- [ ] Form validation
- [ ] Form submission
- [ ] Responsive layout on different devices
- [ ] Offline functionality (PWA)
- [ ] Dark mode support

### Automated Testing

Example of setting up Jest for testing:

```javascript
// test/ktpScanner.test.js
describe('KTPScanner', () => {
    let ktpScanner;
    
    beforeEach(() => {
        document.body.innerHTML = `
            <div id="uploadBox"></div>
            <div id="previewContainer"></div>
            <img id="imagePreview">
            <button id="extractBtn"></button>
            <div id="formSection"></div>
            <form id="ktpForm"></form>
        `;
        
        ktpScanner = new KTPScanner();
    });
    
    test('should initialize with default values', () => {
        expect(ktpScanner.currentFile).toBeNull();
        expect(ktpScanner.extractedData).toEqual({});
        expect(Object.keys(ktpScanner.fieldConfig).length).toBeGreaterThan(0);
    });
    
    test('should validate NIK correctly', () => {
        const validNIK = '1234567890123456';
        const invalidNIK = '12345';
        
        expect(ktpScanner.fieldConfig.nik.validation.test(validNIK)).toBeTruthy();
        expect(ktpScanner.fieldConfig.nik.validation.test(invalidNIK)).toBeFalsy();
    });
    
    // More tests...
});
```

## Deployment

### Production Checklist

1. Replace mock implementations with real API calls
2. Set up proper error handling and logging
3. Implement authentication if needed
4. Configure CORS for API endpoints
5. Optimize assets (minify JS/CSS)
6. Set up HTTPS
7. Configure service worker for offline support
8. Test on multiple browsers and devices

### Hosting Options

1. **Static Hosting**:
   - AWS S3 + CloudFront
   - GitHub Pages
   - Netlify
   - Vercel

2. **Backend Integration**:
   - AWS Lambda + API Gateway
   - Node.js/Express on EC2 or ECS
   - Firebase Functions

## Security Considerations

1. **Never expose AWS credentials in frontend code**
2. **Implement proper authentication**
3. **Validate all user inputs**
4. **Use HTTPS for all API calls**
5. **Implement rate limiting**
6. **Set up proper CORS headers**
7. **Sanitize data before displaying**

## Resources

- [AWS Textract Documentation](https://docs.aws.amazon.com/textract/)
- [AWS SDK for JavaScript](https://docs.aws.amazon.com/sdk-for-javascript/)
- [Web Components](https://developer.mozilla.org/en-US/docs/Web/Web_Components)
- [PWA Documentation](https://web.dev/progressive-web-apps/)