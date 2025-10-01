/**
 * Listing View component for displaying and filtering transaction entries
 */

import * as ApiService from '../services/api.js';
import * as Formatter from '../utils/formatter.js';
import { createEntry } from '../models/entry.js';
import * as FileUtils from '../utils/fileUtils.js';

/**
 * Initialize the listing view component
 */
export function init() {
    // DOM Elements
    const queryStringInput = document.getElementById('query-string');
    const startDateInput = document.getElementById('start-date');
    const endDateInput = document.getElementById('end-date');
    const filterBtn = document.getElementById('filter-btn');
    const resetFilterBtn = document.getElementById('reset-filter-btn');
    const exportBtn = document.getElementById('export-btn');
    const entriesContainer = document.getElementById('entries-container');
    const loadingMessage = document.getElementById('loading-message');
    const noEntriesMessage = document.getElementById('no-entries-message');
    const loadMoreBtn = document.getElementById('load-more-btn');
    const clearStartDateBtn = document.getElementById('clear-start-date');
    const clearEndDateBtn = document.getElementById('clear-end-date');
    
    // Internal state
    let currentPage = 1;
    let pageSize = 20;
    let totalEntriesLoaded = 0;
    let currentFilters = {
        queryString: '',
        startDate: '',
        endDate: ''
    };
    
    // Set up event listeners
    if (filterBtn) {
        filterBtn.addEventListener('click', () => {
            applyFilters(
                queryStringInput,
                startDateInput,
                endDateInput,
                filterBtn,
                resetFilterBtn,
                entriesContainer,
                loadingMessage,
                noEntriesMessage,
                loadMoreBtn,
                currentFilters,
                currentPage,
                totalEntriesLoaded
            );
        });
    }
    
    if (resetFilterBtn) {
        resetFilterBtn.addEventListener('click', () => {
            resetFilters(
                queryStringInput,
                startDateInput,
                endDateInput,
                filterBtn,
                resetFilterBtn,
                entriesContainer,
                loadingMessage,
                noEntriesMessage,
                loadMoreBtn,
                currentFilters,
                currentPage,
                totalEntriesLoaded
            );
        });
    }
    
    // Set up export button
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            exportEntries(
                currentFilters,
                exportBtn
            );
        });
    }
    
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', () => {
            loadMoreEntries(
                currentFilters,
                currentPage,
                pageSize,
                totalEntriesLoaded,
                entriesContainer,
                loadingMessage,
                noEntriesMessage,
                loadMoreBtn
            );
        });
    }
    
    // Set up clear date buttons
    if (clearStartDateBtn && startDateInput) {
        clearStartDateBtn.addEventListener('click', () => {
            startDateInput.value = '';
        });
    }
    
    if (clearEndDateBtn && endDateInput) {
        clearEndDateBtn.addEventListener('click', () => {
            endDateInput.value = '';
        });
    }
    
    // Return controller for external use
    return {
        loadEntries: () => {
            // Reset state
            currentPage = 1;
            totalEntriesLoaded = 0;
            currentFilters = {
                queryString: '',
                startDate: '',
                endDate: ''
            };
            
            // Reset UI
            if (queryStringInput) queryStringInput.value = '';
            if (startDateInput) startDateInput.value = '';
            if (endDateInput) endDateInput.value = '';
            
            // Load initial entries
            if (entriesContainer) entriesContainer.innerHTML = '';
            if (noEntriesMessage) noEntriesMessage.classList.add('hidden');
            if (loadingMessage) loadingMessage.classList.remove('hidden');
            if (loadMoreBtn) loadMoreBtn.classList.add('hidden');
            
            loadEntries(
                currentFilters,
                currentPage,
                pageSize,
                totalEntriesLoaded,
                entriesContainer,
                loadingMessage,
                noEntriesMessage,
                loadMoreBtn
            );
        }
    };
}

/**
 * Apply filters and load entries
 * @param {HTMLElement} queryStringInput - Query string input element
 * @param {HTMLElement} startDateInput - Start date input element
 * @param {HTMLElement} endDateInput - End date input element
 * @param {HTMLElement} filterBtn - Filter button element
 * @param {HTMLElement} resetFilterBtn - Reset filter button element
 * @param {HTMLElement} entriesContainer - Container for entries
 * @param {HTMLElement} loadingMessage - Loading message element
 * @param {HTMLElement} noEntriesMessage - No entries message element
 * @param {HTMLElement} loadMoreBtn - Load more button element
 * @param {Object} currentFilters - Current filter state
 * @param {number} currentPage - Current page number
 * @param {number} totalEntriesLoaded - Total entries loaded so far
 */
