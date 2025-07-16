# KTP Scanner Configuration Guide

## Overview

The KTP Scanner now uses a dynamic field configuration system that makes it easy to:
- Add, remove, or modify form fields
- Map fields to your API response/request format
- Add validation rules
- Customize field types and options

## Field Configuration

All fields are defined in `field-config.js`. Each field has the following properties:

### Basic Properties
- `label`: Display name for the field
- `type`: Input type (`text`, `select`, `textarea`)
- `placeholder`: Placeholder text
- `required`: Whether the field is mandatory
- `apiKey`: Key used in API requests/responses

### Advanced Properties
- `validation`: Regular expression for validation
- `errorMessage`: Custom error message for validation
- `options`: Array of options for select fields
- `fullWidth`: Whether field spans full width
- `rows`: Number of rows for textarea

## Example Field Configuration

```javascript
fieldName: {
    label: 'Field Label',
    type: 'text',
    placeholder: 'Enter value...',
    required: true,
    apiKey: 'api_field_name',
    validation: /^[A-Z0-9]+$/,
    errorMessage: 'Only uppercase letters and numbers allowed'
}
```

## API Mapping

The system automatically maps between form fields and API format:

### Form to API (when submitting)
```javascript
// Form data
{ nik: '1234567890123456', nama: 'John Doe' }

// Becomes API data
{ nik: '1234567890123456', full_name: 'John Doe' }
```

### API to Form (when extracting)
```javascript
// API response
{ nik: '1234567890123456', full_name: 'John Doe' }

// Fills form fields
{ nik: '1234567890123456', nama: 'John Doe' }
```

## Adding New Fields

1. Open `field-config.js`
2. Add your field configuration:

```javascript
newField: {
    label: 'New Field',
    type: 'text',
    placeholder: 'Enter new field...',
    required: false,
    apiKey: 'new_field_api_key'
}
```

3. The form will automatically include the new field

## Field Types

### Text Input
```javascript
{
    type: 'text',
    placeholder: 'Enter text...',
    validation: /^[A-Za-z\s]+$/ // Optional regex validation
}
```

### Select Dropdown
```javascript
{
    type: 'select',
    options: [
        { value: '', text: 'Choose option...' },
        { value: 'option1', text: 'Option 1' },
        { value: 'option2', text: 'Option 2' }
    ]
}
```

### Textarea
```javascript
{
    type: 'textarea',
    rows: 3,
    fullWidth: true // Spans full width of form
}
```

## Validation

Add validation rules to ensure data quality:

```javascript
{
    validation: /^\d{16}$/, // 16 digits only
    errorMessage: 'Must be exactly 16 digits'
}
```

## API Integration

### Mock Data (Development)
The system includes mock data for testing. Update `getMockExtractedData()` in `script.js` to match your field configuration.

### Real API Integration
1. Replace `callTextractAPI()` method with actual AWS Textract call
2. Replace `submitToDatabase()` method with your database API
3. See `api-example.js` for implementation examples

## Customization Examples

### Adding Phone Number Field
```javascript
telepon: {
    label: 'Nomor Telepon',
    type: 'text',
    placeholder: '08123456789',
    required: false,
    apiKey: 'phone_number',
    validation: /^08\d{8,11}$/,
    errorMessage: 'Format: 08xxxxxxxxx'
}
```

### Adding Province Dropdown
```javascript
provinsi: {
    label: 'Provinsi',
    type: 'select',
    required: true,
    apiKey: 'province',
    options: [
        { value: '', text: 'Pilih Provinsi' },
        { value: 'DKI_JAKARTA', text: 'DKI Jakarta' },
        { value: 'JAWA_BARAT', text: 'Jawa Barat' },
        { value: 'JAWA_TENGAH', text: 'Jawa Tengah' }
    ]
}
```

## Best Practices

1. **API Keys**: Use snake_case for API keys to match common API conventions
2. **Validation**: Add validation for critical fields like NIK, phone numbers
3. **Required Fields**: Mark essential fields as required
4. **User Experience**: Use clear labels and helpful placeholders
5. **Error Messages**: Provide specific error messages for validation failures

## Testing

After making changes:
1. Test form generation
2. Test data extraction and mapping
3. Test form validation
4. Test API submission format

The dynamic system ensures your changes are immediately reflected in the UI without modifying HTML or complex JavaScript code.
