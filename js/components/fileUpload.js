/**
 * File upload component for handling file selection and preview
 */

import * as FileUtils from '../utils/fileUtils.js';

/**
 * Initialize file upload functionality
 * @param {Function} onFileChange - Callback when files are added/removed
 * @returns {Object} Controller object with methods for managing files
 */
export function init(onFileChange) {
    // DOM Elements
    const cameraInput = document.getElementById('camera-input');
    const fileInput = document.getElementById('file-input');
    const selectedFilesContainer = document.getElementById('selected-files-container');
    
    // Internal state
    let selectedFiles = [];
    
    // Set up event listeners
    if (cameraInput) {
        cameraInput.addEventListener('change', (event) => {
            handleFileSelection(event, selectedFiles, selectedFilesContainer, onFileChange);
        });
    }
    
    if (fileInput) {
        fileInput.addEventListener('change', (event) => {
            handleFileSelection(event, selectedFiles, selectedFilesContainer, onFileChange);
        });
    }
    
    // Return controller for external use
    return {
        getSelectedFiles: () => selectedFiles,
        clearSelectedFiles: () => {
            selectedFiles = [];
            if (selectedFilesContainer) {
                selectedFilesContainer.innerHTML = '';
            }
            if (onFileChange) {
                onFileChange(selectedFiles);
            }
        }
    };
}

/**
 * Handle file selection (from camera or file input)
 * @param {Event} event - Change event from input
 * @param {Array} selectedFiles - Array to store selected files
 * @param {HTMLElement} selectedFilesContainer - Container for displaying selected files
 * @param {Function} onFileChange - Callback when files change
 */
function handleFileSelection(event, selectedFiles, selectedFilesContainer, onFileChange) {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    // Convert FileList to Array and add to selectedFiles
    Array.from(files).forEach(file => {
        // Store the original file for later upload
        selectedFiles.push(file);
        
        // Display the selected file
        displaySelectedFile(file, selectedFiles, selectedFilesContainer, onFileChange);
    });
    
    // Reset the input so the same file can be selected again
    event.target.value = '';
    
    // Call the callback if provided
    if (onFileChange) {
        onFileChange(selectedFiles);
    }
}

/**
 * Display selected file in the container
 * @param {File} file - Selected file
 * @param {Array} selectedFiles - Reference to the selectedFiles array
 * @param {HTMLElement} selectedFilesContainer - Container to display files in
 * @param {Function} onFileChange - Callback when files change
 */
function displaySelectedFile(file, selectedFiles, selectedFilesContainer, onFileChange) {
    if (!selectedFilesContainer) return;
    
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
        fileIcon.textContent = FileUtils.getFileTypeIcon(file.type);
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
        
        // Call the callback if provided
        if (onFileChange) {
            onFileChange(selectedFiles);
        }
    });
    fileDiv.appendChild(removeBtn);
    
    selectedFilesContainer.appendChild(fileDiv);
}
