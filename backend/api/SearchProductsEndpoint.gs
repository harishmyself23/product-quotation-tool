/**
 * API Endpoint: Search Products
 * URL Parameter: query (required)
 * Method: GET
 * 
 * Example: ?action=searchProducts&query=laptop
 * 
 * Response format:
 * {
 *   success: true,
 *   data: [
 *     {
 *       product_id: "P001",
 *       product_name: "Laptop XYZ",
 *       price: 999.99,
 *       image_url: "https://...",
 *       category: "Electronics"
 *     }
 *   ]
 * }
 */
function searchProductsEndpoint(e) {
  try {
    const query = e.parameter.query || '';
    
    // Validate input
    const validation = validateSearchQuery(query);
    if (!validation.valid) {
      return createJsonResponse(false, null, validation.error);
    }
    
    // Search products
    const products = searchProducts(query);
    
    return createJsonResponse(true, products);
  } catch (error) {
    Logger.log('Error in searchProductsEndpoint: ' + error.toString());
    return createJsonResponse(false, null, 'Failed to search products');
  }
}
