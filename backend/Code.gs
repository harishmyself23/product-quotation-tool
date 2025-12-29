/**
 * Main entry point for HTTP GET requests
 * Routes requests based on 'action' parameter
 */
function doGet(e) {
  return handleRequest(e);
}

/**
 * Main entry point for HTTP POST requests
 * Routes requests based on 'action' parameter
 */
function doPost(e) {
  return handleRequest(e);
}

/**
 * Central request handler
 * Routes to appropriate API endpoint based on action parameter
 */
function handleRequest(e) {
  try {
    const action = e.parameter.action || '';
    
    switch(action) {
      case 'searchProducts':
        return searchProductsEndpoint(e);
      case 'generateQuotation':
        return generateQuotationEndpoint(e);
      default:
        return createJsonResponse(false, null, 'Invalid action parameter');
    }
  } catch (error) {
    Logger.log('Error in handleRequest: ' + error.toString());
    return createJsonResponse(false, null, 'Internal server error');
  }
}
