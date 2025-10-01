/**
 * Document URL Service
 * Handles authentication for document URLs that need to be opened in a new tab
 */

import * as SecurityService from './securityService.js';

/**
 * Appends authentication query parameters to a document URL
 * @param {string} documentUrl - Public document URL to authenticate
 * @returns {string} - URL with appended authentication parameters
 */
export function authenticateDocumentUrl(documentUrl) {
    if (!documentUrl) {
        console.error('Cannot authenticate empty URL');
        return documentUrl;
    }
    
    try {
        // Generate security headers using the existing mechanism
        const headers = SecurityService.generateSecurityHeaders(documentUrl);
        
        if (!headers) {
            console.warn('Failed to generate authentication parameters for document URL');
            return documentUrl;
        }
        
        // Determine the separator for query parameters based on URL structure
        const separator = documentUrl.includes('?') ? '&' : '?';
        
        // Add cache-busting parameter to prevent browser from using cached URL
        const cacheBuster = new Date().getTime();
        
        // Encode the headers as query parameters (URL-encoded)
        const xMessage = encodeURIComponent(headers['x-message']);
        const xSignature = encodeURIComponent(headers['x-signature']);
        
        // Construct the final URL with authentication parameters
        const authenticatedUrl = `${documentUrl}${separator}x-message=${xMessage}&x-signature=${xSignature}&_nocache=${cacheBuster}`;
        
        console.log('Generated authenticated document URL:', authenticatedUrl);
        
        return authenticatedUrl;
    } catch (error) {
        console.error('Error authenticating document URL:', error);
        return documentUrl; // Return original URL if authentication fails
    }
}
