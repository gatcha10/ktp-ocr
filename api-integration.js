// API Integration for KTP OCR
class APIIntegration {
    constructor() {
        this.baseURL = window.location.origin;
        this.parser = new TextractKTPParser();
    }

    // Call Textract API to analyze KTP image
    async callTextractAPI(base64Image) {
        try {
            console.log('Calling Textract API...');
            
            const response = await fetch(this.baseURL + '/api/textract/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    image: base64Image,
                    document_type: 'ktp',
                    features: ['FORMS', 'TABLES']
                })
            });

            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.message || 'Failed to analyze document');
            }

            console.log('Textract API response received');
            
            // Parse the Textract response to extract KTP data
            const ktpData = this.parser.parseTextractResponse(result.textractResponse);
            
            return {
                success: true,
                data: ktpData,
                rawResponse: result.textractResponse
            };

        } catch (error) {
            console.error('Textract API Error:', error);
            throw new Error('API Error: ' + error.message);
        }
    }

    // Save KTP data to backend
    async saveKTPData(ktpData) {
        try {
            console.log('Saving KTP data...');
            
            const response = await fetch(this.baseURL + '/api/ktp-data', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(ktpData)
            });

            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.message || 'Failed to save data');
            }

            console.log('KTP data saved successfully');
            return result;

        } catch (error) {
            console.error('Save Data Error:', error);
            throw new Error('Save Error: ' + error.message);
        }
    }
}

// Initialize the API integration
const apiIntegration = new APIIntegration();
