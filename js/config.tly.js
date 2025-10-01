/**
 * Configuration settings for the accounting application
 */

const CONFIG = {
    // API endpoints
    API: {
        UPLOAD_ENDPOINT: '<<Upload url>>',
        FILTER_ENDPOINT: '<<Filter url>>',
        CATEGORY_AUTOCOMPLETE_ENDPOINT: '<<Categories url>>',
        DESCRIPTION_AUTOCOMPLETE_ENDPOINT: '<<Descriptions url>>',
        EXPORT_ENDPOINT: '<<Export url>>'
    },

    // Authentication
    AUTH: {
        USERNAME: '<<Username>>',
        PASSWORD: '<<bcrypt_password_hash>>' // bcrypt hash for security
    },

    // Application settings
    SETTINGS: {
        PAGE_SIZE: 20,
        AUTOCOMPLETE_DEBOUNCE_MS: 200,
        AUTOCOMPLETE_MIN_CHARS: 1
    },

    // Predefined data
    DATA: {
        // Common description suggestions for autocomplete
        DESCRIPTION_SUGGESTIONS: [
            'Grocery shopping', 'Rent payment', 'Salary deposit', 'Electricity bill',
            'Water bill', 'Internet bill', 'Phone bill', 'Car maintenance',
            'Fuel refill', 'Restaurant meal', 'Movie tickets', 'Medical expense',
            'Insurance payment', 'Bank interest', 'Office supplies', 'Home repairs',
            'Public transport', 'Taxi fare', 'Gym membership', 'Online subscription',
            'Birthday gift', 'Clothing purchase', 'Electronics purchase', 'Book purchase',
            'Coffee shop', 'Parking fee', 'Toll fee', 'Hotel booking',
            'Flight tickets', 'Train tickets', 'Bus tickets', 'Rental car'
        ]
    }
};

export default CONFIG;
