# Deployment Guide

## Step-by-Step Deployment Process

### Phase 1: Prepare Google Sheets

#### 1.1 Create Products Sheet
1. Go to https://sheets.google.com
2. Create a new spreadsheet
3. Name it "Products Database" (or any name you prefer)
4. Rename the first sheet to "Products"
5. Add headers in row 1:
   - A1: `product_id`
   - B1: `product_name`
   - C1: `price`
   - D1: `image_url`
   - E1: `category`
6. Add sample data (at least 5-10 products for testing)
7. Copy the Sheet ID from the URL (between `/d/` and `/edit`)

#### 1.2 Create Quotation Template
1. Create another new spreadsheet
2. Name it "Quotation Template"
3. Design your quotation layout:
   ```
   Row 1: [Your Company Logo/Header]
   Row 2: Customer Name: [B2]
   Row 3: Date: [B3]
   Row 4: Quotation #: [B4]
   Row 5: [Empty]
   Row 6: [Headers] Image | Product Name | Price | Qty | Total
   Row 7+: [Product rows start here]
   ```
4. Format the template as desired (borders, colors, fonts)
5. Copy the Sheet ID from the URL

### Phase 2: Deploy Apps Script

#### 2.1 Create Apps Script Project
1. Go to https://script.google.com
2. Click "New Project"
3. Name it "Product Quotation API"

#### 2.2 Add Script Files
Since Apps Script doesn't support folders in the UI, you'll add all files as separate script files:

1. **Delete** the default `Code.gs` file
2. **Create new script files** for each module:
   - Click the `+` next to "Files"
   - Select "Script"
   - Name it (e.g., "Code")
   - Paste the content from the corresponding `.gs` file

**Files to create (in this order):**
1. `Constants` - Copy content from `backend/config/Constants.gs`
2. `ResponseHelper` - Copy content from `backend/utils/ResponseHelper.gs`
3. `ValidationHelper` - Copy content from `backend/utils/ValidationHelper.gs`
4. `CacheHelper` - Copy content from `backend/utils/CacheHelper.gs`
5. `ProductService` - Copy content from `backend/services/ProductService.gs`
6. `QuotationService` - Copy content from `backend/services/QuotationService.gs`
7. `SearchProductsEndpoint` - Copy content from `backend/api/SearchProductsEndpoint.gs`
8. `GenerateQuotationEndpoint` - Copy content from `backend/api/GenerateQuotationEndpoint.gs`
9. `Code` - Copy content from `backend/Code.gs`

#### 2.3 Update Configuration
1. Open the `Constants` file
2. Replace the placeholder values:
   ```javascript
   const PRODUCTS_SHEET_ID = 'YOUR_ACTUAL_PRODUCTS_SHEET_ID';
   const QUOTATION_TEMPLATE_ID = 'YOUR_ACTUAL_TEMPLATE_SHEET_ID';
   ```
3. Save the file (Ctrl+S or Cmd+S)

#### 2.4 Test the Functions
1. Select the `Code` file
2. Select `doGet` function from the dropdown
3. Click "Run" to test (you may need to authorize the script)
4. Grant necessary permissions when prompted

#### 2.5 Deploy as Web App
1. Click "Deploy" > "New deployment"
2. Click the gear icon ⚙️ next to "Select type"
3. Choose "Web app"
4. Configure:
   - **Description**: "Product Quotation API v1"
   - **Execute as**: "Me (your@email.com)"
   - **Who has access**: "Anyone" (for internal use within organization)
5. Click "Deploy"
6. **Copy the Web App URL** - you'll need this for the frontend
7. Click "Done"

### Phase 3: Test the API

#### 3.1 Test Search Endpoint
Open your browser and navigate to:
```
YOUR_WEB_APP_URL?action=searchProducts&query=test
```

Expected response:
```json
{
  "success": true,
  "data": [...]
}
```

#### 3.2 Test Quotation Endpoint
Use a tool like Postman or cURL:

```bash
curl -X POST "YOUR_WEB_APP_URL?action=generateQuotation" \
  -H "Content-Type: application/json" \
  -d '{
    "customer_name": "Test Customer",
    "quotation_date": "2025-12-28",
    "quotation_number": "Q-TEST-001",
    "selected_products": [
      {
        "product_id": "P001",
        "name": "Test Product",
        "price": 100,
        "quantity": 2,
        "image_url": "https://via.placeholder.com/100"
      }
    ]
  }'
```

### Phase 4: Frontend Integration

