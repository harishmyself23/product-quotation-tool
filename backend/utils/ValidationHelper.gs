/**
 * Validates search query parameter
 * @param {string} query - Search query to validate
 * @return {Object} { valid: boolean, error: string }
 */
function validateSearchQuery(query) {
  if (!query || typeof query !== 'string') {
    return { valid: false, error: 'Query parameter is required and must be a string' };
  }
  
  if (query.trim().length === 0) {
    return { valid: false, error: 'Query cannot be empty' };
  }
  
  if (query.length > 100) {
    return { valid: false, error: 'Query is too long (max 100 characters)' };
  }
  
  return { valid: true };
}

/**
 * Validates quotation data
 * @param {Object} data - Quotation data to validate
 * @return {Object} { valid: boolean, error: string }
 */
function validateQuotationData(data) {
  if (!data) {
    return { valid: false, error: 'Request body is required' };
  }
  
  // Check required fields
  if (!data.customer_name || typeof data.customer_name !== 'string') {
    return { valid: false, error: 'customer_name is required and must be a string' };
  }
  
  if (!data.quotation_date || typeof data.quotation_date !== 'string') {
    return { valid: false, error: 'quotation_date is required and must be a string' };
  }
  
  if (!data.quotation_number || typeof data.quotation_number !== 'string') {
    return { valid: false, error: 'quotation_number is required and must be a string' };
  }
  
  if (!data.selected_products || !Array.isArray(data.selected_products)) {
    return { valid: false, error: 'selected_products is required and must be an array' };
  }
  
  if (data.selected_products.length === 0) {
    return { valid: false, error: 'selected_products cannot be empty' };
  }
  
  // Validate each product
  for (let i = 0; i < data.selected_products.length; i++) {
    const product = data.selected_products[i];
    
    if (!product.product_id) {
      return { valid: false, error: `Product at index ${i} is missing product_id` };
    }
    
    if (!product.name) {
      return { valid: false, error: `Product at index ${i} is missing name` };
    }
    
    if (typeof product.price !== 'number') {
      return { valid: false, error: `Product at index ${i} has invalid price` };
    }
    
    if (typeof product.quantity !== 'number' || product.quantity <= 0) {
      return { valid: false, error: `Product at index ${i} has invalid quantity` };
    }
  }
  
  return { valid: true };
}
