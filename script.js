// Import configuration and services
import CONFIG from './js/config.js';
import * as AuthService from './js/services/authService.js';
import * as SecurityService from './js/services/securityService.js';

// DOM Elements - Login
const loginContainer = document.getElementById('login-container');
const accountingContainer = document.getElementById('accounting-container');
const listingContainer = document.getElementById('listing-container');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const loginBtn = document.getElementById('login-btn');
const loginError = document.getElementById('login-error');
const logoutBtn = document.getElementById('logout-btn');
const listBtn = document.getElementById('list-btn');
const addEntryBtn = document.getElementById('add-entry-btn');
const listLogoutBtn = document.getElementById('list-logout-btn');

// DOM Elements - Accounting Form
const dateInput = document.getElementById('date');
const amountInput = document.getElementById('amount');
const categorySelect = document.getElementById('category');
const descriptionInput = document.getElementById('description');
const autocompleteContainer = document.getElementById('autocomplete-container');
const cameraInput = document.getElementById('camera-input');
const fileInput = document.getElementById('file-input');
const selectedFilesContainer = document.getElementById('selected-files-container');
const submitBtn = document.getElementById('submit-btn');

// DOM Elements - Listing/Filter
const queryStringInput = document.getElementById('query-string');
const startDateInput = document.getElementById('start-date');
const endDateInput = document.getElementById('end-date');
const filterBtn = document.getElementById('filter-btn');
const resetFilterBtn = document.getElementById('reset-filter-btn');
const entriesContainer = document.getElementById('entries-container');
const loadingMessage = document.getElementById('loading-message');
const noEntriesMessage = document.getElementById('no-entries-message');
const loadMoreBtn = document.getElementById('load-more-btn');

// Authentication handled by AuthService
// Using secure bcrypt password verification

// Global variables
let selectedFiles = [];
let currentPage = 1;
let pageSize = CONFIG.SETTINGS.PAGE_SIZE;
let totalEntriesLoaded = 0;
let currentFilters = {
    queryString: '',
    startDate: '',
    endDate: ''
};

// Description suggestions from config
let descriptionSuggestions = CONFIG.DATA.DESCRIPTION_SUGGESTIONS;

// Initialize the application
function init() {
    // Set today's date as default
    const today = new Date();
    const formattedDate = formatDateForInput(today);
    dateInput.value = formattedDate;
    
    // Check if user is already logged in
    checkLoginStatus();
    
    // Set up event listeners
    setupEventListeners();
}

// Format date as YYYY-MM-DD for input field
function formatDateForInput(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Check if user is already logged in
function checkLoginStatus() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    
    if (isLoggedIn) {
        showAccountingPage();
    } else {
        showLoginPage();
    }
}

// Show login page
function showLoginPage() {
    loginContainer.classList.remove('hidden');
    accountingContainer.classList.add('hidden');
    listingContainer.classList.add('hidden');
}

// Show accounting page
function showAccountingPage() {
    loginContainer.classList.add('hidden');
    accountingContainer.classList.remove('hidden');
    listingContainer.classList.add('hidden');
}

// Show listing page
function showListingPage() {
    loginContainer.classList.add('hidden');
    accountingContainer.classList.add('hidden');
    listingContainer.classList.remove('hidden');
    
    // Clear any previous filters
    queryStringInput.value = '';
    startDateInput.value = '';
    endDateInput.value = '';
    
    // Reset any previous entries
    entriesContainer.innerHTML = '';
    noEntriesMessage.classList.add('hidden');
    
    // Reset pagination
    currentPage = 1;
    totalEntriesLoaded = 0;
    
    // Initialize currentFilters
    currentFilters = {
        queryString: '',
        startDate: '',
        endDate: ''
    };
    
    // Load initial entries without filters
    loadingMessage.classList.remove('hidden');
    loadEntries();
}

