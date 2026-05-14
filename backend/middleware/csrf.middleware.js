/*
//Functions for issueing CSRF token and validating it
*/

import {randomBytes, timingSafeEqual} from 'crypto';

// Help Function - Create CSRF Token
export function issueCSRFToken() {
    return randomBytes(32).toString('hex');
}

// Help Function - Validate CSRF Token with the given methods "GET, HEAD. OPTIONS"
export function validateCSRF(req, res, next) {
    const Safe_Method = ['GET','HEAD','OPTIONS'];

    // Skip validatin if the method is SAFE METHOD
    if (Safe_Method.includes(req.method)){

        return next();
        
        }
    
    try {
        // Request a cookie from the header and the cookie itself
        const tokenFromCookie = req.cookies.csrfToken;
        const tokenFromHeader = req.headers['x-csrf-token'];
        
        // Check if tokens are found
        if(!tokenFromCookie || !tokenFromHeader){
            console.log("tokens are undefined");
            return res.status(403).json({
                success:false,
                message:"CSRF Token is Undefined"
            });
        }

        // Puts into a buffer from the identified cookie
        const cookieBuffer = Buffer.from(tokenFromCookie);
        const headerBuffer = Buffer.from(tokenFromHeader);

        // Check the same size
        if(cookieBuffer.length == headerBuffer.length){
            
            // Uses the crypto web library "timing Safe Equal" - similar to rate limiting 
            if(!timingSafeEqual(cookieBuffer, headerBuffer)){
                //tokens do not match
                console.log("CSRF Tokens do not match");
                return res.status(403).json({
                    success:false,
                    message:"CSRF Token Error"
                });

            } else{
                //tokens match -> allow call
                next();
            }
        } else {
            //Buffer error due to different size of tokens
            console.log("CSRF Tokens Unexpected Error");
            res.status(403).json({
                success:false,
                message:"CSRF Token Error"
            });
        }
        
    } catch(err){
        // EREROR MESSAGE
        console.log("Unexpected Error CSRF Validation")
        res.status(403).json({
            success:false,
            message:"CSRF Validation Failed"
        });
    }
}