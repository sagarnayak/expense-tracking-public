/**
 * bcrypt.js
 * Secure password verification using bcryptjs from CDN
 */

(function(root) {
    'use strict';
    
    const bcrypt = {};
    
    /**
     * Compares a password against a bcrypt hash from the config
     * Uses real bcrypt verification via the bcryptjs library loaded from CDN
     * 
     * @param {string} password - The password to check from user input
     * @param {string} hash - The hash from CONFIG.AUTH.PASSWORD
     * @returns {Promise<boolean>} - Promise resolving to true if passwords match
     */
    bcrypt.compare = function(password, hash) {
        return new Promise(function(resolve) {
            if (!password || !hash) {
                console.error('Missing password or hash');
                resolve(false);
                return;
            }
            
            try {
                console.log('Verifying password with real bcrypt...');
                
                // Use the bcryptjs library from CDN for real bcrypt verification
                // This does proper cryptographic comparison with the stored hash
                if (typeof dcodeIO !== 'undefined' && dcodeIO.bcrypt) {
                    // If loaded as dcodeIO.bcrypt (older versions or certain CDNs)
                    dcodeIO.bcrypt.compare(password, hash, function(err, result) {
                        if (err) {
                            console.error('Bcrypt error:', err);
                            resolve(false);
                            return;
                        }
                        console.log('Password verification result:', result ? 'valid' : 'invalid');
                        resolve(result);
                    });
                } else if (typeof bcryptjs !== 'undefined') {
                    // If loaded as bcryptjs (common CDN format)
                    bcryptjs.compare(password, hash, function(err, result) {
                        if (err) {
                            console.error('Bcrypt error:', err);
                            resolve(false);
                            return;
                        }
                        console.log('Password verification result:', result ? 'valid' : 'invalid');
                        resolve(result);
                    });
                } else {
                    // Fall back to global bcrypt object
                    // This is how it's exposed in the CDN we added
                    console.log('Using global bcrypt object');
                    // The CDN script creates a global 'dcodeIO' object with bcrypt
                    window.bcrypt.compare(password, hash, function(err, result) {
                        if (err) {
                            console.error('Bcrypt error:', err);
                            resolve(false);
                            return;
                        }
                        console.log('Password verification result:', result ? 'valid' : 'invalid');
                        resolve(result);
                    });
                }
            } catch (error) {
                console.error('Error in bcrypt comparison:', error);
                resolve(false);
            }
        });
    };
    
    /**
     * Hash a password using bcrypt
     * @param {string} password - Password to hash
     * @param {number} rounds - Number of bcrypt rounds (default: 12)
     * @returns {Promise<string>} - Promise resolving to the hash
     */
    bcrypt.hash = function(password, rounds) {
        rounds = rounds || 12;
        return new Promise(function(resolve, reject) {
            try {
                // Use the bcrypt library from CDN
                if (typeof dcodeIO !== 'undefined' && dcodeIO.bcrypt) {
                    dcodeIO.bcrypt.genSalt(rounds, function(err, salt) {
                        if (err) {
                            reject(err);
                            return;
                        }
                        dcodeIO.bcrypt.hash(password, salt, function(err, hash) {
                            if (err) {
                                reject(err);
                                return;
                            }
                            resolve(hash);
                        });
                    });
                } else if (typeof bcryptjs !== 'undefined') {
                    bcryptjs.genSalt(rounds, function(err, salt) {
                        if (err) {
                            reject(err);
                            return;
                        }
                        bcryptjs.hash(password, salt, function(err, hash) {
                            if (err) {
                                reject(err);
                                return;
                            }
                            resolve(hash);
                        });
                    });
                } else {
                    // Fall back to global bcrypt object
                    window.bcrypt.genSalt(rounds, function(err, salt) {
                        if (err) {
                            reject(err);
                            return;
                        }
                        window.bcrypt.hash(password, salt, function(err, hash) {
                            if (err) {
                                reject(err);
                                return;
                            }
                            resolve(hash);
                        });
                    });
                }
            } catch (error) {
                reject(error);
            }
        });
    };
    
    // Export the bcrypt object
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = bcrypt;
    } else {
        root.bcrypt = bcrypt;
    }
})(typeof globalThis !== 'undefined' ? globalThis : this);

export default bcrypt;
