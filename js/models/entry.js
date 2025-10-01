/**
 * Entry model representing a transaction entry
 */

/**
 * Create a new entry object
 * @param {Object} data - Raw entry data from API or form
 * @returns {Object} Standardized entry object
 */
export function createEntry(data = {}) {
    return {
        id: data.id || data._id || '',
        date: standardizeDate(data.date || data.entry_date || data.transaction_date || new Date()),
        amount: parseFloat(data.amount || data.transaction_amount || data.value || 0),
        crdr: standardizeCrDr(data.cr_dr || data.type || data.transaction_type || ''),
        category: data.category || data.group || 'Uncategorized',
        description: data.description || data.desc || data.note || '',
        humanCode: data.human_code || '',
        documents: standardizeDocuments(data.documents || data.files || [])
    };
}

/**
 * Standardize the date format
 * @param {string|Date} date - Date string or Date object
 * @returns {string} ISO date string
 */
function standardizeDate(date) {
    if (!date) return '';
    
    try {
        // If it's already a Date object
        if (date instanceof Date) {
            return date.toISOString().split('T')[0];
        }
        
        // If it's a string, try to parse it
        return new Date(date).toISOString().split('T')[0];
    } catch (e) {
        console.error('Invalid date:', date);
        return '';
    }
}

/**
 * Standardize credit/debit indicator
 * @param {string} crdr - Credit/debit indicator
 * @returns {string} Standardized CR/DR
 */
function standardizeCrDr(crdr) {
    if (!crdr) return 'CR';
    
    const upper = crdr.toUpperCase();
    if (upper.includes('CR') || upper.includes('CREDIT')) {
        return 'CR';
    } else if (upper.includes('DR') || upper.includes('DEBIT')) {
        return 'DR';
    }
    
    return 'CR'; // Default to credit
}

/**
 * Standardize document objects
 * @param {Array} documents - Array of document objects or URLs
 * @returns {Array} Standardized document objects
 */
function standardizeDocuments(documents) {
    if (!Array.isArray(documents)) {
        return [];
    }
    
    return documents.map(doc => {
        if (typeof doc === 'string') {
            // If it's a string URL
            return {
                url: doc,
                name: extractFileNameFromUrl(doc)
            };
        } else if (typeof doc === 'object' && doc !== null) {
            // If it's an object
            return {
                url: doc.publicUrl || doc.public_url || doc.url || doc.link || doc.path || doc.file_path || '',
                name: doc.name || doc.filename || doc.file_name || doc.title || extractFileNameFromUrl(doc.url || '') || 'Document'
            };
        }
        
        return { url: '', name: 'Document' };
    });
}

/**
 * Extract filename from URL
 * @param {string} url - URL string
 * @returns {string} Extracted filename
 */
function extractFileNameFromUrl(url) {
    if (!url) return '';
    
    try {
        // Try to extract filename from URL
        const urlParts = url.split('/');
        let fileName = urlParts[urlParts.length - 1];
        
        // Remove query parameters if any
        if (fileName.includes('?')) {
            fileName = fileName.split('?')[0];
        }
        
        return decodeURIComponent(fileName) || 'Document';
    } catch (e) {
        return 'Document';
    }
}
