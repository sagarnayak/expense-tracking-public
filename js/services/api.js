/**
 * API Service for handling all API interactions
 */

import CONFIG from '../config.js';
import * as SecurityService from './securityService.js';

/**
 * Submit form data to API with progress tracking
 * @param {FormData} formData - The form data to submit
 * @param {Function} onProgress - Progress callback
 * @param {Function} onSuccess - Success callback
 * @param {Function} onError - Error callback
 */
export function submitTransaction(formData, onProgress, onSuccess, onError) {
    // Create XHR for progress tracking
    const xhr = new XMLHttpRequest();
    
    // Track upload progress
    xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
            const percentComplete = Math.round((event.loaded / event.total) * 100);
            if (onProgress) {
                onProgress(percentComplete);
            }
            console.log(`Upload progress: ${percentComplete}%`);
        }
    });
    
    // Handle request completion
    xhr.addEventListener('load', function() {
        if (xhr.status >= 200 && xhr.status < 300) {
            // Handle success
            if (onSuccess) {
                onSuccess();
            }
        } else {
            // Handle error
            console.error('Error submitting transaction:', xhr.statusText);
            if (onError) {
                onError(`Failed to submit transaction. Status: ${xhr.status} ${xhr.statusText}`);
            }
        }
    });
    
    // Handle request errors
    xhr.addEventListener('error', function() {
        console.error('Network error during transaction submission');
        if (onError) {
            onError('Network error during submission. Please check your connection and try again.');
        }
    });
    
    // Open the request
    xhr.open('POST', CONFIG.API.UPLOAD_ENDPOINT);
    
    // Add security headers after open() but before send()
    SecurityService.addSecurityHeadersToXhr(xhr, CONFIG.API.UPLOAD_ENDPOINT);
    
    // Send the request
    xhr.send(formData);
    
    return xhr;
}

/**
 * Load entries from API with optional filters
 * @param {Object} filters - Filter parameters
 * @param {number} pageNumber - Page number for pagination
 * @param {number} pageSize - Number of items per page
 * @returns {Promise} Promise resolving to entries
 */
export function loadEntries(filters = {}, pageNumber = 1, pageSize = CONFIG.SETTINGS.PAGE_SIZE) {
    // Prepare API request body
    const requestBody = {
        limit: pageSize,
        pageNumber: pageNumber
    };
    
    // Only add filters if they have values
    if (filters.queryString) {
        requestBody.queryString = filters.queryString;
    }
    
    if (filters.startDate) {
        requestBody.startDate = filters.startDate;
    }
    
    if (filters.endDate) {
        requestBody.endDate = filters.endDate;
    }
    
    console.log('Loading entries with filters:', requestBody);
    
    // Create fetch options
    let fetchOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
    };
    
    // Add security headers to fetch options
    fetchOptions = SecurityService.addSecurityHeadersToFetchOptions(fetchOptions, CONFIG.API.FILTER_ENDPOINT);
    
    // Return promise for API call
    return fetch(CONFIG.API.FILTER_ENDPOINT, fetchOptions)
    .then(response => {
        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('API response:', data);
        
        // Process and return entries
        return processApiResponse(data);
    });
}

/**
 * Process API response and extract entries
 * @param {Object|Array} data - API response data
 * @returns {Array} Array of entries
 */
function processApiResponse(data) {
    let entriesArray = [];
    
    console.log('Raw API response:', JSON.stringify(data).substring(0, 200));
    
    // Handle the exact format from the example
    if (Array.isArray(data) && data.length > 0 && data[0].response) {
        // This is the format we expect: [{ "response": [...entries...] }]
        entriesArray = data[0].response;
        console.log(`Found ${entriesArray.length} entries in data[0].response`);
    }
    // Fallbacks for other possible formats
    else if (data.response && Array.isArray(data.response)) {
        entriesArray = data.response;
        console.log(`Found ${entriesArray.length} entries in data.response`);
    }
    else if (Array.isArray(data)) {
        entriesArray = data;
        console.log(`Found ${entriesArray.length} entries in direct array`);
    }
    else if (data && typeof data === 'object') {
        // Last resort - try to extract entries from any object structure
        if (data.entries && Array.isArray(data.entries)) {
            entriesArray = data.entries;
        } else if (data.data && Array.isArray(data.data)) {
            entriesArray = data.data;
        } else {
            // If we can't find a standard array, create a single entry from the object
            entriesArray = [data];
        }
        console.log(`Extracted ${entriesArray.length} entries from object structure`);
    }
    
    return entriesArray;
}

/**
 * Export entries as CSV based on filters
 * @param {Object} filters - Filter parameters (queryString, startDate, endDate)
 * @returns {Promise} Promise resolving to CSV data blob
 */
export function exportEntries(filters = {}) {
    // Prepare API request body - only include filters if they have values
    const requestBody = {};
    
    // Only add filters if they have values (unlike loadEntries, we don't include pagination)
    if (filters.queryString) {
        requestBody.queryString = filters.queryString;
    }
    
    if (filters.startDate) {
        requestBody.startDate = filters.startDate;
    }
    
    if (filters.endDate) {
        requestBody.endDate = filters.endDate;
    }
    
    console.log('Exporting entries with filters:', requestBody);
    
    // Create fetch options
    let fetchOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
    };
    
    // Add security headers to fetch options
    fetchOptions = SecurityService.addSecurityHeadersToFetchOptions(fetchOptions, CONFIG.API.EXPORT_ENDPOINT);
    
    // Return promise for API call
    return fetch(CONFIG.API.EXPORT_ENDPOINT, fetchOptions)
    .then(response => {
        if (!response.ok) {
            throw new Error(`Export API request failed with status ${response.status}`);
        }
        
        // For Chrome and other browsers, we need to handle the text response first
        return response.text();
    })
    .then(text => {
        // Create a new blob with text/csv MIME type from the response text
        const csvBlob = new Blob([text], { type: 'text/csv;charset=utf-8' });
        console.log('Created CSV blob of size:', csvBlob.size, 'from text of length:', text.length);
        return csvBlob;
    });
}
