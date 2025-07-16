// AWS Textract Parser for KTP (Indonesian ID Card)
// This file handles parsing the raw AWS Textract response into structured data

class TextractKTPParser {
    constructor() {
        // Define field mappings from Textract key-value pairs to our application fields
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
    }

    /**
     * Parse AWS Textract response into structured KTP data
     * @param {Object} textractResponse - Raw AWS Textract response
     * @returns {Object} - Structured KTP data
     */
    parseTextractResponse(textractResponse) {
        // Initialize result object
        const result = {};
        
        try {
            // Extract key-value pairs from Textract response
            const keyValuePairs = this.extractKeyValuePairs(textractResponse);
            
            // Map extracted key-value pairs to our application fields
            Object.entries(keyValuePairs).forEach(([key, value]) => {
                const mappedField = this.fieldMappings[key];
                if (mappedField) {
                    result[mappedField] = value;
                }
            });
            
            // Handle special cases and formatting
            this.handleSpecialCases(result);
            
        } catch (error) {
            console.error('Error parsing Textract response:', error);
        }
        
        return result;
    }

    /**
     * Extract key-value pairs from Textract response
     * @param {Object} textractResponse - Raw AWS Textract response
     * @returns {Object} - Extracted key-value pairs
     */
    extractKeyValuePairs(textractResponse) {
        const keyValuePairs = {};
        
        // Check if response has blocks
        if (!textractResponse.Blocks || !Array.isArray(textractResponse.Blocks)) {
            return keyValuePairs;
        }
        
        // Get all KEY_VALUE_SET blocks
        const keyValueSets = textractResponse.Blocks.filter(block => 
            block.BlockType === 'KEY_VALUE_SET'
        );
        
        // Process each KEY_VALUE_SET block
        keyValueSets.forEach(keyValueSet => {
            // Skip if no relationships
            if (!keyValueSet.Relationships || !keyValueSet.Relationships.length) {
                return;
            }
            
            // Check if this is a KEY block
            const isKeyBlock = keyValueSet.EntityTypes && 
                keyValueSet.EntityTypes.includes('KEY');
            
            if (isKeyBlock) {
                // Get the key text
                const keyText = this.getTextFromBlock(keyValueSet, textractResponse);
                
                // Find the corresponding VALUE block
                const valueRelationship = keyValueSet.Relationships.find(rel => 
                    rel.Type === 'VALUE'
                );
                
                if (valueRelationship && valueRelationship.Ids && valueRelationship.Ids.length) {
                    const valueBlockId = valueRelationship.Ids[0];
                    const valueBlock = textractResponse.Blocks.find(block => 
                        block.Id === valueBlockId
                    );
                    
                    if (valueBlock) {
                        // Get the value text
                        const valueText = this.getTextFromBlock(valueBlock, textractResponse);
                        
                        // Store the key-value pair
                        if (keyText && valueText) {
                            keyValuePairs[keyText.trim()] = valueText.trim();
                        }
                    }
                }
            }
        });
        
        return keyValuePairs;
    }

    /**
     * Get text from a block by following its child relationships
     * @param {Object} block - Textract block
     * @param {Object} textractResponse - Full Textract response
     * @returns {String} - Extracted text
     */
    getTextFromBlock(block, textractResponse) {
        // If block has text, return it directly
        if (block.Text) {
            return block.Text;
        }
        
        // If block has child relationships, get text from children
        if (block.Relationships) {
            const childRelationship = block.Relationships.find(rel => 
                rel.Type === 'CHILD'
            );
            
            if (childRelationship && childRelationship.Ids && childRelationship.Ids.length) {
                // Get all child blocks
                const childBlocks = childRelationship.Ids.map(id => 
                    textractResponse.Blocks.find(block => block.Id === id)
                ).filter(block => block !== undefined);
                
                // Extract text from child blocks and join
                return childBlocks
                    .filter(block => block.Text)
                    .map(block => block.Text)
                    .join(' ');
            }
        }
        
        return '';
    }

    /**
     * Handle special cases and formatting for specific fields
     * @param {Object} result - Parsed result object
     */
    handleSpecialCases(result) {
        // Remove colon from values if present
        Object.keys(result).forEach(key => {
            if (typeof result[key] === 'string' && result[key].startsWith(':')) {
                result[key] = result[key].substring(1).trim();
            }
        });
        
        // Format RT/RW if needed
        if (result.rt_rw && !result.rt_rw.includes('/')) {
            // Try to format as 000/000
            const digits = result.rt_rw.replace(/\D/g, '');
            if (digits.length >= 6) {
                result.rt_rw = `${digits.substring(0, 3)}/${digits.substring(3, 6)}`;
            }
        }
        
        // Combine address parts if needed
        if (result.address) {
            // Remove RT/RW from address if it's already a separate field
            if (result.rt_rw) {
                result.address = result.address.replace(/RT\s*\/?\s*RW\s*:?\s*\d+\s*\/\s*\d+/i, '').trim();
            }
        }
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TextractKTPParser;
}
