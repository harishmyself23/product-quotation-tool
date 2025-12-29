/**
 * Creates a standardized JSON response
 * @param {boolean} success - Whether the operation was successful
 * @param {*} data - Data to return (optional)
 * @param {string} error - Error message (optional)
 * @return {ContentService.TextOutput} JSON response
 */
function createJsonResponse(success, data, error) {
  const response = {
    success: success
  };
  
  if (data !== null && data !== undefined) {
    response.data = data;
  }
  
  if (error) {
    response.error = error;
  }
  
  return ContentService
    .createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Parses JSON from POST request body
 * @param {Object} e - Event object from doPost
 * @return {Object} Parsed JSON object or null
 */
function parseRequestBody(e) {
  try {
    if (e.postData && e.postData.contents) {
      return JSON.parse(e.postData.contents);
    }
    return null;
  } catch (error) {
    Logger.log('Error parsing request body: ' + error.toString());
    return null;
  }
}
