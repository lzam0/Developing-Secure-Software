import puppeteer from 'puppeteer';

// This script simulates a bot trying to sign up on the website.
//  It fills out the form and checks for server responses.
// Testing RECAPTCHA and server-side validation.
(async () => {
    const browser = await puppeteer.launch({ 
        headless: false, 
        slowMo: 100     // Slow down to see typing
    });
    const page = await browser.newPage();

    // Log everything happening in the browser console
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));

    try {
        console.log("Navigating...");
        await page.goto(`${process.env.FRONTEND_URL}/signup.html`); 
        
        // Wait for the form to load    
        console.log("Waiting for reCAPTCHA...");
        await new Promise(r => setTimeout(r, 2000)); 

        await page.type('#username_input', 'bot_tester');
        await page.type('#email_input', 'bot_tester@example.com');
        await page.type('#confirm_email_input', 'bot_tester@example.com');
        await page.type('#password_input', 'Password123!');
        await page.type('#confirm_password_input', 'Password123!');

        console.log("Clicking submit...");
        await page.click('#login_btn');

        // Wait to see if a network request happens
        console.log("Waiting for server response...");
        const response = await page.waitForResponse(res => res.url().includes('/auth/signIn'), { timeout: 5000 });
        
        console.log("Server responded with status:", response.status());
        const responseData = await response.json();
        console.log("Server message:", responseData.message);

    } catch (err) {
        console.error("Test failed:", err.message);
    } finally {
        // Keep browser open for 10 seconds to see the result
        await new Promise(r => setTimeout(r, 10000)); 
        await browser.close();
    }
})();