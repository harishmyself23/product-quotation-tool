/**
 * API Client for interacting with Google Apps Script Backend
 * 
 * NOTE: You must deploy your Apps Script implementation as a Web App 
 * and add the URL to your .env.local file as NEXT_PUBLIC_API_URL
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * Searches for products based on a query string
 * @param {string} query - The search term
 * @returns {Promise<Object>} Response object { success: boolean, data: Array, error?: string }
 */
export const searchProducts = async (query) => {
    if (!API_URL) {
        console.error('API URL not configured');
        return { success: false, error: 'API configuration missing' };
    }

    console.log('Fetching from:', `${API_URL}?action=searchProducts&query=${encodeURIComponent(query)}`);
    try {
        const response = await fetch(`${API_URL}?action=searchProducts&query=${encodeURIComponent(query)}`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Search request failed details:', error);
        return { success: false, error: `Network error: ${error.message}. Check console for details.` };
    }
};

/**
 * Fetches the entire product catalog (cached version)
 * @returns {Promise<Object>} Response object
 */
export const fetchAllProducts = async () => {
    // Calling searchProducts with "*" trigger the backend "fetch all" logic
    return searchProducts("*");
};

/**
 * Generates a quotation based on selected products
 * @param {Object} quotationData - The quotation data
 * @returns {Promise<Object>} Response object { success: boolean, data: Object, error?: string }
 */
export const generateQuotation = async (quotationData) => {
    if (!API_URL) {
        console.error('API URL not configured');
        return { success: false, error: 'API configuration missing' };
    }

    try {
        // Note: Apps Script Web App POST requests require specific handling for CORS
        // Using 'no-cors' mode might be necessary if simple POST fails, 
        // but standard fetch should work if the backend handles OPTIONS correctly.
        // Apps Script redirects POST requests, so we need to follow redirects.

        const response = await fetch(`${API_URL}?action=generateQuotation`, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain;charset=utf-8', // Apps Script tends to handle text/plain better for POST bodies to avoid preflight issues sometimes
            },
            body: JSON.stringify(quotationData)
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Generate quotation failed:', error);
        return { success: false, error: 'Network request failed' };
    }
};

/**
 * Checks if a product name is unique (server-side)
 * @param {string} name - The product name
 * @returns {Promise<Object>} Response object
 */
export const checkNameUniqueness = async (name) => {
    if (!API_URL) return { success: false, error: 'API configuration missing' };
    try {
        const response = await fetch(`${API_URL}?action=checkNameUniqueness&name=${encodeURIComponent(name)}`);
        return await response.json();
    } catch (error) {
        return { success: false, error: 'Network error' };
    }
};

/**
 * Adds a new product to the catalog
 * @param {Object} productData - { name, category, image_url }
 * @returns {Promise<Object>} Response object
 */
export const addProduct = async (productData) => {
    if (!API_URL) return { success: false, error: 'API configuration missing' };
    try {
        const response = await fetch(`${API_URL}?action=addProduct`, {
            method: 'POST',
            body: JSON.stringify(productData)
        });
        return await response.json();
    } catch (error) {
        return { success: false, error: 'Network error' };
    }
};

/**
 * Uploads an image to ImgBB
 * @param {Blob} imageBlob - The image file blob
 * @param {string} filename - The desired filename
 * @returns {Promise<Object>} ImgBB response
 */
export const uploadToImgBB = async (imageBlob, filename) => {
    const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY;
    if (!apiKey) {
        return { success: false, error: 'ImgBB API Key missing in .env.local' };
    }

    const formData = new FormData();
    formData.append('image', imageBlob); // ImgBB doesn't strictly use the filename from formdata for URL but good to have
    formData.append('name', filename.replace(/\.[^/.]+$/, "")); // Set the name property for ImgBB

    try {
        const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
            method: 'POST',
            body: formData
        });

        const data = await response.json();
        if (data.success) {
            return { success: true, url: data.data.url };
        } else {
            return { success: false, error: data.error.message };
        }
    } catch (error) {
        console.error('ImgBB upload error:', error);
        return { success: false, error: 'ImgBB upload failed' };
    }
};