// Set up event listeners
function setupEventListeners() {
    // Login form
    loginBtn.addEventListener('click', handleLogin);
    logoutBtn.addEventListener('click', handleLogout);
    listLogoutBtn.addEventListener('click', handleLogout);
    
    // Navigation
    listBtn.addEventListener('click', showListingPage);
    addEntryBtn.addEventListener('click', showAccountingPage);
    
    // Accounting form
    descriptionInput.addEventListener('input', handleDescriptionInput);
    amountInput.addEventListener('input', validateAmount);
    cameraInput.addEventListener('change', handleFileSelection);
    fileInput.addEventListener('change', handleFileSelection);
    submitBtn.addEventListener('click', handleFormSubmit);
    
    // Listing/Filter form
    filterBtn.addEventListener('click', applyFilters);
    resetFilterBtn.addEventListener('click', resetFilters);
    loadMoreBtn.addEventListener('click', loadMoreEntries);
    
    // Clear date buttons
    document.getElementById('clear-start-date').addEventListener('click', () => {
        startDateInput.value = '';
    });
    
    document.getElementById('clear-end-date').addEventListener('click', () => {
        endDateInput.value = '';
    });
}

// Validate amount to ensure it's not negative
function validateAmount() {
    const value = parseFloat(amountInput.value);
    if (value < 0) {
        amountInput.value = 0;
    }
}

// Handle login
async function handleLogin() {
    const username = usernameInput.value.trim();
    const password = passwordInput.value;
    
    console.log('Login attempt with username:', username);
    
    // Use AuthService for secure password verification
    const isValid = await AuthService.verifyCredentials(username, password);
    
    if (isValid) {
        console.log('Login successful - storing password for API security');
        
        // Set login status in localStorage
        localStorage.setItem('isLoggedIn', 'true');
        
        // Store password in localStorage for API security
        // CRITICAL: Store the password before proceeding
        SecurityService.storePassword(password);
        
        // Double check password was stored
        const storedPassword = localStorage.getItem('user_password');
        console.log('Password stored successfully:', !!storedPassword);
        
        // Show accounting page
        showAccountingPage();
        
        // Reset login form
        usernameInput.value = '';
        passwordInput.value = '';
        loginError.classList.add('hidden');
    } else {
        console.log('Login failed - invalid credentials');
        loginError.classList.remove('hidden');
    }
}

// Handle logout
function handleLogout() {
    // Clear login status
    localStorage.removeItem('isLoggedIn');
    
    // Clear stored password
    SecurityService.clearStoredPassword();
    
    // Show login page
    showLoginPage();
    
    // Reset form fields
    resetForm();
}

// Reset form fields
function resetForm() {
    // Reset date to today
    const today = new Date();
    dateInput.value = formatDateForInput(today);
    
    // Reset other fields
    amountInput.value = '';
    document.querySelector('input[name="crdr"][value="cr"]').checked = true;
    categorySelect.value = '';
    descriptionInput.value = '';
    
    // Clear selected files
    selectedFiles = [];
    selectedFilesContainer.innerHTML = '';
}

// Handle description input for autocomplete
function handleDescriptionInput() {
    const input = descriptionInput.value.toLowerCase().trim();
    
    // If input is empty, hide autocomplete
    if (input === '') {
        autocompleteContainer.style.display = 'none';
        return;
    }
    
    // Filter suggestions based on input
    const matchingSuggestions = descriptionSuggestions.filter(suggestion => 
        suggestion.toLowerCase().includes(input)
    );
    
    // Display at most 3 suggestions
    const limitedSuggestions = matchingSuggestions.slice(0, 3);
    
    // Show or hide autocomplete container based on matches
    if (limitedSuggestions.length > 0) {
        renderAutocompleteSuggestions(limitedSuggestions);
        autocompleteContainer.style.display = 'block';
    } else {
        autocompleteContainer.style.display = 'none';
    }
}

// Render autocomplete suggestions
function renderAutocompleteSuggestions(suggestions) {
    autocompleteContainer.innerHTML = '';
    
    suggestions.forEach(suggestion => {
        const item = document.createElement('div');
        item.className = 'autocomplete-item';
        item.textContent = suggestion;
        
        // Add click event to select suggestion
        item.addEventListener('click', () => {
            descriptionInput.value = suggestion;
            autocompleteContainer.style.display = 'none';
        });
        
        autocompleteContainer.appendChild(item);
    });
}