function applyFilters(
    queryStringInput,
    startDateInput,
    endDateInput,
    filterBtn,
    resetFilterBtn,
    entriesContainer,
    loadingMessage,
    noEntriesMessage,
    loadMoreBtn,
    currentFilters,
    currentPage,
    totalEntriesLoaded
) {
    // Add loading state to filter button
    if (filterBtn) {
        filterBtn.classList.add('btn-loading');
        filterBtn.disabled = true;
    }
    
    // Reset pagination
    currentPage = 1;
    totalEntriesLoaded = 0;
    
    if (entriesContainer) entriesContainer.innerHTML = '';
    if (loadingMessage) loadingMessage.classList.remove('hidden');
    if (noEntriesMessage) noEntriesMessage.classList.add('hidden');
    if (loadMoreBtn) loadMoreBtn.classList.add('hidden');
    
    // Update current filters
    currentFilters.queryString = queryStringInput ? queryStringInput.value.trim() : '';
    currentFilters.startDate = startDateInput && startDateInput.value ? 
        Formatter.formatDateForAPI(startDateInput.value) : '';
    currentFilters.endDate = endDateInput && endDateInput.value ? 
        Formatter.formatDateForAPI(endDateInput.value) : '';
    
    console.log('Applying filters:', currentFilters);
    
    // Load entries with new filters
    loadEntries(
        currentFilters,
        currentPage,
        20,
        totalEntriesLoaded,
        entriesContainer,
        loadingMessage,
        noEntriesMessage,
        loadMoreBtn,
        filterBtn
    );
}

/**
 * Reset filters
 * @param {HTMLElement} queryStringInput - Query string input element
 * @param {HTMLElement} startDateInput - Start date input element
 * @param {HTMLElement} endDateInput - End date input element
 * @param {HTMLElement} filterBtn - Filter button element
 * @param {HTMLElement} resetFilterBtn - Reset filter button element
 * @param {HTMLElement} entriesContainer - Container for entries
 * @param {HTMLElement} loadingMessage - Loading message element
 * @param {HTMLElement} noEntriesMessage - No entries message element
 * @param {HTMLElement} loadMoreBtn - Load more button element
 * @param {Object} currentFilters - Current filter state
 * @param {number} currentPage - Current page number
 * @param {number} totalEntriesLoaded - Total entries loaded so far
 */
function resetFilters(
    queryStringInput,
    startDateInput,
    endDateInput,
    filterBtn,
    resetFilterBtn,
    entriesContainer,
    loadingMessage,
    noEntriesMessage,
    loadMoreBtn,
    currentFilters,
    currentPage,
    totalEntriesLoaded
) {
    // Add loading state to reset button
    if (resetFilterBtn) {
        resetFilterBtn.classList.add('btn-loading');
        resetFilterBtn.disabled = true;
    }
    
    // Clear all filter inputs
    if (queryStringInput) queryStringInput.value = '';
    if (startDateInput) startDateInput.value = '';
    if (endDateInput) endDateInput.value = '';
    
    // Apply the cleared filters
    applyFilters(
        queryStringInput,
        startDateInput,
        endDateInput,
        filterBtn,
        resetFilterBtn,
        entriesContainer,
        loadingMessage,
        noEntriesMessage,
        loadMoreBtn,
        currentFilters,
        currentPage,
        totalEntriesLoaded
    );
    
    // Reset button will be reset when loadEntries completes
    setTimeout(() => {
        if (resetFilterBtn) {
            resetFilterBtn.classList.remove('btn-loading');
            resetFilterBtn.disabled = false;
        }
    }, 500);
}

/**
 * Load more entries
 * @param {Object} currentFilters - Current filter state
 * @param {number} currentPage - Current page number
 * @param {number} pageSize - Number of entries per page
 * @param {number} totalEntriesLoaded - Total entries loaded so far
 * @param {HTMLElement} entriesContainer - Container for entries
 * @param {HTMLElement} loadingMessage - Loading message element
 * @param {HTMLElement} noEntriesMessage - No entries message element
 * @param {HTMLElement} loadMoreBtn - Load more button element
 */
