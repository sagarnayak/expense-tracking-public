/**
 * Accounting Form component for handling transaction entry form
 */

import CONFIG from '../config.js';
import * as FileUpload from './fileUpload.js';
import * as ApiService from '../services/api.js';
import * as Formatter from '../utils/formatter.js';
import * as FileUtils from '../utils/fileUtils.js';
import * as AutocompleteService from '../services/autocompleteService.js';

/**
 * Initialize the accounting form component
 */
export function init() {
    // DOM Elements
    const dateInput = document.getElementById('date');
    const amountInput = document.getElementById('amount');
    const categoryInput = document.getElementById('category');
    const descriptionInput = document.getElementById('description');
    const categoryAutocompleteContainer = document.getElementById('category-autocomplete-container');
    const descriptionAutocompleteContainer = document.getElementById('autocomplete-container');
    const submitBtn = document.getElementById('submit-btn');
    
    // Set up file upload functionality
    const fileUploadController = FileUpload.init();
    
    // Set today's date as default
    const today = new Date();
    const formattedDate = Formatter.formatDateForInput(today);
    if (dateInput) {
        dateInput.value = formattedDate;
    }
    
    // Set up event listeners
    if (amountInput) {
        amountInput.addEventListener('input', validateAmount);
    }
    
    // Set up category autocomplete
    if (categoryInput) {
        const debouncedCategoryFetch = AutocompleteService.createDebouncedCategoryFetch((suggestions) => {
            renderAutocompleteSuggestions(suggestions, categoryAutocompleteContainer, categoryInput);
        });
        
        categoryInput.addEventListener('input', () => {
            const inputValue = categoryInput.value.trim();
            if (inputValue.length > 0) {
                debouncedCategoryFetch(inputValue);
            } else {
                renderAutocompleteSuggestions([], categoryAutocompleteContainer, categoryInput);
            }
        });
        
        // Hide suggestions when clicking outside
        document.addEventListener('click', (e) => {
            if (e.target !== categoryInput && !categoryAutocompleteContainer.contains(e.target)) {
                categoryAutocompleteContainer.innerHTML = '';
            }
        });
    }
    
    // Set up description autocomplete
    if (descriptionInput) {
        const debouncedDescriptionFetch = AutocompleteService.createDebouncedDescriptionFetch((suggestions) => {
            renderAutocompleteSuggestions(suggestions, descriptionAutocompleteContainer, descriptionInput);
        });
        
        descriptionInput.addEventListener('input', () => {
            const inputValue = descriptionInput.value.trim();
            if (inputValue.length > 0) {
                debouncedDescriptionFetch(inputValue);
            } else {
                renderAutocompleteSuggestions([], descriptionAutocompleteContainer, descriptionInput);
            }
        });
        
        // Hide suggestions when clicking outside
        document.addEventListener('click', (e) => {
            if (e.target !== descriptionInput && !descriptionAutocompleteContainer.contains(e.target)) {
                descriptionAutocompleteContainer.innerHTML = '';
            }
        });
    }
    
    if (submitBtn) {
        submitBtn.addEventListener('click', () => {
            handleFormSubmit(
                dateInput,
                amountInput,
                categoryInput,
                descriptionInput,
                submitBtn,
                fileUploadController
            );
        });
    }
    
    // Return controller for external use
    return {
        reset: () => resetForm(dateInput, amountInput, categoryInput, descriptionInput, fileUploadController)
    };
}

/**
 * Reset form fields
 * @param {HTMLElement} dateInput - Date input element
 * @param {HTMLElement} amountInput - Amount input element
 * @param {HTMLElement} categorySelect - Category select element
 * @param {HTMLElement} descriptionInput - Description input element
 * @param {Object} fileUploadController - File upload controller
 */
export function resetForm(dateInput, amountInput, categoryInput, descriptionInput, fileUploadController) {
    // Reset date to today
    const today = new Date();
    if (dateInput) {
        dateInput.value = Formatter.formatDateForInput(today);
    }
    
    // Reset other fields
    if (amountInput) {
        amountInput.value = '';
    }
    
    const creditRadio = document.querySelector('input[name="crdr"][value="cr"]');
    if (creditRadio) {
        creditRadio.checked = true;
    }
    
    if (categoryInput) {
        categoryInput.value = '';
    }
    
    if (descriptionInput) {
        descriptionInput.value = '';
    }
    
    // Clear selected files
    if (fileUploadController) {
        fileUploadController.clearSelectedFiles();
    }
}

