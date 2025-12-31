/**
 * Global Configuration for the Application
 * Store all API keys and environment specific variables here.
 */

const config = {
    // Backend API URL
    API_URL: "http://localhost:5002/api",

    // Payment Gateway Configuration
    PAYMENT: {
        PROVIDER: "Razorpay", // 'Razorpay' or 'Stripe'

        // Stripe Public Key (Publishable Key)
        STRIPE_PUBLIC_KEY: "", // To be provided via environment/build

        // Razorpay Key ID
        RAZORPAY_KEY_ID: "rzp_test_RyDk9obH1c0TIc" // To be provided via environment/build
    },

    // Feature Flags
    FEATURES: {
        ENABLE_NOTIFICATIONS: true,
        ENABLE_DARK_MODE: false
    }
};

export default config;
