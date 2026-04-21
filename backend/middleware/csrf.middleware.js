// CSRF middleware for generation and validation

const Safe_Method = ['GET','HEAD','OPTIONS'];

export const require_csrf = (req, res, next) => {
    if (Safe_Method.has(req.method)){
        return next();
    }

    const csrfCookie = req.cookies?.csrfToken
    const csrfHeader = req.get('X-CSRF-TOKEN')

    if (!csrfCookie | !csrfHeader | csrfCookie !== csrfHeader){
        return res.status(500).json({
            success: false,
            message: 'Invalid CSRF Token'
        });
    }

    next();
}