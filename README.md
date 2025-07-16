# KTP OCR Application

This application uses AWS Textract to extract information from Indonesian ID cards (KTP) and populate a form with the extracted data.

## Features

- Upload KTP images or capture using camera
- Extract data using AWS Textract
- Automatically fill form fields with extracted data
- Responsive design for mobile and desktop
- Progressive Web App (PWA) support

## Deployment Instructions

### Prerequisites

- Node.js (v14 or higher)
- AWS account with Textract access
- AWS CLI configured with appropriate permissions

### Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/ktp-ocr.git
cd ktp-ocr
```

### Step 2: Configure Environment Variables

Create a `.env` file in the root directory with the following content:

```
# AWS Configuration
AWS_REGION=ap-southeast-1
AWS_ACCESS_KEY_ID=YOUR_AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY=YOUR_AWS_SECRET_ACCESS_KEY

# Server Configuration
PORT=3001
NODE_ENV=development
```

Replace `YOUR_AWS_ACCESS_KEY_ID` and `YOUR_AWS_SECRET_ACCESS_KEY` with your actual AWS credentials.

### Step 3: Install Dependencies

```bash
npm install express cors body-parser dotenv @aws-sdk/client-textract
```

### Step 4: Start the Server

```bash
node server.js
```

The application will be available at http://localhost:3001

### Step 5: Deploy to EC2 (Optional)

1. Launch an EC2 instance with Amazon Linux 2
2. Install Node.js:
   ```bash
   curl -sL https://rpm.nodesource.com/setup_14.x | sudo bash -
   sudo yum install -y nodejs
   ```
3. Clone the repository and configure as described above
4. Install PM2 for process management:
   ```bash
   npm install -g pm2
   pm2 start server.js
   pm2 startup
   pm2 save
   ```
5. Configure security group to allow inbound traffic on port 3001

## Using the Application

1. Open the application in a web browser
2. Upload a KTP image using the file input or camera
3. Click "Ekstrak Data" to process the image
4. Review and edit the extracted data if needed
5. Submit the form

## AWS IAM Configuration

To use AWS Textract, you need an IAM user with the following permissions:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "textract:AnalyzeDocument",
                "textract:DetectDocumentText"
            ],
            "Resource": "*"
        }
    ]
}
```

## Sample Environment Configuration

```
# AWS Configuration
AWS_REGION=ap-southeast-1
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY

# Server Configuration
PORT=3001
NODE_ENV=development
```

## Project Structure

- `index.html` - Main HTML file
- `styles.css` - CSS styles
- `script.js` - Main application logic
- `api-integration.js` - API integration with AWS Textract
- `textract-parser.js` - Parser for Textract response
- `field-config.js` - Field configuration
- `server.js` - Express server for API endpoints
- `.env` - Environment configuration

## Known Issues

- Double columns may appear in the extracted data display
- Some fields may require manual correction depending on the KTP image quality

## License

MIT