#### 4.1 Save the Web App URL
Create a `.env.local` file in your Next.js project:
```
NEXT_PUBLIC_API_URL=YOUR_WEB_APP_URL
```

#### 4.2 Create API Client
```javascript
// lib/api.js
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const searchProducts = async (query) => {
  const response = await fetch(
    `${API_URL}?action=searchProducts&query=${encodeURIComponent(query)}`
  );
  return response.json();
};

export const generateQuotation = async (data) => {
  const response = await fetch(
    `${API_URL}?action=generateQuotation`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }
  );
  return response.json();
};
```

### Phase 5: Maintenance

#### Updating the API
1. Make changes to the script files
2. Save all changes
3. Click "Deploy" > "Manage deployments"
4. Click the edit icon ✏️ next to your deployment
5. Change "Version" to "New version"
6. Add description of changes
7. Click "Deploy"

#### Monitoring
1. Go to "Executions" in the left sidebar
2. View logs and errors
3. Use `Logger.log()` for debugging

#### Quotas
Apps Script has daily quotas:
- URL Fetch calls: 20,000/day
- Script runtime: 6 min/execution
- Triggers: 90 min/day

For high-traffic applications, consider:
- Implementing rate limiting
- Using a different backend solution
- Upgrading to Google Workspace if needed

## Security Considerations

### For Internal Use
- Set "Who has access" to "Anyone with the link"
- Share the URL only with authorized users
- Keep Sheet IDs confidential

### For Production
- Implement API key authentication
- Add IP whitelisting if possible
- Use Google Workspace domain restrictions
- Add request logging and monitoring

## Troubleshooting

### "Authorization required" error
- Re-run the script and grant permissions
- Check if you have access to both sheets

### "Sheet not found" error
- Verify Sheet IDs in Constants.gs
- Ensure sheet names match exactly

### "Quota exceeded" error
- Check Apps Script quotas dashboard
- Implement caching (already included)
- Reduce API call frequency

### CORS errors
- Ensure deployment is set to "Anyone"
- Try redeploying the Web App
- Clear browser cache

## Next Steps

1. ✅ Deploy backend
2. ✅ Test endpoints
### Phase 6: Frontend Deployment to Vercel (Quickest Free Way)

Since you want a "quick and free" way and might not want to set up Git immediately, **Vercel** (the creators of Next.js) is the best option.

#### 6.1 Install & Deploy using Vercel CLI
Since you are on Windows and looking for the fastest route:

1.  **Open your terminal** (PowerShell) inside `F:\Custom Project\frontend`.
2.  Run the deployment command:
    ```powershell
    npx vercel
    ```
    *(Note: If it asks to install the 'vercel' package, type `y` and Enter)*

3.  **Follow the Setup Prompts**:
    - **Log in**: It will ask you to log in (Email, GitHub, etc). Choose Email if you don't have GitHub.
    - **Set up and deploy?**: `y`
    - **Which scope?**: Press Enter (select your account).
    - **Link to existing project?**: `n`
    - **Project Name**: Press Enter (defaults to `frontend` or type `quotation-tool`).
    - **In which directory?**: `.` (Press Enter).
    - **Want to modify... settings?**: `n` (We will set the Environment Variable in the dashboard, it's easier).

4.  **Wait for build**: It will take a minute or two.
5.  **Result**: It will give you a **Production** (or Preview) URL like `https://quotation-tool-xyz.vercel.app`.

#### 6.2 Configure Environment Variable (Crucial Step)
Your deployed site won't work yet because it doesn't know your Google backend URL.

1.  Go to the **Environment** link provided in the terminal output (or go to [vercel.com/dashboard](https://vercel.com/dashboard)).
2.  Select your project (`quotation-tool`).
3.  Click **Settings** (top tab) -> **Environment Variables** (left sidebar).
4.  Add a new variable:
    - **Key**: `NEXT_PUBLIC_API_URL`
    - **Value**: Your Google Web App URL (the one running `https://script.google.com/macros/s/...`)
5.  Click **Save**.

#### 6.3 Redeploy for Changes to Take Effect
Environmental variables only apply on a *new* deployment.

1.  Back in your terminal (inside `frontend` folder), run:
    ```powershell
    npx vercel --prod
    ```
2.  Wait for completion.
3.  **Done!** Your app is now live at the URL provided. You can open it on your phone, laptop, or share it with colleagues.

### Troubleshoot Vercel Error
If you see "Command not found", make sure you have Node.js installed (which you do).
If you see permission errors, try running PowerShell as Administrator.
