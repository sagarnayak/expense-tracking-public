/**
 * Authentication component handling login and logout functionality
 */

import CONFIG from '../config.js';
import * as StorageService from '../services/storage.js';
import * as AuthService from '../services/authService.js';

/**
 * Initialize the auth component
 * @param {Function} onLoginSuccess - Callback when login is successful
 * @param {Function} onLogout - Callback when user logs out
 */
export function init(onLoginSuccess, onLogout) {
    // Get DOM elements
    const loginBtn = document.getElementById('login-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const listLogoutBtn = document.getElementById('list-logout-btn');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const loginError = document.getElementById('login-error');
    
    // Set up event listeners
    if (loginBtn) {
        loginBtn.addEventListener('click', () => handleLogin(
            usernameInput,
            passwordInput,
            loginError,
            onLoginSuccess
        ));
    }
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => handleLogout(onLogout));
    }
    
    if (listLogoutBtn) {
        listLogoutBtn.addEventListener('click', () => handleLogout(onLogout));
    }
    
    // Check login status
    return checkLoginStatus();
}

/**
 * Check if user is already logged in
 * @returns {boolean} True if user is logged in
 */
export function checkLoginStatus() {
    return StorageService.isLoggedIn();
}

/**
 * Handle login form submission
 * @param {HTMLElement} usernameInput - Username input element
 * @param {HTMLElement} passwordInput - Password input element
 * @param {HTMLElement} loginError - Login error message element
 * @param {Function} onLoginSuccess - Callback when login is successful
 */
async function handleLogin(usernameInput, passwordInput, loginError, onLoginSuccess) {
    const username = usernameInput.value.trim();
    const password = passwordInput.value;
    
    console.log('Login attempt with username:', username);
    
    // Use AuthService for credential verification
    const isValid = await AuthService.verifyCredentials(username, password);
    
    if (isValid) {
        console.log('Login successful - storing credentials');
        
        // Set login status in localStorage
        StorageService.setLoggedIn();
        
        // Store password for HMAC security
        StorageService.storePassword(password);
        
        // Verify password was stored correctly
        const storedPassword = StorageService.getStoredPassword();
        console.log('Password stored successfully:', !!storedPassword);
        
        // Reset login form
        usernameInput.value = '';
        passwordInput.value = '';
        if (loginError) {
            loginError.classList.add('hidden');
        }
        
        // Call success callback
        if (onLoginSuccess) {
            onLoginSuccess();
        }
    } else {
        console.log('Login failed - invalid credentials');
        if (loginError) {
            loginError.classList.remove('hidden');
        }
    }
}

/**
 * Handle logout
 * @param {Function} onLogout - Callback when user logs out
 */
function handleLogout(onLogout) {
    // Clear login status
    StorageService.clearLoginStatus();
    
    // Call logout callback
    if (onLogout) {
        onLogout();
    }
}
