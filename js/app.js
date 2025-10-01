/**
 * Main application entry point
 * Initializes and coordinates all components of the accounting application
 */

import * as AuthComponent from './components/auth.js';
import * as AccountingFormComponent from './components/accountingForm.js';
import * as FileUploadComponent from './components/fileUpload.js';
import * as ListingViewComponent from './components/listingView.js';

// DOM Elements for different screens
const loginScreen = document.getElementById('login-container');
const accountingScreen = document.getElementById('accounting-container');
const listingScreen = document.getElementById('listing-container');
const navListingBtn = document.getElementById('list-btn');
const navAccountingBtn = document.getElementById('add-entry-btn');

// Initialize the application
function init() {
    console.log('Initializing application...');
    
    // Initialize components
    const accountingForm = AccountingFormComponent.init();
    const listingView = ListingViewComponent.init();
    
    // Set up navigation
    setupNavigation(navAccountingBtn, navListingBtn, accountingScreen, listingScreen);
    
    // Initialize authentication with callbacks for login/logout
    const isLoggedIn = AuthComponent.init(
        // Login success callback
        () => {
            showScreen(accountingScreen);
            hideScreen(loginScreen);
            hideScreen(listingScreen);
        },
        // Logout callback
        () => {
            showScreen(loginScreen);
            hideScreen(accountingScreen);
            hideScreen(listingScreen);
        }
    );
    
    // Show initial screen based on login status
    if (isLoggedIn) {
        hideScreen(loginScreen);
        showScreen(accountingScreen);
        hideScreen(listingScreen);
    } else {
        showScreen(loginScreen);
        hideScreen(accountingScreen);
        hideScreen(listingScreen);
    }
    
    // Add click handlers for navigation buttons
    if (navAccountingBtn) {
        navAccountingBtn.addEventListener('click', () => {
            showScreen(accountingScreen);
            hideScreen(listingScreen);
        });
    }
    
    if (navListingBtn) {
        navListingBtn.addEventListener('click', () => {
            hideScreen(accountingScreen);
            showScreen(listingScreen);
            // Load entries when switching to listing screen
            listingView.loadEntries();
        });
    }
    
    console.log('Application initialized');
}

/**
 * Set up navigation between screens
 * @param {HTMLElement} navAccountingBtn - Navigation button for accounting screen
 * @param {HTMLElement} navListingBtn - Navigation button for listing screen
 * @param {HTMLElement} accountingScreen - Accounting screen element
 * @param {HTMLElement} listingScreen - Listing screen element
 */
function setupNavigation(navAccountingBtn, navListingBtn, accountingScreen, listingScreen) {
    // Add active class to navigation buttons based on current screen
    if (navAccountingBtn && navListingBtn) {
        navAccountingBtn.addEventListener('click', () => {
            navAccountingBtn.classList.add('active');
            navListingBtn.classList.remove('active');
        });
        
        navListingBtn.addEventListener('click', () => {
            navListingBtn.classList.add('active');
            navAccountingBtn.classList.remove('active');
        });
        
        // Set default active state
        navAccountingBtn.classList.add('active');
    }
}

/**
 * Show a screen element
 * @param {HTMLElement} screen - Screen element to show
 */
function showScreen(screen) {
    if (screen) {
        screen.classList.remove('hidden');
    }
}

/**
 * Hide a screen element
 * @param {HTMLElement} screen - Screen element to hide
 */
function hideScreen(screen) {
    if (screen) {
        screen.classList.add('hidden');
    }
}

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', init);

// Export init function for direct use
export { init };
