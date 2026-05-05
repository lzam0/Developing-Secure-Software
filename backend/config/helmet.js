export function getHelmetConfig({ isProduction = process.env.NODE_ENV === "production" } = {}) {
    const config = {
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'"],
                connectSrc: ["'self'"],
                imgSrc: ["'self'", "data:"],
                fontSrc: ["'self'"],
                objectSrc: ["'none'"],
                frameAncestors: ["'none'"]
            }
        }
    };

    if (!isProduction) {
        config.strictTransportSecurity = false;
    }

    return config;
}
