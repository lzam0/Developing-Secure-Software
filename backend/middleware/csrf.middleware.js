/*
//Functions for issueing CSRF token and validating it
*/

import {randomBytes, timingSafeEqual} from 'crypto';

export function issueCSRFToken() {
    return randomBytes(32).toString('hex');
}

export function validateCSRF(req, res, next) {
    const Safe_Method = ['GET','HEAD','OPTIONS'];

    if (Safe_Method.includes(req.method)){

        return next();
        
        }
    
    
    try {
        const tokenFromCookie = req.cookies.csrfToken;
        const tokenFromHeader = req.headers['x-csrf-token'];
        
        if(!tokenFromCookie || !tokenFromHeader){
            console.log("tokens are undefined");
            return res.status(403).json({
                success:false,
                message:"CSRF Token is Undefined"
            });
        }

        const cookieBuffer = Buffer.from(tokenFromCookie);
        const headerBuffer = Buffer.from(tokenFromHeader);

        if(cookieBuffer.length == headerBuffer.length){
            
            if(!timingSafeEqual(cookieBuffer, headerBuffer)){
                //tokens do not match
                console.log("CSRF Tokens do not match");
                res.status(403).json({
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
        console.log("Unexpected Error CSRF Validation")
        res.status(403).json({
            success:false,
            message:"CSRF Validation Failed"
        });
    }
}