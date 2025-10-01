/**
 * Autocomplete service for handling API-based autocomplete suggestions
 */
import CONFIG from '../config.js';
import * as SecurityService from './securityService.js';

/**
 * Debounce function to limit the rate at which a function can be called
 * @param {Function} func - Function to debounce
 * @param {number} wait - Milliseconds to wait before calling the function
 * @returns {Function} Debounced function
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Fetch category suggestions from API
 * @param {string} searchText - Text to search for
 * @param {Function} callback - Callback function to receive results
 */
export function fetchCategorySuggestions(searchText, callback) {
    // Don't fetch if searchText is empty or too short
    if (!searchText || searchText.length < CONFIG.SETTINGS.AUTOCOMPLETE_MIN_CHARS) {
        callback([]);
        return;
    }
    
    // Create fetch options
    let fetchOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ searchFor: searchText }),
    };
    
    // Add security headers to fetch options
    fetchOptions = SecurityService.addSecurityHeadersToFetchOptions(fetchOptions, CONFIG.API.CATEGORY_AUTOCOMPLETE_ENDPOINT);
    
    fetch(CONFIG.API.CATEGORY_AUTOCOMPLETE_ENDPOINT, fetchOptions)
    .then(response => {
        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('Category suggestions response:', data);
        // Extract suggestions from the API response format
        const suggestions = data[0]?.appended_category || [];
        callback(suggestions);
    })
    .catch(error => {
        console.error('Error fetching category suggestions:', error);
        callback([]);
    });
}

/**
 * Fetch description suggestions from API
 * @param {string} searchText - Text to search for
 * @param {Function} callback - Callback function to receive results
 */
export function fetchDescriptionSuggestions(searchText, callback) {
    // Don't fetch if searchText is empty or too short
    if (!searchText || searchText.length < CONFIG.SETTINGS.AUTOCOMPLETE_MIN_CHARS) {
        callback([]);
        return;
    }
    
    // Create fetch options
    let fetchOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ searchFor: searchText }),
    };
    
    // Add security headers to fetch options
    fetchOptions = SecurityService.addSecurityHeadersToFetchOptions(fetchOptions, CONFIG.API.DESCRIPTION_AUTOCOMPLETE_ENDPOINT);
    
    fetch(CONFIG.API.DESCRIPTION_AUTOCOMPLETE_ENDPOINT, fetchOptions)
    .then(response => {
        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('Description suggestions response:', data);
        // Extract suggestions from the API response format
        const suggestions = data[0]?.appended_description || [];
        callback(suggestions);
    })
    .catch(error => {
        console.error('Error fetching description suggestions:', error);
        callback([]);
    });
}

/**
 * Create a debounced version of category suggestions fetch
 * @param {Function} callback - Callback function to receive results
 * @returns {Function} Debounced function to call with search text
 */
export function createDebouncedCategoryFetch(callback) {
    return debounce((searchText) => {
        fetchCategorySuggestions(searchText, callback);
    }, CONFIG.SETTINGS.AUTOCOMPLETE_DEBOUNCE_MS);
}

/**
 * Create a debounced version of description suggestions fetch
 * @param {Function} callback - Callback function to receive results
 * @returns {Function} Debounced function to call with search text
 */
export function createDebouncedDescriptionFetch(callback) {
    return debounce((searchText) => {
        fetchDescriptionSuggestions(searchText, callback);
    }, CONFIG.SETTINGS.AUTOCOMPLETE_DEBOUNCE_MS);
}
