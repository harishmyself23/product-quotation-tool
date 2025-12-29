/**
 * API Endpoint: Generate Quotation
 * Method: POST
 * Content-Type: application/json
 * 
 * Request body:
 * {
 *   customer_name: "John Doe",
 *   quotation_date: "2025-12-28",
 *   quotation_number: "Q-2025-001",
 *   selected_products: [
 *     {
 *       product_id: "P001",
 *       name: "Laptop XYZ",
 *       price: 999.99,
 *       quantity: 2,
 *       image_url: "https://..."
 *     }
 *   ]
 * }
 * 
 * Response format:
 * {
 *   success: true,
 *   data: {
 *     fileId: "spreadsheet_file_id",
 *     downloadUrl: "https://docs.google.com/spreadsheets/d/.../export?format=xlsx",
 *     fileName: "Quotation_Q-2025-001_1234567890"
 *   }
 * }
 */
function generateQuotationEndpoint(e) {
  try {
    // Parse request body
    const requestData = parseRequestBody(e);
    
    if (!requestData) {
      return createJsonResponse(false, null, 'Invalid request body');
    }
    
    // Validate quotation data
    const validation = validateQuotationData(requestData);
    if (!validation.valid) {
      return createJsonResponse(false, null, validation.error);
    }
    
    // Generate quotation
    const result = generateQuotation(requestData);
    
    return createJsonResponse(true, result);
  } catch (error) {
    Logger.log('Error in generateQuotationEndpoint: ' + error.toString());
    // Return detailed error for debugging
    return createJsonResponse(false, null, 'DEBUG ERROR: ' + error.toString() + ' | Stack: ' + (error.stack || ''));
  }
}
