/**
 * Utility functions for file handling
 */

/**
 * Get appropriate icon based on file type
 * @param {string} fileType - MIME type of the file
 * @return {string} Icon character representing the file type
 */
export function getFileTypeIcon(fileType) {
    if (fileType.startsWith('image/')) return '🖼️';
    if (fileType === 'application/pdf') return '📄';
    if (fileType.includes('excel') || 
        fileType.includes('spreadsheet') || 
        fileType === 'text/csv' || 
        fileType === 'application/vnd.oasis.opendocument.spreadsheet' || 
        fileType === 'application/vnd.google-apps.spreadsheet') return '📊';
    if (fileType === 'text/plain' || 
        fileType === 'application/vnd.oasis.opendocument.text' || 
        fileType === 'application/vnd.google-apps.document') return '📝';
    return '📎';
}

/**
 * Generate a unique file name based on current timestamp and date
 * @param {File} originalFile - The original file object
 * @return {string} Generated file name
 */
export function generateFileName(originalFile) {
    const currentTime = Date.now();
    const dateStr = formatDateForFileName(new Date());
    const originalName = originalFile.name;
    
    // Extract file extension
    const lastDotIndex = originalName.lastIndexOf('.');
    let fileName = originalName;
    let extension = '';
    
    if (lastDotIndex !== -1) {
        fileName = originalName.substring(0, lastDotIndex);
        extension = originalName.substring(lastDotIndex); // Keep the dot with extension
    }
    
    // Remove all special characters except alphanumeric and hyphens from the filename part only
    const cleanFileName = fileName.replace(/[^a-zA-Z0-9-]/g, '');
    
    return `${currentTime}-${dateStr}-${cleanFileName}${extension}`;
}

/**
 * Format date as DD-MMM-YYYY for file name
 * @param {Date} date - Date object to format
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
 * Download content as a file
 * @param {Blob} blob - The data blob to download
 * @param {string} fileName - Name to give the downloaded file
 */
export function downloadFile(blob, fileName) {
    // Create a URL for the blob
    const url = window.URL.createObjectURL(blob);
    
    // Create a temporary anchor element to trigger the download
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = fileName;
    
    // Add to body, click to download, then remove
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    window.URL.revokeObjectURL(url);
    setTimeout(() => {
        document.body.removeChild(a);
    }, 100);
}
