/**
 * Generates a quotation from template
 * @param {Object} quotationData - Quotation data including customer info and products
 * @return {Object} { fileId: string, downloadUrl: string }
 */
function generateQuotation(quotationData) {
  try {
    // Get or create the folder for quotations
    const folder = getOrCreateQuotationFolder();
    
    // Copy the template to the specific folder
    const templateFile = DriveApp.getFileById(QUOTATION_TEMPLATE_ID);
    const newFileName = `Quotation_${quotationData.quotation_number}_${new Date().getTime()}`;
    const copiedFile = templateFile.makeCopy(newFileName, folder);
    const newSpreadsheet = SpreadsheetApp.openById(copiedFile.getId());
    const sheet = newSpreadsheet.getSheets()[0];
    
    // Fill customer information
    sheet.getRange(QUOTATION_CELLS.CUSTOMER_NAME).setValue(quotationData.customer_name);
    sheet.getRange(QUOTATION_CELLS.QUOTATION_DATE).setValue(quotationData.quotation_date);
    sheet.getRange(QUOTATION_CELLS.QUOTATION_NUMBER).setValue(quotationData.quotation_number);
    
    // Insert products
    insertProductsIntoQuotation(sheet, quotationData.selected_products);
    
    // ✅ ADDITION: Insert Terms & Conditions after products
    insertTermsAndConditions(
      sheet,
      QUOTATION_CELLS.PRODUCTS_START_ROW,
      quotationData.selected_products.length
    );
    
    // Save changes
    SpreadsheetApp.flush();
    
    // Generate download URL
    
    // PERMISSION UPDATE: Make file accessible to anyone with the link
    // This allows the download link to work without logging in
    copiedFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    const downloadUrl = generateExcelDownloadUrl(copiedFile.getId());
    
    return {
      fileId: copiedFile.getId(),
      downloadUrl: downloadUrl,
      fileName: newFileName
    };
  } catch (error) {
    Logger.log('Error generating quotation: ' + error.toString());
    throw error;
  }
}

/**
 * Inserts products into quotation sheet
 * @param {Sheet} sheet - Target sheet
 * @param {Array} products - Array of products to insert
 */
