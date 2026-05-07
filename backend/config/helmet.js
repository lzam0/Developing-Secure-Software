export function getHelmetConfig({ isProduction = process.env.NODE_ENV === "production" } = {}) {
    const config = {
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'", "https://www.google.com/recaptcha/", "https://www.gstatic.com/recaptcha/"],
                connectSrc: ["'self'", "https://www.google.com/recaptcha/"],
                imgSrc: ["'self'", "data:"],
                fontSrc: ["'self'"],
                objectSrc: ["'none'"],
                frameSrc: ["https://www.google.com/recaptcha/"],
                frameAncestors: ["'none'"]
            }
        }
    };

    if (!isProduction) {
        config.strictTransportSecurity = false;
    }

    return config;
}