/**
 * Validate amount to ensure it's not negative
 */
function validateAmount() {
    const amountInput = document.getElementById('amount');
    if (!amountInput) return;
    
    const value = parseFloat(amountInput.value);
    if (value < 0) {
        amountInput.value = 0;
    }
}

/**
 * Render autocomplete suggestions
 * @param {Array} suggestions - Filtered suggestions to display
 * @param {HTMLElement} container - Container to render suggestions in
 * @param {HTMLElement} inputElement - Input element to update on selection
 */
function renderAutocompleteSuggestions(suggestions, container, inputElement) {
    // Clear previous suggestions
    container.innerHTML = '';
    
    if (suggestions.length === 0) {
        return;
    }
    
    // Create and append suggestions
    const suggestionsList = document.createElement('div');
    suggestionsList.className = 'suggestions-list';
    
    suggestions.forEach(suggestion => {
        const item = document.createElement('div');
        item.className = 'suggestion-item';
        item.textContent = suggestion;
        item.addEventListener('click', () => {
            inputElement.value = suggestion;
            container.innerHTML = ''; // Clear suggestions after selection
        });
        suggestionsList.appendChild(item);
    });
    
    container.appendChild(suggestionsList);
    
    // Position the container properly
    container.style.display = 'block';
    container.style.width = inputElement.offsetWidth + 'px';
}

/**
 * Handle form submission
 * @param {HTMLElement} dateInput - Date input element
 * @param {HTMLElement} amountInput - Amount input element
 * @param {HTMLElement} categorySelect - Category select element
 * @param {HTMLElement} descriptionInput - Description input element
 * @param {HTMLElement} submitBtn - Submit button element
 * @param {Object} fileUploadController - File upload controller
 */
function handleFormSubmit(dateInput, amountInput, categorySelect, descriptionInput, submitBtn, fileUploadController) {
    // Check if elements exist
    if (!dateInput || !amountInput || !categorySelect || !descriptionInput || !submitBtn) {
        console.error('Form elements not found');
        return;
    }
    
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
    formData.append('date', Formatter.formatDateForAPI(date));
    formData.append('amount', amount);
    formData.append('crdr', crdr.toUpperCase());
    formData.append('category', category);
    formData.append('description', description);
    
    // Get selected files
    const selectedFiles = fileUploadController ? fileUploadController.getSelectedFiles() : [];
    
    // Add files with renamed filenames
    if (selectedFiles.length > 0) {
        selectedFiles.forEach(file => {
            const renamedFileName = FileUtils.generateFileName(file);
            console.log('Uploading file:', renamedFileName);
            formData.append('file', file, renamedFileName);
        });
    }
    
    // Create and show progress container
    const progressContainer = createProgressContainer();
    const progressBar = progressContainer.querySelector('.progress-bar');
    const progressText = progressContainer.querySelector('.progress-text');
    
    // Insert progress after the submit button
    submitBtn.parentNode.insertBefore(progressContainer, submitBtn.nextSibling);
    
    // Show loading state
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';
    
    // Send the API request
    const xhr = ApiService.submitTransaction(
        formData,
        // Progress callback
        (percentComplete) => {
            progressBar.style.width = percentComplete + '%';
            progressText.textContent = `Uploading: ${percentComplete}%`;
        },
        // Success callback
        () => {
            alert('Transaction submitted successfully!');
            resetForm(dateInput, amountInput, categorySelect, descriptionInput, fileUploadController);
            progressContainer.remove();
            submitBtn.disabled = false;
            submitBtn.textContent = 'Submit';
        },
        // Error callback
        (errorMessage) => {
            alert(errorMessage);
            progressContainer.remove();
            submitBtn.disabled = false;
            submitBtn.textContent = 'Submit';
        }
    );
}

/**
 * Create a progress container for tracking upload progress
 * @returns {HTMLElement} Progress container element
 */
function createProgressContainer() {
    const progressContainer = document.createElement('div');
    progressContainer.className = 'progress-container';
    
    const progressBar = document.createElement('div');
    progressBar.className = 'progress-bar';
    progressContainer.appendChild(progressBar);
    
    const progressText = document.createElement('div');
    progressText.className = 'progress-text';
    progressText.textContent = 'Uploading: 0%';
    progressContainer.appendChild(progressText);
    
    return progressContainer;
}
