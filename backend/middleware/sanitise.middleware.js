import sanitiseHtml from 'sanitize-html';


// go through the request body and strip all the html tags 
// from string values to prevent xss
export const sanitiseBody = (req, res, next) => {
    // check there is a body to process
    if (req.body && typeof req.body === 'object') {

        // e.g. blog post submission - ['title', 'content', 'author']
        // loop through each field so every string gets sanitised
        for (const key of Object.keys(req.body)) {
            
            // only sanitise string values
            if (typeof req.body[key] === 'string') {
                const original = req.body[key];

                // where the sanitise happens e.g <script>bad!</script>
                req.body[key] = sanitiseHtml(req.body[key], {
                    allowedTags: [], // remove all html tags (e.g. <script>, <a>) 
                    allowedAttributes: {} // remove all attributes (e.g. onclick)
                });

                // log a warniing if the input was modified 
                if (req.body[key] !== original) {
                    console.warn(`[Sanitise] Malicious input stripped from field: "${key}"`);
                }
            }
        }
    }
    next();
};