function loadMoreEntries(
    currentFilters,
    currentPage,
    pageSize,
    totalEntriesLoaded,
    entriesContainer,
    loadingMessage,
    noEntriesMessage,
    loadMoreBtn
) {
    // Increment page number
    currentPage++;
    
    // Load entries
    loadEntries(
        currentFilters,
        currentPage,
        pageSize,
        totalEntriesLoaded,
        entriesContainer,
        loadingMessage,
        noEntriesMessage,
        loadMoreBtn
    );
}

/**
 * Load entries from API
 * @param {Object} filters - Filter parameters
 * @param {number} page - Page number to load
 * @param {number} pageSize - Number of entries per page
 * @param {number} totalLoaded - Total entries loaded so far
 * @param {HTMLElement} entriesContainer - Container for entries
 * @param {HTMLElement} loadingMessage - Loading message element
 * @param {HTMLElement} noEntriesMessage - No entries message element
 * @param {HTMLElement} loadMoreBtn - Load more button element
 * @param {HTMLElement} filterBtn - Optional filter button to reset state
 */
function loadEntries(
    filters,
    page,
    pageSize,
    totalLoaded,
    entriesContainer,
    loadingMessage,
    noEntriesMessage,
    loadMoreBtn,
    filterBtn
) {
    // Show loading message
    if (loadingMessage) loadingMessage.classList.remove('hidden');
    if (loadMoreBtn) loadMoreBtn.classList.add('hidden');
    
    ApiService.loadEntries(filters, page, pageSize)
        .then(entriesArray => {
            // Hide loading message
            if (loadingMessage) loadingMessage.classList.add('hidden');
            
            // Reset filter button state
            if (filterBtn) {
                filterBtn.classList.remove('btn-loading');
                filterBtn.disabled = false;
            }
            
            // Check if there are entries
            if (entriesArray && entriesArray.length > 0) {
                // Display entries
                displayEntries(entriesArray, entriesContainer);
                
                // Update total entries loaded
                totalLoaded += entriesArray.length;
                
                // Show load more button if there are likely more entries
                if (entriesArray.length === pageSize) {
                    if (loadMoreBtn) loadMoreBtn.classList.remove('hidden');
                } else {
                    if (loadMoreBtn) loadMoreBtn.classList.add('hidden');
                }
                
                // Hide no entries message if it was visible
                if (noEntriesMessage) noEntriesMessage.classList.add('hidden');
            } else {
                // Show no entries message if no entries are found
                if (totalLoaded === 0) {
                    // Check if filters are applied to customize message
                    const hasFilters = filters.queryString || filters.startDate || filters.endDate;
                    
                    if (noEntriesMessage) {
                        if (hasFilters) {
                            noEntriesMessage.textContent = 'No entries found matching your filters.';
                        } else {
                            noEntriesMessage.textContent = 'No entries found. Try adding some transactions first.';
                        }
                        
                        noEntriesMessage.classList.remove('hidden');
                    }
                    
                    if (loadMoreBtn) loadMoreBtn.classList.add('hidden');
                } else {
                    // All entries loaded
                    if (loadMoreBtn) loadMoreBtn.classList.add('hidden');
                }
            }
        })
        .catch(error => {
            console.error('Error loading entries:', error);
            if (loadingMessage) loadingMessage.classList.add('hidden');
            
            // Reset filter button state
            if (filterBtn) {
                filterBtn.classList.remove('btn-loading');
                filterBtn.disabled = false;
            }
            
            // Show error message
            if (noEntriesMessage) {
                noEntriesMessage.textContent = 'Error loading entries. Please try again.';
                noEntriesMessage.classList.remove('hidden');
            }
        });
}

/**
 * Display entries in the UI
 * @param {Array} entries - Array of entry objects to display
 * @param {HTMLElement} container - Container to display entries in
 */
