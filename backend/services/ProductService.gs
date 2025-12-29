/**
 * Searches for products based on query string
 * Implements caching and server-side filtering
 * @param {string} query - Search query
 * @return {Array} Array of matching products (max 50)
 */
function searchProducts(query) {
  // Check cache first
  const cacheKey = generateSearchCacheKey(query);
  const cachedResults = getCachedData(cacheKey);
  
  if (cachedResults) {
    Logger.log('Returning cached results for query: ' + query);
    return cachedResults;
  }
  
  // Fetch from sheet
  const products = fetchProductsFromSheet(query);
  
  // Cache the results
  setCachedData(cacheKey, products);
  
  return products;
}

/**
 * Fetches products from Google Sheet with filtering
 * @param {string} query - Search query
 * @return {Array} Filtered products
 */
function fetchProductsFromSheet(query) {
  try {
    const sheet = SpreadsheetApp.openById(PRODUCTS_SHEET_ID).getSheetByName(PRODUCTS_SHEET_NAME);
    
    if (!sheet) {
      throw new Error('Products sheet not found');
    }
    
    const data = sheet.getDataRange().getValues();
    
    // Skip header row
    const products = [];
    const queryLower = query ? query.toLowerCase().trim() : "";
    const fetchAll = queryLower === "" || queryLower === "*";
    
    // Safety limit for "all products" to avoid timeouts
    const LIMIT = fetchAll ? 10000 : MAX_SEARCH_RESULTS;

    for (let i = 1; i < data.length && products.length < LIMIT; i++) {
      const row = data[i];
      
      // Skip empty rows
      if (!row[PRODUCT_COLUMNS.ID]) {
        continue;
      }
      
      let match = false;
      if (fetchAll) {
        match = true;
      } else {
         // Search in product_id, product_name, and category
        const productId = String(row[PRODUCT_COLUMNS.ID]).toLowerCase();
        const productName = String(row[PRODUCT_COLUMNS.NAME]).toLowerCase();
        const category = String(row[PRODUCT_COLUMNS.CATEGORY] || '').toLowerCase();
        
        if (productId.includes(queryLower) || 
            productName.includes(queryLower) || 
            category.includes(queryLower)) {
          match = true;
        }
      }
      
      if (match) {
        products.push({
          product_id: row[PRODUCT_COLUMNS.ID],
          product_name: row[PRODUCT_COLUMNS.NAME],
          price: parseFloat(row[PRODUCT_COLUMNS.PRICE]) || 0,
          image_url: row[PRODUCT_COLUMNS.IMAGE_URL] || '',
          category: row[PRODUCT_COLUMNS.CATEGORY] || ''
        });
      }
    }
    
    return products;
  } catch (error) {
    Logger.log('Error fetching products: ' + error.toString());
    throw error;
  }
}
