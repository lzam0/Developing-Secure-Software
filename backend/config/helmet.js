// Helmet is a collectio of functions that sets security headers (rules) so no one can perform attacks
// Security headers are set of instructions for the browser to follow because of the rules we set in our configuratio
export function getHelmetConfig({ isProduction = process.env.NODE_ENV === "production" } = {}) {
    const config = {
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],  // Only allow content from our server
                scriptSrc: ["'self'", "https://www.google.com/recaptcha/", "https://www.gstatic.com/recaptcha/"], // Only run javascript files that come from our server
                connectSrc: ["'self'", "https://www.google.com/recaptcha/"], // Controls where the browser can send network requests to
                imgSrc: ["'self'", "data:"], // Only allow images from our server and data URIs (for inline images)
                fontSrc: ["'self'"], // Only allow fonts from our server
                objectSrc: ["'none'"], // Disallow all plugins (like Flash, Java, etc.)
                frameSrc: ["https://www.google.com/recaptcha/"], // Only allow iframes from Google reCAPTCHA
                frameAncestors: ["'none'"] // Disallow our site from being embedded in iframes (prevents clickjacking)
            }
        }
    }; 

    // Disable HTTP Strict Transport Security (HSTS) in development to avoid issues with localhost and self-signed certificates
    if (!isProduction) {
        config.strictTransportSecurity = false;
    }

    return config;
}
