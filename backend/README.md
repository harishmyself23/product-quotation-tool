# Google Apps Script Backend API

A clean, minimal, well-structured backend API for product search and quotation generation using Google Sheets as the database.

## 📁 Folder Structure

```
backend/
├── Code.gs                          # Main entry point (doGet/doPost)
├── config/
│   └── Constants.gs                 # Configuration constants
├── api/
│   ├── SearchProductsEndpoint.gs    # Search products endpoint
│   └── GenerateQuotationEndpoint.gs # Generate quotation endpoint
├── services/
│   ├── ProductService.gs            # Product search logic
│   └── QuotationService.gs          # Quotation generation logic
└── utils/
    ├── ResponseHelper.gs            # JSON response utilities
    ├── ValidationHelper.gs          # Input validation
    └── CacheHelper.gs               # Caching utilities
```

## 🚀 Setup Instructions

### 1. Create Google Sheets

#### Products Sheet
Create a Google Sheet named "Products" with the following columns:

| A | B | C | D | E |
|---|---|---|---|---|
| product_id | product_name | price | image_url | category |
| P001 | Laptop XYZ | 999.99 | https://... | Electronics |
| P002 | Mouse ABC | 29.99 | https://... | Accessories |

#### Quotation Template Sheet
Create a Google Sheet template for quotations with:
- Cell B2: Customer Name placeholder
- Cell B3: Quotation Date placeholder
- Cell B4: Quotation Number placeholder
- Row 7+: Product list area with columns:
  - A: Product Image
  - B: Product Name
  - C: Price
  - D: Quantity
  - E: Total

### 2. Deploy Apps Script

1. Open Google Apps Script: https://script.google.com
2. Create a new project
3. Copy all `.gs` files from this backend folder to your Apps Script project
   - **Important**: Apps Script doesn't support folders, so copy the file contents maintaining the modular structure
4. Update `config/Constants.gs`:
   - Replace `YOUR_PRODUCTS_SHEET_ID_HERE` with your Products sheet ID
   - Replace `YOUR_QUOTATION_TEMPLATE_ID_HERE` with your template sheet ID
5. Deploy as Web App:
   - Click "Deploy" > "New deployment"
   - Type: "Web app"
   - Execute as: "Me"
   - Who has access: "Anyone" (for internal use, you can restrict this)
   - Click "Deploy"
   - Copy the Web App URL

### 3. Get Sheet IDs

To get a Google Sheet ID:
- Open the sheet in your browser
- The URL looks like: `https://docs.google.com/spreadsheets/d/SHEET_ID_HERE/edit`
- Copy the `SHEET_ID_HERE` part

## 📡 API Endpoints

### Base URL
```
https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
```

### 1. Search Products

**Method:** GET

**URL:**
```
https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec?action=searchProducts&query=laptop
```

**Parameters:**
- `action`: `searchProducts` (required)
- `query`: Search term (required, 1-100 characters)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "product_id": "P001",
      "product_name": "Laptop XYZ",
      "price": 999.99,
      "image_url": "https://example.com/laptop.jpg",
      "category": "Electronics"
    }
  ]
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Query parameter is required and must be a string"
}
```

### 2. Generate Quotation

**Method:** POST

**URL:**
```
https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec?action=generateQuotation
```

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "customer_name": "John Doe",
  "quotation_date": "2025-12-28",
  "quotation_number": "Q-2025-001",
  "selected_products": [
    {
      "product_id": "P001",
      "name": "Laptop XYZ",
      "price": 999.99,
      "quantity": 2,
      "image_url": "https://example.com/laptop.jpg"
    },
    {
      "product_id": "P002",
      "name": "Mouse ABC",
      "price": 29.99,
      "quantity": 5,
      "image_url": "https://example.com/mouse.jpg"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "fileId": "1abc123def456...",
    "downloadUrl": "https://docs.google.com/spreadsheets/d/1abc123def456.../export?format=xlsx",
    "fileName": "Quotation_Q-2025-001_1735395000000"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "customer_name is required and must be a string"
}
```

## 🧪 Testing the API

### Using cURL

**Search Products:**
```bash
curl "https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec?action=searchProducts&query=laptop"
```

**Generate Quotation:**
```bash
curl -X POST \
  "https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec?action=generateQuotation" \
  -H "Content-Type: application/json" \
  -d '{
    "customer_name": "John Doe",
    "quotation_date": "2025-12-28",
    "quotation_number": "Q-2025-001",
    "selected_products": [
      {
        "product_id": "P001",
        "name": "Laptop XYZ",
        "price": 999.99,
        "quantity": 2,
        "image_url": "https://example.com/laptop.jpg"
      }
    ]
  }'
```

### Using JavaScript (Frontend)

**Search Products:**
```javascript
const searchProducts = async (query) => {
  const url = `https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec?action=searchProducts&query=${encodeURIComponent(query)}`;
  
  const response = await fetch(url);
  const data = await response.json();
  
  if (data.success) {
    console.log('Products:', data.data);
  } else {
    console.error('Error:', data.error);
  }
};
```

**Generate Quotation:**
```javascript
const generateQuotation = async (quotationData) => {
  const url = 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec?action=generateQuotation';
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(quotationData)
  });
  
  const data = await response.json();
  
  if (data.success) {
    console.log('Download URL:', data.data.downloadUrl);
    // Trigger download or open in new tab
    window.open(data.data.downloadUrl, '_blank');
  } else {
    console.error('Error:', data.error);
  }
};
```

## ⚡ Features

### Performance Optimization
- **Caching**: Product searches are cached for 5 minutes using CacheService
- **Server-side filtering**: All filtering happens on the backend
- **Result limiting**: Maximum 50 results per search

### Input Validation
- Query length validation (1-100 characters)
- Required field validation for quotations
- Product data validation (price, quantity, etc.)

### Error Handling
- Consistent error response format
- Detailed error logging
- Graceful failure handling

### Code Quality
- Modular architecture with clear separation of concerns
- Descriptive function names
- Constants defined at the top
- Comprehensive comments explaining WHY, not WHAT
- No hard-coded magic numbers

## 🔧 Customization

### Adjusting Cache Duration
Edit `CACHE_DURATION_SECONDS` in `config/Constants.gs`

### Changing Max Results
Edit `MAX_SEARCH_RESULTS` in `config/Constants.gs`

### Modifying Quotation Template Layout
Update cell positions in `QUOTATION_CELLS` in `config/Constants.gs`

### Adding New Endpoints
1. Create endpoint file in `api/` folder
2. Add validation in `utils/ValidationHelper.gs`
3. Add service logic in `services/` folder
4. Update `handleRequest()` in `Code.gs`

## 📝 Notes

- This is an internal business tool, not a public SaaS
- CORS is enabled by default for all origins
- No authentication is implemented (add if needed)
- All responses are in JSON format
- Images in quotations use Google Sheets IMAGE() formula
- Quotations are exported as Excel (.xlsx) files

## 🐛 Troubleshooting

**"Products sheet not found" error:**
- Verify `PRODUCTS_SHEET_ID` in Constants.gs
- Ensure sheet name is exactly "Products"

**"Template not found" error:**
- Verify `QUOTATION_TEMPLATE_ID` in Constants.gs
- Ensure you have access to the template file

**CORS errors:**
- Redeploy the Web App
- Ensure "Who has access" is set correctly

**Cache not working:**
- Check Apps Script quotas
- Verify CacheService is enabled
