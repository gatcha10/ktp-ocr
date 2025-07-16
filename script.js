// AWS Textract KTP Scanner - JavaScript Implementation
class KTPScanner {
    constructor() {
        this.currentFile = null;
        this.extractedData = {};
        this.fieldConfig = this.getFieldConfiguration();
        this.initializeEventListeners();
        this.generateForm();
    }

    // Field configuration - easily customizable for API mapping
    getFieldConfiguration() {
        // Use external configuration if available, otherwise use default
        return typeof KTP_FIELD_CONFIG !== 'undefined' ? KTP_FIELD_CONFIG : this.getDefaultFieldConfiguration();
    }

    // Default field configuration (fallback)
    getDefaultFieldConfiguration() {
        return {
            nik: {
                label: 'NIK',
                type: 'text',
                placeholder: 'Nomor Induk Kependudukan',
                required: true,
                apiKey: 'nik', // Key used in API response
                validation: /^\d{16}$/
            },
            nama: {
                label: 'Nama',
                type: 'text',
                placeholder: 'Nama Lengkap',
                required: true,
                apiKey: 'full_name',
                validation: /^[a-zA-Z\s]+$/
            },
            tempatTanggalLahir: {
                label: 'Tempat, Tanggal Lahir',
                type: 'text',
                placeholder: 'Jakarta, 10 Oktober 1990',
                required: true,
                apiKey: 'birth_place_date'
            },
            jenisKelamin: {
                label: 'Jenis Kelamin',
                type: 'select',
                required: true,
                apiKey: 'gender',
                options: [
                    { value: '', text: 'Pilih Jenis Kelamin' },
                    { value: 'LAKI-LAKI', text: 'Laki-laki' },
                    { value: 'PEREMPUAN', text: 'Perempuan' }
                ]
            },
            golDarah: {
                label: 'Golongan Darah',
                type: 'select',
                apiKey: 'blood_type',
                options: [
                    { value: '', text: 'Pilih Golongan Darah' },
                    { value: 'A', text: 'A' },
                    { value: 'B', text: 'B' },
                    { value: 'AB', text: 'AB' },
                    { value: 'O', text: 'O' },
                    { value: '-', text: 'Tidak Diketahui' }
                ]
            },
            alamat: {
                label: 'Alamat',
                type: 'textarea',
                placeholder: 'Alamat Lengkap',
                required: true,
                apiKey: 'address',
                fullWidth: true,
                rows: 3
            },
            rtRw: {
                label: 'RT/RW',
                type: 'text',
                placeholder: '001/004',
                apiKey: 'rt_rw',
                validation: /^\d{3}\/\d{3}$/
            },
            kelDesa: {
                label: 'Kel/Desa',
                type: 'text',
                placeholder: 'Margahayu',
                apiKey: 'village'
            },
            kecamatan: {
                label: 'Kecamatan',
                type: 'text',
                placeholder: 'Bekasi Timur',
                apiKey: 'district'
            },
            agama: {
                label: 'Agama',
                type: 'select',
                apiKey: 'religion',
                options: [
                    { value: '', text: 'Pilih Agama' },
                    { value: 'ISLAM', text: 'Islam' },
                    { value: 'KRISTEN', text: 'Kristen' },
                    { value: 'KATOLIK', text: 'Katolik' },
                    { value: 'HINDU', text: 'Hindu' },
                    { value: 'BUDDHA', text: 'Buddha' },
                    { value: 'KHONGHUCU', text: 'Khonghucu' }
                ]
            },
            statusPerkawinan: {
                label: 'Status Perkawinan',
                type: 'select',
                apiKey: 'marital_status',
                options: [
                    { value: '', text: 'Pilih Status' },
                    { value: 'BELUM KAWIN', text: 'Belum Kawin' },
                    { value: 'KAWIN', text: 'Kawin' },
                    { value: 'CERAI HIDUP', text: 'Cerai Hidup' },
                    { value: 'CERAI MATI', text: 'Cerai Mati' }
                ]
            },
            pekerjaan: {
                label: 'Pekerjaan',
                type: 'text',
                placeholder: 'Karyawan Swasta',
                apiKey: 'occupation'
            },
            kewarganegaraan: {
                label: 'Kewarganegaraan',
                type: 'select',
                apiKey: 'nationality',
                options: [
                    { value: '', text: 'Pilih Kewarganegaraan' },
                    { value: 'WNI', text: 'WNI' },
                    { value: 'WNA', text: 'WNA' }
                ]
            },
            berlakuHingga: {
                label: 'Berlaku Hingga',
                type: 'text',
                placeholder: 'Seumur Hidup',
                apiKey: 'valid_until'
            }
        };
    }

