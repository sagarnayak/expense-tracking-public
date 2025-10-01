/**
 * Utility functions for formatting dates and other data
 */

/**
 * Format date as YYYY-MM-DD for input field
 * @param {Date} date - The date object to format
 * @return {string} Formatted date string
 */
export function formatDateForInput(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Format date as DD-MMM-YYYY for API
 * @param {string} dateStr - Date string in any valid format
 * @return {string} Formatted date string or empty string if invalid
 */
export function formatDateForAPI(dateStr) {
    // If dateStr is empty or invalid, return empty string
    if (!dateStr) return '';
    
    try {
        const date = new Date(dateStr);
        
        // Check if date is valid
        if (isNaN(date.getTime())) return '';
        
        const day = String(date.getDate()).padStart(2, '0');
        
        // Get month name abbreviation
        const monthNames = ["jan", "feb", "mar", "apr", "may", "jun", 
                            "jul", "aug", "sep", "oct", "nov", "dec"];
        const month = monthNames[date.getMonth()];
        
        const year = date.getFullYear();
        
        return `${day}-${month}-${year}`;
    } catch (e) {
        console.error('Error formatting date:', e);
        return '';
    }
}

/**
 * Format date as DD-MMM-YYYY for file name
 * @param {Date} date - The date object to format
 * @return {string} Formatted date string
 */
export function formatDateForFileName(date) {
    const day = String(date.getDate()).padStart(2, '0');
    
    // Get month name abbreviation
    const monthNames = ["jan", "feb", "mar", "apr", "may", "jun", 
                        "jul", "aug", "sep", "oct", "nov", "dec"];
    const month = monthNames[date.getMonth()];
    
    const year = date.getFullYear();
    
    return `${day}-${month}-${year}`;
}

/**
 * Helper function to format date from string in various formats
 * @param {string} dateString - Date string to format
 * @return {string} Formatted date string
 */
export function formatDateFromString(dateString) {
    if (!dateString) return 'Unknown date';
    
    try {
        // Try standard date parsing
        const date = new Date(dateString);
        
        // Check if date is valid
        if (!isNaN(date.getTime())) {
            return date.toLocaleDateString('en-US', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            });
        }
        
        // Try DD-MMM-YYYY format
        if (typeof dateString === 'string') {
            const parts = dateString.split('-');
            if (parts.length === 3) {
                const monthNames = {"jan":0, "feb":1, "mar":2, "apr":3, "may":4, "jun":5, 
                                  "jul":6, "aug":7, "sep":8, "oct":9, "nov":10, "dec":11};
                const day = parseInt(parts[0], 10);
                const month = monthNames[parts[1].toLowerCase()];
                const year = parseInt(parts[2], 10);
                
                if (!isNaN(day) && month !== undefined && !isNaN(year)) {
                    const parsedDate = new Date(year, month, day);
                    return parsedDate.toLocaleDateString('en-US', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                    });
                }
            }
        }
        
        // Return the original string if parsing fails
        return dateString;
    } catch (e) {
        console.error('Error parsing date:', e);
        return dateString || 'Unknown date';
    }
}