function insertProductsIntoQuotation(sheet, products) {
  // Set consistent column width and row height
  // Image Column is now COL_IMAGE (4)
  sheet.setColumnWidth(QUOTATION_CELLS.COL_IMAGE, IMG_COL_WIDTH);
  
  let currentRow = QUOTATION_CELLS.PRODUCTS_START_ROW;
  
  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    
    // Set row height
    sheet.setRowHeight(currentRow, ROW_HEIGHT);
    
    // 1. Sr No
    sheet.getRange(currentRow, QUOTATION_CELLS.COL_SR_NO).setValue(i + 1);
    
    // 2. Item Name
    sheet.getRange(currentRow, QUOTATION_CELLS.COL_NAME)
      .setValue(product.name)
      .setWrapStrategy(SpreadsheetApp.WrapStrategy.WRAP);
    
    // 3. IMAGE
    if (product.image_url) {
      try {
        const image = sheet.insertImage(
          product.image_url, 
          QUOTATION_CELLS.COL_IMAGE,  // Column Index
          currentRow,                 // Row Index
          OFFSET_X,                   // Offset X
          OFFSET_Y                    // Offset Y
        );
        
        image.setWidth(IMAGE_SIZE)
             .setHeight(IMAGE_SIZE);
      } catch (e) {
        Logger.log(`Failed to insert image for product ${product.product_id}: ${e.toString()}`);
        sheet.getRange(currentRow, QUOTATION_CELLS.COL_IMAGE).setValue("(No Image)");
      }
    }
    
    // 4. UOM (Defaulting to 'Nos' or blank if not in data)
    sheet.getRange(currentRow, QUOTATION_CELLS.COL_UOM).setValue("Nos");
    
    // 5. RATE - Left blank for manual entry per customer
    // sheet.getRange(currentRow, QUOTATION_CELLS.COL_RATE).setValue(product.price);
    
    // 6. GST (Default blank or 18% formula? Leaving blank for manual entry)
    // sheet.getRange(currentRow, QUOTATION_CELLS.COL_GST).setValue("");
    
    currentRow++;
  }
  
  // APPLY BORDERS & ALIGNMENT
  if (products.length > 0) {
    // Determine range from Sr No (Col 2) to GST (Col 7)
    const startCol = QUOTATION_CELLS.COL_SR_NO; // 2
    const numCols = 6; // B, C, D, E, F, G
    
    const fullRange = sheet.getRange(
      QUOTATION_CELLS.PRODUCTS_START_ROW, 
      startCol, 
      products.length, 
      numCols 
    );
    
    // Borders (Thicker)
    // setBorder(top, left, bottom, right, vertical, horizontal, color, style)
    fullRange.setBorder(true, true, true, true, true, true, "black", SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
    
    // Vertical alignment
    fullRange.setVerticalAlignment('middle');
    
    // Center Align specifically for Sr No, UOM, Rate, GST
    sheet.getRange(QUOTATION_CELLS.PRODUCTS_START_ROW, QUOTATION_CELLS.COL_SR_NO, products.length, 1).setHorizontalAlignment('center');
    sheet.getRange(QUOTATION_CELLS.PRODUCTS_START_ROW, QUOTATION_CELLS.COL_UOM, products.length, 1).setHorizontalAlignment('center');
    sheet.getRange(QUOTATION_CELLS.PRODUCTS_START_ROW, QUOTATION_CELLS.COL_RATE, products.length, 1).setHorizontalAlignment('center');
    sheet.getRange(QUOTATION_CELLS.PRODUCTS_START_ROW, QUOTATION_CELLS.COL_GST, products.length, 1).setHorizontalAlignment('center');
    
    // Left Align for Name
    sheet.getRange(QUOTATION_CELLS.PRODUCTS_START_ROW, QUOTATION_CELLS.COL_NAME, products.length, 1).setHorizontalAlignment('left');
  }

  // Calculate grand total (assuming template has a total cell)
  const grandTotal = products.reduce((sum, p) => sum + (p.price * p.quantity), 0);
  
  // You may want to set this in a specific cell in your template
  // Example: sheet.getRange('E' + (currentRow + 2)).setValue(grandTotal);
}

/**
 * Generates Excel download URL for a spreadsheet
 * @param {string} fileId - Spreadsheet file ID
 * @return {string} Download URL
 */
function insertTermsAndConditions(sheet, productsStartRow, productCount) {
  const lastProductRow = productsStartRow + productCount - 1;
  let row = lastProductRow + 2; // leave one empty row

  const terms = [
    "TERMS AND CONDITIONS",
    "GST EXTRA",
    "Payment Terms",
    "Transport",
    "DELIVERY WITHIN 6-7 DAYS",
    "Quotation valid for 30 Days",
    "FOR HI TECH SALES AND SERVICES",
    "",
    "S RAMANATHAN"
  ];

  terms.forEach((text, index) => {
    const cell = sheet.getRange(row + index, 2); // Column B
    cell.setValue(text);

    if (text === "TERMS AND CONDITIONS" || text === "S RAMANATHAN") {
      cell.setFontWeight("bold");
    }
  });
} 
function generateExcelDownloadUrl(fileId) {
  // Export as Excel format
  return `https://docs.google.com/spreadsheets/d/${fileId}/export?format=xlsx`;
}

/**
 * Gets or creates the folder for storing quotations
 * @return {Folder} The Google Drive folder
 */
function getOrCreateQuotationFolder() {
  const folders = DriveApp.getFoldersByName(QUOTATIONS_FOLDER_NAME);
  if (folders.hasNext()) {
    return folders.next();
  } else {
    return DriveApp.createFolder(QUOTATIONS_FOLDER_NAME);
  }
}