function displayEntries(entries, container) {
    if (!container) return;
    
    // Check if we have entries
    if (!Array.isArray(entries) || entries.length === 0) {
        console.log('No entries to display');
        return;
    }
    
    console.log(`Displaying ${entries.length} entries`);
    
    // Process each entry
    entries.forEach(entry => {
        // Extract entry data and documents from the response
        let rawEntry, documents;
        
        if (entry && entry.entry) {
            // Format: { "entry": {...}, "documents": [...] }
            rawEntry = entry.entry;
            documents = entry.documents || [];
        } else if (entry && (entry.id || entry._id)) {
            // Direct entry format
            rawEntry = entry;
            documents = entry.documents || entry.files || [];
        } else {
            console.error('Unexpected entry format:', entry);
            return; // Skip this entry
        }
        
        // Standardize the entry data using the entry model
        const standardizedEntry = createEntry(rawEntry);
        
        // Prepare document objects with proper format for display (url and name)
        const processedDocuments = documents && documents.length > 0 ? 
            documents.map(doc => {
                return {
                    url: doc.publicUrl || doc.public_url || doc.url || '',
                    name: doc.file_path || doc.filename || 'Document'
                };
            }) : [];
        
        // Create entry card and add to container
        const entryCard = createEntryCard(standardizedEntry, processedDocuments);
        container.appendChild(entryCard);
    });
}

/**
 * Create an entry card DOM element
 * @param {Object} entry - Standardized entry data object
 * @param {Array} documents - Array of document objects
 * @returns {HTMLElement} Entry card element
 */
function createEntryCard(entry, documents) {
    // Create the entry card
    const entryCard = document.createElement('div');
    entryCard.className = 'entry-card';
    entryCard.setAttribute('data-entry-id', entry.id || '');
    
    // Create header with date
    const headerDiv = document.createElement('div');
    headerDiv.className = 'entry-header';
    
    // Date element
    const dateDiv = document.createElement('div');
    dateDiv.className = 'entry-date';
    dateDiv.textContent = entry.date ? Formatter.formatDateFromString(entry.date) : 'Unknown date';
    
    // Add human_code if available
    if (entry.humanCode) {
        const humanCodeSpan = document.createElement('span');
        humanCodeSpan.className = 'human-code';
        humanCodeSpan.textContent = entry.humanCode;
        headerDiv.appendChild(humanCodeSpan);
    }
    
    // Store ID as a data attribute but don't display it
    headerDiv.setAttribute('data-entry-id', entry.id || '');
    headerDiv.appendChild(dateDiv);
    
    // Amount section
    const amountDiv = document.createElement('div');
    amountDiv.className = 'entry-amount';
    
    // Format the amount
    const amountValue = entry.amount.toFixed(2);
    
    // Apply styling based on credit/debit
    if (entry.crdr === 'CR') {
        amountDiv.classList.add('amount-credit');
        amountDiv.textContent = amountValue;
    } else {
        amountDiv.classList.add('amount-debit');
        amountDiv.textContent = `-${amountValue}`;
    }
    
    // Details section
    const detailsDiv = document.createElement('div');
    detailsDiv.className = 'entry-details';
    
    // Category
    const categoryDiv = document.createElement('div');
    categoryDiv.className = 'entry-category';
    categoryDiv.textContent = entry.category || 'Uncategorized';
    
    // Description
    const descriptionDiv = document.createElement('div');
    descriptionDiv.className = 'entry-description';
    descriptionDiv.textContent = entry.description || '';
    
    detailsDiv.appendChild(categoryDiv);
    detailsDiv.appendChild(descriptionDiv);
    
    // Documents section
    let documentsDiv = null;
    if (documents && documents.length > 0) {
        documentsDiv = createDocumentsSection(documents);
    }
    
    // Build the card
    entryCard.appendChild(headerDiv);
    entryCard.appendChild(amountDiv);
    entryCard.appendChild(detailsDiv);
    if (documentsDiv) {
        entryCard.appendChild(documentsDiv);
    }
    
    return entryCard;
}

/**
 * Create the documents section for an entry card
 * @param {Array} documents - Array of document objects
 * @returns {HTMLElement} Documents section element
 */
