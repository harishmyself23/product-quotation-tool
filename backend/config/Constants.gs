/**
 * Configuration constants for the application
 * Update these values according to your Google Sheets setup
 */

// Sheet IDs - REPLACE WITH YOUR ACTUAL SHEET IDs
const PRODUCTS_SHEET_ID = '1RHd7aFjxxy8i_6NNkvDBaRihG0uHfoUSDOw49rxzZDQ';
const QUOTATION_TEMPLATE_ID = '1DYrTzRdaTnhPjOLTo6CSDzvi9psnZZJXt6TnJuPjHQ0';

// Sheet names
const PRODUCTS_SHEET_NAME = 'Products';
const QUOTATIONS_FOLDER_NAME = 'Generated Quotations';

// Product columns (0-indexed)
const PRODUCT_COLUMNS = {
  ID: 0,
  NAME: 1,
  PRICE: 2,
  IMAGE_URL: 3,
  CATEGORY: 4
};

// Quotation template cell positions
const QUOTATION_CELLS = {
  // B1-B5 are Company Details
  // Adjusted locations (Please verify these suit your layout)
  CUSTOMER_NAME: 'D6',       // Placeholder - Update to where you want Customer Name
  QUOTATION_DATE: 'F3',      // As requested
  QUOTATION_NUMBER: 'F4',    // Placeholder - Update if needed
  
  // Product Table
  PRODUCTS_START_ROW: 9,     // Row 7 has headings, Data starts at 8
  
  // Column Indices (1-based for Apps Script)
  COL_SR_NO: 2,    // B
  COL_NAME: 3,     // C
  COL_IMAGE: 4,    // D
  COL_UOM: 5,      // E
  COL_RATE: 6,     // F
  COL_GST: 7       // G
};

// Business rules
const MAX_SEARCH_RESULTS = 50;
const CACHE_DURATION_SECONDS = 300; // 5 minutes

// Image settings for quotations
// Image settings for quotations
// Image settings for quotations
const ROW_HEIGHT = 120;      // Height of the row
const IMG_COL_WIDTH = 180;   // Make column wider than height
const IMAGE_SIZE = 100;      // Actual image size (square)

// Calculate centering offsets
// Offset X = (180 - 100) / 2 = 40
const OFFSET_X = Math.floor((IMG_COL_WIDTH - IMAGE_SIZE) / 2);
// Offset Y = (120 - 100) / 2 = 10
const OFFSET_Y = Math.floor((ROW_HEIGHT - IMAGE_SIZE) / 2);