// Handle file selection (from camera or file input)
function handleFileSelection(event) {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    // Convert FileList to Array and add to selectedFiles
    Array.from(files).forEach(file => {
        // Store the original file for later upload
        selectedFiles.push(file);
        
        // Display the selected file
        displaySelectedFile(file);
    });
    
    // Reset the input so the same file can be selected again
    event.target.value = '';
}

// Display selected file in the container
function displaySelectedFile(file) {
    const fileDiv = document.createElement('div');
    fileDiv.className = 'file-thumbnail';
    
    // Create file preview or icon based on file type
    if (file.type.startsWith('image/')) {
        // For images, create thumbnail
        const img = document.createElement('img');
        img.src = URL.createObjectURL(file);
        img.alt = file.name;
        img.style.width = '40px';
        img.style.height = '40px';
        img.style.objectFit = 'cover';
        fileDiv.appendChild(img);
    } else {
        // For non-images, show file type icon
        const fileIcon = document.createElement('div');
        fileIcon.className = 'file-icon';
        fileIcon.textContent = getFileTypeIcon(file.type);
        fileDiv.appendChild(fileIcon);
    }
    
    // Add file name
    const fileName = document.createElement('div');
    fileName.className = 'file-name';
    fileName.textContent = file.name;
    fileDiv.appendChild(fileName);
    
    // Add remove button
    const removeBtn = document.createElement('span');
    removeBtn.className = 'file-remove';
    removeBtn.textContent = '×';
    removeBtn.addEventListener('click', () => {
        // Remove file from selectedFiles array
        const fileIndex = selectedFiles.findIndex(f => f === file);
        if (fileIndex !== -1) {
            selectedFiles.splice(fileIndex, 1);
        }
        
        // Remove file div from container
        fileDiv.remove();
    });
    fileDiv.appendChild(removeBtn);
    
    selectedFilesContainer.appendChild(fileDiv);
}

// Get appropriate icon based on file type
function getFileTypeIcon(fileType) {
    if (fileType.startsWith('image/')) return '🖼️';
    if (fileType === 'application/pdf') return '📄';
    if (fileType.includes('excel') || fileType.includes('spreadsheet') || fileType === 'text/csv' || fileType === 'application/vnd.oasis.opendocument.spreadsheet' || fileType === 'application/vnd.google-apps.spreadsheet') return '📊';
    if (fileType === 'text/plain' || fileType === 'application/vnd.oasis.opendocument.text' || fileType === 'application/vnd.google-apps.document') return '📝';
    return '📎';
}

// Generate a file name based on current timestamp and date
function generateFileName(originalFile) {
    const currentTime = Date.now();
    const dateStr = formatDateForFileName(new Date());
    const originalName = originalFile.name;
    
    // Extract file extension and base name
    const lastDotIndex = originalName.lastIndexOf('.');
    let baseName = originalName;
    let extension = '';
    
    if (lastDotIndex !== -1) {
        baseName = originalName.substring(0, lastDotIndex);
        extension = originalName.substring(lastDotIndex); // Keep the dot with extension
    }
    
    // Remove spaces from the base name only
    const cleanBaseName = baseName.replace(/\s+/g, '');
    
    return `${currentTime}-${dateStr}-${cleanBaseName}${extension}`;
}

// Format date as DD-MMM-YYYY for file name
function formatDateForFileName(date) {
    const day = String(date.getDate()).padStart(2, '0');
    
    // Get month name abbreviation
    const monthNames = ["jan", "feb", "mar", "apr", "may", "jun", 
                        "jul", "aug", "sep", "oct", "nov", "dec"];
    const month = monthNames[date.getMonth()];
    
    const year = date.getFullYear();
    
    return `${day}-${month}-${year}`;
}