function createDocumentsSection(documents) {
    const documentsDiv = document.createElement('div');
    documentsDiv.className = 'entry-documents';
    
    const documentsTitle = document.createElement('div');
    documentsTitle.className = 'documents-title';
    documentsTitle.textContent = 'Documents';
    documentsDiv.appendChild(documentsTitle);
    
    // Create links for each document
    documents.forEach(doc => {
        const docLink = createDocumentLink(doc);
        if (docLink) {
            documentsDiv.appendChild(docLink);
        }
    });
    
    return documentsDiv;
}

/**
 * Create a document link
 * @param {Object} doc - Standardized document object with url and name
 * @returns {HTMLElement|null} Document link element or null if invalid
 */
function createDocumentLink(doc) {
    if (!doc || !doc.url) {
        console.error('Invalid document object');
        return null;
    }
    
    const docLink = document.createElement('a');
    docLink.className = 'document-link';
    
    // Document URL and name are already standardized by the entry model
    const publicUrl = doc.url;
    const docName = doc.name || 'Document';
    
    docLink.onclick = function(e) {
        e.preventDefault();
        openDocument(publicUrl);
    };
    
    // Get document icon
    const docIcon = document.createElement('span');
    docIcon.className = 'document-icon';
    
    // Determine icon based on file extension
    let icon = '📄';
    
    if (docName) {
        const lowerName = docName.toLowerCase();
        if (lowerName.endsWith('.pdf')) {
            icon = '📑';
        } else if (lowerName.endsWith('.jpg') || lowerName.endsWith('.jpeg') || 
                 lowerName.endsWith('.png') || lowerName.endsWith('.gif')) {
            icon = '🖼️';
        } else if (lowerName.endsWith('.xls') || lowerName.endsWith('.xlsx') ||
                 lowerName.endsWith('.csv')) {
            icon = '📊';
        } else if (lowerName.endsWith('.doc') || lowerName.endsWith('.docx') ||
                 lowerName.endsWith('.txt')) {
            icon = '📝';
        }
    }
    
    docIcon.textContent = icon;
    
    docLink.appendChild(docIcon);
    docLink.appendChild(document.createTextNode(docName));

    return docLink;
}

/**
 * Open document in new tab
 * @param {string} publicUrl - URL to open
 */
function openDocument(publicUrl) {
    if (!publicUrl) {
        console.error('Cannot open document: URL is empty');
        return;
    }

    // Import document URL service here to avoid circular dependencies
    import('../services/documentUrlService.js').then(module => {
        // Get authenticated URL with proper query parameters
        const authenticatedUrl = module.authenticateDocumentUrl(publicUrl);

        console.log('Opening authenticated document URL:', authenticatedUrl);

        // Open the URL directly in a new tab - the browser will handle any 301 redirects
        const newTab = window.open(authenticatedUrl, '_blank');

        // Check if popup was blocked
        if (!newTab) {
            console.error('Popup blocked. Please allow popups for this site.');
            alert('Popup blocked. Please allow popups for this site.');
        }
    }).catch(error => {
        console.error('Error importing document URL service:', error);
        // Fallback to original behavior if module import fails
        const cacheBuster = new Date().getTime();
        const separator = publicUrl.includes('?') ? '&' : '?';
        const noCacheUrl = `${publicUrl}${separator}_nocache=${cacheBuster}`;

        window.open(noCacheUrl, '_blank');
    });
}

/**
 * Export entries as CSV based on current filters
 * @param {Object} currentFilters - Current filter state
 * @param {HTMLElement} exportBtn - Export button element
 */
function exportEntries(currentFilters, exportBtn) {
    // Show loading state on the button
    const originalText = exportBtn.textContent;
    exportBtn.textContent = 'Exporting...';
    exportBtn.disabled = true;
    
    console.log('Exporting entries with filters:', currentFilters);
    
    // Call the API service to export entries
    ApiService.exportEntries(currentFilters)
        .then(blob => {
            // Generate filename with current date
            const now = new Date();
            const dateStr = FileUtils.formatDateForFileName(now);
            const fileName = `transactions-export-${dateStr}.csv`;
            
            // Download the file
            FileUtils.downloadFile(blob, fileName);
            
            console.log('CSV export complete:', fileName);
        })
        .catch(error => {
            console.error('Error exporting entries:', error);
            alert('Failed to export entries. Please try again.');
        })
        .finally(() => {
            // Reset button state
            exportBtn.textContent = originalText;
            exportBtn.disabled = false;
        });
}
