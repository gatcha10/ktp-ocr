# 🆔 KTP Scanner - AWS Textract Frontend

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow.svg)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![AWS Textract](https://img.shields.io/badge/AWS-Textract-orange.svg)](https://aws.amazon.com/textract/)

A modern, responsive web application for scanning Indonesian ID cards (KTP) using AWS Textract with dynamic field configuration system.

## 🚀 Features

- 📱 **Mobile-First Design** - Optimized for mobile devices and desktop
- 🖼️ **Drag & Drop Upload** - Easy file upload with drag and drop support
- 🔍 **AWS Textract Integration** - Automatic text extraction from KTP images
- ⚙️ **Dynamic Field Configuration** - Easily customizable form fields and API mapping
- ✏️ **Editable Results** - Review and edit extracted data before submission
- 💾 **Database Integration** - Submit processed data to your backend
- 🌙 **Dark Mode Support** - Automatic dark mode based on system preference
- 📱 **PWA Support** - Can be installed as a mobile app

## 🏗️ Architecture

### File Structure
```
├── index.html              # Main HTML file
├── styles.css              # CSS styles with responsive design
├── script.js               # Main JavaScript functionality
├── field-config.js         # Dynamic field configuration
├── api-example.js          # Real API integration examples
├── manifest.json           # PWA manifest
└── sw.js                   # Service worker for offline support
```

## Quick Start

### Method 1: Simple File Opening
```bash
open index.html
```

### Method 2: Local Web Server (Recommended)
```bash
# Using Python
python3 -m http.server 8000

# Using Node.js
npx http-server

# Using PHP
php -S localhost:8000
```

Then open `http://localhost:8000` in your browser.

## AWS Integration

Replace mock implementation with real AWS Textract:

```javascript
async function callTextractAPI(base64Image) {
    const response = await fetch('/api/textract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64Image })
    });
    return await response.json();
}
```

## Customization

Add new fields in `field-config.js`:

```javascript
newField: {
    label: 'New Field',
    type: 'text',
    required: false,
    apiKey: 'new_field_api_key'
}
```

## Browser Support

- Chrome/Edge 80+
- Firefox 75+
- Safari 13+
- Mobile browsers

## License

MIT License