// Handle form submission
function handleFormSubmit() {
    // Get form values
    const date = dateInput.value;
    const amount = amountInput.value;
    const crdr = document.querySelector('input[name="crdr"]:checked').value;
    const category = categorySelect.value;
    const description = descriptionInput.value;
    
    // Validate form - All fields except files are mandatory
    if (!date || !amount || !category || !description) {
        alert('Please fill all required fields: date, amount, category, and description');
        return;
    }
    
    // Create FormData for API request
    const formData = new FormData();
    formData.append('date', formatDateForAPI(date));
    formData.append('amount', amount);
    formData.append('crdr', crdr.toUpperCase());
    formData.append('category', category);
    formData.append('description', description);
    
    // Add files with renamed filenames
    if (selectedFiles.length > 0) {
        selectedFiles.forEach(file => {
            const renamedFileName = generateFileName(file);
            console.log('Uploading file:', renamedFileName);
            formData.append('file', file, renamedFileName);
        });
    }
    
    // Send the API request
    submitToAPI(formData);
}

// Format date as DD-MMM-YYYY for API
function formatDateForAPI(dateStr) {
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

// Submit form data to API
function submitToAPI(formData) {
    // Show loading state
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';
    
    // Create and show progress container
    const progressContainer = document.createElement('div');
    progressContainer.className = 'progress-container';
    
    const progressBar = document.createElement('div');
    progressBar.className = 'progress-bar';
    progressContainer.appendChild(progressBar);
    
    const progressText = document.createElement('div');
    progressText.className = 'progress-text';
    progressText.textContent = 'Uploading: 0%';
    progressContainer.appendChild(progressText);
    
    // Insert progress after the submit button
    submitBtn.parentNode.insertBefore(progressContainer, submitBtn.nextSibling);
    
    // Use XHR for upload progress tracking
    const xhr = new XMLHttpRequest();
    
    // Handle progress events
    xhr.upload.addEventListener('progress', function(event) {
        if (event.lengthComputable) {
            const percentComplete = Math.round((event.loaded / event.total) * 100);
            progressBar.style.width = percentComplete + '%';
            progressText.textContent = `Uploading: ${percentComplete}%`;
        }
    });
    
    // Handle successful completion
    xhr.addEventListener('load', function() {
        if (xhr.status === 200) {
            // Handle successful upload
            progressBar.style.width = '100%';
            progressText.textContent = 'Upload complete!';
            
            // Hide progress after a moment and reset UI
            setTimeout(() => {
                progressContainer.remove();
                alert('Transaction submitted successfully!');
                resetForm();
                submitBtn.disabled = false;
                submitBtn.textContent = 'Submit';
            }, 1000);
        } else {
            // Handle server error
            console.error('Server responded with error:', xhr.status, xhr.statusText);
            alert(`Error: ${xhr.status} ${xhr.statusText}. Please try again.`);
            // Remove progress container
            progressContainer.remove();
            // Reset button state
            submitBtn.disabled = false;
            submitBtn.textContent = 'Submit';
        }
    });
    
    // Handle request errors
    xhr.addEventListener('error', function() {
        console.error('Network error during transaction submission');
        alert('Network error during submission. Please check your connection and try again.');
        // Remove progress container
        progressContainer.remove();
        // Reset button state
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit';
    });
    
    // Open the request
    xhr.open('POST', CONFIG.API.UPLOAD_ENDPOINT);
    
    // Add security headers
    SecurityService.addSecurityHeadersToXhr(xhr, CONFIG.API.UPLOAD_ENDPOINT);
    
    // Send the request
    xhr.send(formData);
}

// Display entries in the UI
function displayEntries(entries) {
    // Check if we have entries
    if (!Array.isArray(entries) || entries.length === 0) {
        console.log('No entries to display');
        if (totalEntriesLoaded === 0) {
            noEntriesMessage.classList.remove('hidden');
        }
        return;
    }
    
    console.log(`Displaying ${entries.length} entries`);
    console.log('First entry sample:', JSON.stringify(entries[0]).substring(0, 200));
    
    // Clear any previous no entries message
    noEntriesMessage.classList.add('hidden');
    
    // Process each entry
    entries.forEach(entry => {
        console.log('Processing entry:', entry);
        
        // Extract entry data and documents from the response
        let entryData, documents;
        
        if (entry && entry.entry) {
            // Format: { "entry": {...}, "documents": [...] }
            entryData = entry.entry;
            documents = entry.documents || [];
            console.log('Found entry/documents structure');
        } else if (entry && (entry.id || entry._id)) {
            // Direct entry format
            entryData = entry;
            documents = entry.documents || entry.files || [];
            console.log('Found direct entry with ID');
        } else {
            console.error('Unexpected entry format:', entry);
            return; // Skip this entry
        }
        
        console.log('Entry data:', entryData);
        console.log('Documents:', documents);
        
        // Create the entry card
        const entryCard = document.createElement('div');
        entryCard.className = 'entry-card';
        entryCard.setAttribute('data-entry-id', entryData.id || entryData._id || '');
        
        // Create header with date only (no ID as requested)
        const headerDiv = document.createElement('div');
        headerDiv.className = 'entry-header';
        
        // Date element
        const dateDiv = document.createElement('div');
        dateDiv.className = 'entry-date';
        
        // Handle different date formats
        let dateValue = 'Unknown date';
        if (entryData.date) {
            dateValue = formatDateFromString(entryData.date);
        } else if (entryData.entry_date) {
            dateValue = formatDateFromString(entryData.entry_date);
        } else if (entryData.transaction_date) {
            dateValue = formatDateFromString(entryData.transaction_date);
        }
        dateDiv.textContent = dateValue;
        
        // Store ID as a data attribute but don't display it
        headerDiv.setAttribute('data-entry-id', entryData.id || entryData._id || '');
        
        headerDiv.appendChild(dateDiv);
        
        // Amount section
        const amountDiv = document.createElement('div');
        amountDiv.className = 'entry-amount';
        
        // Handle amount and credit/debit type
        let amountValue = 'N/A';
        let creditDebit = '';
        
        if (entryData.amount !== undefined) {
            amountValue = entryData.amount;
        } else if (entryData.transaction_amount !== undefined) {
            amountValue = entryData.transaction_amount;
        } else if (entryData.value !== undefined) {
            amountValue = entryData.value;
        }
        
        // Format the amount if it's a number
        const numAmount = parseFloat(amountValue);
        if (!isNaN(numAmount)) {
            amountValue = numAmount.toFixed(2);
        }
        
        // Determine credit/debit type
        if (entryData.cr_dr) {
            creditDebit = entryData.cr_dr.toUpperCase();
        } else if (entryData.type) {
            creditDebit = entryData.type.toUpperCase();
        } else if (entryData.transaction_type) {
            creditDebit = entryData.transaction_type.toUpperCase();
        }
        
        // Apply styling based on credit/debit
        if (creditDebit.includes('CR') || creditDebit.includes('CREDIT')) {
            amountDiv.classList.add('amount-credit');
            // For credit entries, display amount normally
            amountDiv.textContent = amountValue;
        } else if (creditDebit.includes('DR') || creditDebit.includes('DEBIT')) {
            amountDiv.classList.add('amount-debit');
            // For debit entries, prefix with a negative sign
            amountDiv.textContent = `-${amountValue}`;
        } else {
            // If no credit/debit info, just show the amount
            amountDiv.textContent = amountValue;
        }
        
        // Details section
        const detailsDiv = document.createElement('div');
        detailsDiv.className = 'entry-details';
        
        // Category
        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'entry-category';
        categoryDiv.textContent = entryData.category || entryData.group || 'Uncategorized';
        
        // Description
        const descriptionDiv = document.createElement('div');
        descriptionDiv.className = 'entry-description';
        descriptionDiv.textContent = entryData.description || entryData.desc || entryData.note || '';
        
        detailsDiv.appendChild(categoryDiv);
        detailsDiv.appendChild(descriptionDiv);
        
        // Documents section
        let documentsDiv = null;
        if (documents && documents.length > 0) {
            documentsDiv = document.createElement('div');
            documentsDiv.className = 'entry-documents';
            
            const documentsTitle = document.createElement('div');
            documentsTitle.className = 'documents-title';
            documentsTitle.textContent = 'Documents';
            documentsDiv.appendChild(documentsTitle);
            
            // Create links for each document
            documents.forEach(doc => {
                const docLink = createDocumentLink(doc);
                documentsDiv.appendChild(docLink);
            });
        }
        
        // Build the card
        entryCard.appendChild(headerDiv);
        entryCard.appendChild(amountDiv);
        entryCard.appendChild(detailsDiv);
        if (documentsDiv) {
            entryCard.appendChild(documentsDiv);
        }
        
        // Add to container
        entriesContainer.appendChild(entryCard);
    });
}

// Helper function to format date from string
function formatDateFromString(dateString) {
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

// Create a document link
function createDocumentLink(doc) {
    if (!doc) {
        console.error('Invalid document object');
        return document.createTextNode('');
    }
    
    const docLink = document.createElement('a');
    docLink.className = 'document-link';
    
    // Extract the URL from different possible structures
    let publicUrl = '';
    if (doc.publicUrl) {
        publicUrl = doc.publicUrl;
    } else if (doc.public_url) {
        publicUrl = doc.public_url;
    } else if (doc.url) {
        publicUrl = doc.url;
    } else if (doc.link) {
        publicUrl = doc.link;
    } else if (doc.path) {
        publicUrl = doc.path;
    } else if (doc.file_path) {
        publicUrl = doc.file_path;
    } else if (typeof doc === 'string') {
        publicUrl = doc;
    }
    
    if (!publicUrl) {
        console.error('No URL found in document object:', doc);
        return document.createTextNode('');
    }
    
    docLink.onclick = function(e) {
        e.preventDefault();
        openDocument(publicUrl);
    };
    
    // Get document icon
    const docIcon = document.createElement('span');
    docIcon.className = 'document-icon';
    
    // Determine icon based on name or extension
    let docName = doc.name || doc.filename || doc.file_name || doc.title || '';
    if (typeof docName !== 'string') {
        docName = 'Document';
    }
    
    let icon = '📄';
    
    // Try to determine icon based on file extension
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
    docLink.appendChild(document.createTextNode(docName || 'Document'));
    
    return docLink;
}

// Determine document icon based on file extension
function getDocumentIcon(filePath) {
    const ext = filePath.split('.').pop().toLowerCase();
    
    switch(ext) {
        case 'pdf': return '📄'; // 📄
        case 'jpg':
        case 'jpeg':
        case 'png':
        case 'gif': return '🖼️'; // 🖼️
        case 'doc':
        case 'docx': return '📝'; // 📝
        case 'xls':
        case 'xlsx':
        case 'csv': return '📊'; // 📊
        case 'ppt':
        case 'pptx': return '📊'; // 📊
        default: return '📎'; // 📎
    }
}

// Open document in new tab
function openDocument(publicUrl) {
    if (!publicUrl) {
        console.error('Cannot open document: URL is empty');
        return;
    }
    
    // Import document URL service here to avoid circular dependencies
    import('./js/services/documentUrlService.js').then(module => {
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

// Load entries from API
function loadEntries() {
    // Show loading message
    loadingMessage.classList.remove('hidden');
    loadMoreBtn.classList.add('hidden');
    
    // Prepare API request body
    const requestBody = {
        limit: pageSize,
        pageNumber: currentPage
    };
    
    // Only add filters if they have values
    if (currentFilters.queryString) {
        requestBody.queryString = currentFilters.queryString;
    }
    
    if (currentFilters.startDate) {
        requestBody.startDate = currentFilters.startDate;
    }
    
    if (currentFilters.endDate) {
        requestBody.endDate = currentFilters.endDate;
    }
    
    console.log('Loading entries with filters:', requestBody);
    
    // Create fetch options with security headers
    const fetchOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
    };
    
    // Add security headers
    SecurityService.addSecurityHeadersToFetchOptions(fetchOptions, CONFIG.API.FILTER_ENDPOINT);
    
    // Use fetch API to load data
    fetch(CONFIG.API.FILTER_ENDPOINT, fetchOptions)
    .then(response => {
        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('API response:', data);
        
        // Hide loading message
        loadingMessage.classList.add('hidden');
        
        // Reset filter button state
        filterBtn.classList.remove('btn-loading');
        filterBtn.disabled = false;
        
        // Handle the response format - the API returns a specific format as shown in the example
        // Example format: [{ "response": [{ "entry": {...}, "documents": [...] }] }]
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
        
        // Print the first entry for debugging
        if (entriesArray.length > 0) {
            console.log('First entry sample:', JSON.stringify(entriesArray[0]).substring(0, 200));
        } else {
            console.error('No entries found in the API response');
        }
        
        // Check if there are entries
        if (entriesArray && entriesArray.length > 0) {
            // Display entries
            displayEntries(entriesArray);
            
            // Update total entries loaded
            totalEntriesLoaded += entriesArray.length;
            
            // Show load more button if there are likely more entries
            if (entriesArray.length === pageSize) {
                loadMoreBtn.classList.remove('hidden');
            } else {
                loadMoreBtn.classList.add('hidden');
            }
            
            // Hide no entries message if it was visible
            noEntriesMessage.classList.add('hidden');
        } else {
            // Show no entries message if no entries are found
            if (totalEntriesLoaded === 0) {
                // Check if filters are applied to customize message
                const hasFilters = currentFilters.queryString || currentFilters.startDate || currentFilters.endDate;
                
                if (hasFilters) {
                    noEntriesMessage.textContent = 'No entries found matching your filters.';
                } else {
                    noEntriesMessage.textContent = 'No entries found. Try adding some transactions first.';
                }
                
                noEntriesMessage.classList.remove('hidden');
                loadMoreBtn.classList.add('hidden');
            } else {
                // All entries loaded
                loadMoreBtn.classList.add('hidden');
            }
        }
        
        // If we received data but couldn't parse it properly, log an error
        if (data && (!entriesArray || entriesArray.length === 0) && typeof data === 'object') {
            console.warn('Received data from API but could not parse entries:', data);
            if (totalEntriesLoaded === 0) {
                noEntriesMessage.textContent = 'Error parsing server response. Please try again or contact support.';
                noEntriesMessage.classList.remove('hidden');
            }
        }
    })
    .catch(error => {
        console.error('Error loading entries:', error);
        loadingMessage.classList.add('hidden');
        
        // Reset filter button state
        filterBtn.classList.remove('btn-loading');
        filterBtn.disabled = false;
        
        // Show error message
        noEntriesMessage.textContent = 'Error loading entries. Please try again.';
        noEntriesMessage.classList.remove('hidden');
    });
}

// Load more entries
function loadMoreEntries() {
    // Increment page number
    currentPage++;
    
    // Load entries
    loadEntries();
}

// Apply filters and load entries
function applyFilters() {
    // Add loading state to filter button
    filterBtn.classList.add('btn-loading');
    filterBtn.disabled = true;
    
    // Reset pagination
    currentPage = 1;
    totalEntriesLoaded = 0;
    entriesContainer.innerHTML = '';
    loadingMessage.classList.remove('hidden');
    noEntriesMessage.classList.add('hidden');
    loadMoreBtn.classList.add('hidden');
    
    // Update current filters
    currentFilters = {
        queryString: queryStringInput.value.trim(),
        startDate: startDateInput.value ? formatDateForAPI(startDateInput.value) : '',
        endDate: endDateInput.value ? formatDateForAPI(endDateInput.value) : ''
    };
    
    console.log('Applying filters:', currentFilters);
    
    // Load entries with new filters
    loadEntries();
}

// Reset filters
function resetFilters() {
    // Add loading state to reset button
    resetFilterBtn.classList.add('btn-loading');
    resetFilterBtn.disabled = true;
    
    // Clear all filter inputs
    queryStringInput.value = '';
    startDateInput.value = '';
    endDateInput.value = '';
    
    // Apply the cleared filters
    applyFilters();
    
    // Reset button will be reset when loadEntries completes
    setTimeout(() => {
        resetFilterBtn.classList.remove('btn-loading');
        resetFilterBtn.disabled = false;
    }, 500);
}

// Initialize the application when the page loads
window.addEventListener('DOMContentLoaded', init);