    // Generate form dynamically based on field configuration
    generateForm() {
        const ktpForm = document.getElementById('ktpForm');
        const formGrid = document.createElement('div');
        formGrid.className = 'form-grid';

        Object.entries(this.fieldConfig).forEach(([fieldKey, config]) => {
            const formGroup = document.createElement('div');
            formGroup.className = `form-group${config.fullWidth ? ' full-width' : ''}`;

            // Create label
            const label = document.createElement('label');
            label.setAttribute('for', fieldKey);
            label.textContent = config.label;
            if (config.required) {
                label.innerHTML += ' <span style="color: red;">*</span>';
            }
            formGroup.appendChild(label);

            // Create input element based on type
            let inputElement;
            switch (config.type) {
                case 'select':
                    inputElement = document.createElement('select');
                    config.options.forEach(option => {
                        const optionElement = document.createElement('option');
                        optionElement.value = option.value;
                        optionElement.textContent = option.text;
                        inputElement.appendChild(optionElement);
                    });
                    break;
                case 'textarea':
                    inputElement = document.createElement('textarea');
                    if (config.rows) inputElement.rows = config.rows;
                    break;
                default:
                    inputElement = document.createElement('input');
                    inputElement.type = config.type;
            }

            // Set common attributes
            inputElement.id = fieldKey;
            inputElement.name = fieldKey;
            if (config.placeholder) inputElement.placeholder = config.placeholder;
            if (config.required) inputElement.required = true;

            formGroup.appendChild(inputElement);
            formGrid.appendChild(formGroup);
        });

        // Add form actions
        const formActions = document.createElement('div');
        formActions.className = 'form-actions';
        formActions.innerHTML = `
            <button type="button" class="reset-btn" onclick="ktpScanner.resetForm()">Reset</button>
            <button type="submit" class="submit-btn">
                <span class="btn-text">Simpan Data</span>
                <span class="loading-spinner" style="display: none;">⏳</span>
            </button>
        `;

        ktpForm.appendChild(formGrid);
        ktpForm.appendChild(formActions);
    }

    initializeEventListeners() {
        const fileInput = document.getElementById('fileInput');
        const uploadBox = document.getElementById('uploadBox');
        const ktpForm = document.getElementById('ktpForm');

        // File input change event
        fileInput.addEventListener('change', (e) => this.handleFileSelect(e));

        // Drag and drop events
        uploadBox.addEventListener('dragover', (e) => this.handleDragOver(e));
        uploadBox.addEventListener('drop', (e) => this.handleDrop(e));
        uploadBox.addEventListener('dragleave', (e) => this.handleDragLeave(e));

        // Form submit event
        ktpForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
    }

    handleDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
        document.getElementById('uploadBox').classList.add('drag-over');
    }

    handleDragLeave(e) {
        e.preventDefault();
        e.stopPropagation();
        document.getElementById('uploadBox').classList.remove('drag-over');
    }

    handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        document.getElementById('uploadBox').classList.remove('drag-over');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            this.processFile(files[0]);
        }
    }

    handleFileSelect(e) {
        const file = e.target.files[0];
        if (file) {
            this.processFile(file);
        }
    }

    processFile(file) {
        // Validate file type
        if (!file.type.match(/image\/(jpeg|jpg)/)) {
            this.showToast('Hanya file JPG yang diperbolehkan!', 'error');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            this.showToast('Ukuran file maksimal 5MB!', 'error');
            return;
        }

        this.currentFile = file;
        this.displayImagePreview(file);
        this.enableExtractButton();
    }

    displayImagePreview(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const imagePreview = document.getElementById('imagePreview');
            const previewContainer = document.getElementById('previewContainer');
            const uploadContent = document.querySelector('.upload-content');

            imagePreview.src = e.target.result;
            previewContainer.style.display = 'block';
            uploadContent.style.display = 'none';
        };
        reader.readAsDataURL(file);
    }

    enableExtractButton() {
        const extractBtn = document.getElementById('extractBtn');
        extractBtn.disabled = false;
        extractBtn.classList.add('enabled');
    }

    removeImage() {
        this.currentFile = null;
        const previewContainer = document.getElementById('previewContainer');
        const uploadContent = document.querySelector('.upload-content');
        const extractBtn = document.getElementById('extractBtn');
        const fileInput = document.getElementById('fileInput');

        previewContainer.style.display = 'none';
        uploadContent.style.display = 'block';
        extractBtn.disabled = true;
        extractBtn.classList.remove('enabled');
        fileInput.value = '';

        // Hide form section
        document.getElementById('formSection').style.display = 'none';
    }

    async extractData() {
        if (!this.currentFile) {
            this.showToast('Pilih file terlebih dahulu!', 'error');
            return;
        }

        const extractBtn = document.getElementById('extractBtn');
        const btnText = extractBtn.querySelector('.btn-text');
        const loadingSpinner = extractBtn.querySelector('.loading-spinner');

        // Show loading state
        btnText.style.display = 'none';
        loadingSpinner.style.display = 'inline-block';
        extractBtn.disabled = true;

        try {
            // Convert file to base64
            const base64Image = await this.fileToBase64(this.currentFile);
            
            // Call AWS Textract (simulated for demo - replace with actual AWS SDK call)
            const extractedText = await this.callTextractAPI(base64Image);
            
            // Parse extracted text to fill form fields
            this.parseAndFillForm(extractedText);
            
            // Show form section
            document.getElementById('formSection').style.display = 'block';
            
            this.showToast('Data berhasil diekstrak!', 'success');
            
        } catch (error) {
            console.error('Error extracting data:', error);
            this.showToast('Gagal mengekstrak data. Silakan coba lagi.', 'error');
        } finally {
            // Reset button state
            btnText.style.display = 'inline-block';
            loadingSpinner.style.display = 'none';
            extractBtn.disabled = false;
        }
    }

    fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result.split(',')[1]);
            reader.onerror = error => reject(error);
        });
    }

    async callTextractAPI(base64Image) {
        // This is a simulation of AWS Textract API call
        // In production, you would use AWS SDK or call your backend API
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Mock extracted text data (replace with actual Textract response parsing)
        return this.getMockExtractedData();
    }

    getMockExtractedData() {
        // Mock data for demonstration - replace with actual Textract parsing
        // Using API keys from field configuration for easy mapping
        return {
            nik: '3201234567890123',
            full_name: 'JOHN DOE EXAMPLE',
            birth_place_date: 'JAKARTA, 15 JANUARI 1990',
            gender: 'LAKI-LAKI',
            blood_type: 'A',
            address: 'JL. CONTOH NO. 123 RT 001 RW 004',
            rt_rw: '001/004',
            village: 'MARGAHAYU',
            district: 'BEKASI TIMUR',
            religion: 'ISLAM',
            marital_status: 'KAWIN',
            occupation: 'KARYAWAN SWASTA',
            nationality: 'WNI',
            valid_until: 'SEUMUR HIDUP'
        };
    }

    // Map API response to form fields using field configuration
    mapApiResponseToForm(apiResponse) {
        const formData = {};
        
        Object.entries(this.fieldConfig).forEach(([fieldKey, config]) => {
            const apiKey = config.apiKey;
            if (apiResponse[apiKey] !== undefined) {
                formData[fieldKey] = apiResponse[apiKey];
            }
        });
        
        return formData;
    }

    // Map form data to API format using field configuration
    mapFormDataToApi(formData) {
        const apiData = {};
        
        Object.entries(this.fieldConfig).forEach(([fieldKey, config]) => {
            const apiKey = config.apiKey;
            if (formData[fieldKey] !== undefined && formData[fieldKey] !== '') {
                apiData[apiKey] = formData[fieldKey];
            }
        });
        
        return apiData;
    }

    parseAndFillForm(extractedData) {
        // Map API response to form fields
        const formData = this.mapApiResponseToForm(extractedData);
        
        // Fill form fields with mapped data
        Object.entries(formData).forEach(([fieldKey, value]) => {
            const element = document.getElementById(fieldKey);
            if (element && value) {
                element.value = value;
                
                // Handle select elements - find matching option
                if (element.tagName === 'SELECT') {
                    const option = Array.from(element.options).find(opt => 
                        opt.value.toLowerCase() === value.toLowerCase() ||
                        opt.text.toLowerCase() === value.toLowerCase()
                    );
                    if (option) {
                        element.value = option.value;
                    }
                }
            }
        });
        
        // Store extracted data for later use
        this.extractedData = formData;
    }

    resetForm() {
        const form = document.getElementById('ktpForm');
        form.reset();
        this.extractedData = {};
        this.showToast('Form berhasil direset!', 'info');
    }

    // Validate form data using field configuration
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
                errors.push(`Format ${config.label} tidak valid`);
            }
        });
        
        return errors;
    }

    async handleFormSubmit(e) {
        e.preventDefault();
        
        const submitBtn = e.target.querySelector('.submit-btn');
        const btnText = submitBtn.querySelector('.btn-text');
        const loadingSpinner = submitBtn.querySelector('.loading-spinner');

        // Show loading state
        btnText.style.display = 'none';
        loadingSpinner.style.display = 'inline-block';
        submitBtn.disabled = true;

        try {
            // Collect form data
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData.entries());
            
            // Validate form data
            const validationErrors = this.validateFormData(data);
            if (validationErrors.length > 0) {
                throw new Error(validationErrors.join(', '));
            }

            // Map form data to API format
            const apiData = this.mapFormDataToApi(data);

            // Submit to database (replace with actual API call)
            await this.submitToDatabase(apiData);
            
            this.showToast('Data berhasil disimpan!', 'success');
            
            // Reset form after successful submission
            setTimeout(() => {
                this.resetAll();
            }, 2000);
            
        } catch (error) {
            console.error('Error submitting data:', error);
            this.showToast(error.message || 'Gagal menyimpan data. Silakan coba lagi.', 'error');
        } finally {
            // Reset button state
            btnText.style.display = 'inline-block';
            loadingSpinner.style.display = 'none';
            submitBtn.disabled = false;
        }
    }

    validateFormData(data) {
        const requiredFields = ['nik', 'nama', 'tempatTanggalLahir', 'jenisKelamin', 'alamat'];
        
        for (const field of requiredFields) {
            if (!data[field] || data[field].trim() === '') {
                return false;
            }
        }
        
        // Validate NIK format (16 digits)
        if (!/^\d{16}$/.test(data.nik)) {
            throw new Error('NIK harus terdiri dari 16 digit angka');
        }
        
        return true;
    }

    async submitToDatabase(data) {
        // Simulate database submission
        // Replace this with actual API call to your backend
        
        console.log('Submitting data to database:', data);
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Simulate success (in production, handle actual API response)
        return { success: true, id: Date.now() };
    }

    resetAll() {
        this.removeImage();
        this.resetForm();
        document.getElementById('formSection').style.display = 'none';
    }

    showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.className = `toast ${type} show`;
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
}

// Global functions for HTML onclick events
function removeImage() {
    ktpScanner.removeImage();
}

function extractData() {
    ktpScanner.extractData();
}

function resetForm() {
    ktpScanner.resetForm();
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.ktpScanner = new KTPScanner();
});

// Service Worker registration for PWA support (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

// Initialize the KTP Scanner when DOM is loaded
let ktpScanner;
document.addEventListener('DOMContentLoaded', () => {
    ktpScanner = new KTPScanner();
});
