import { expect } from "chai";

import authService from "../../service/auth.service.js";

/*

*/
describe("Login Security", () => {

    /*
     * Input Validation
     */
    describe("Input Validation", () => {
        // Email Validation
        it("should reject invalid email format", () => {
            const result = authService.validateEmail("bademail");
            expect(result).to.equal(false);
        });
 
        it("should reject email without @", () => {
            const result = authService.validateEmail("emailexample.com");
            expect(result).to.equal(false);
        });
 
        it("should reject email without domain", () => {
            const result = authService.validateEmail("email@");
            expect(result).to.equal(false);
        });
 
        it("should accept valid email format", () => {
            const result = authService.validateEmail("valid@example.com");
            expect(result).to.equal(true);
        });
 
        // Password Validation
        it("should reject empty password", () => {
            const result = authService.validatePassword("");
            expect(result).to.equal(false);
        });
 
        it("should reject null password", () => {
            const result = authService.validatePassword(null);
            expect(result).to.equal(false);
        });
 
        it("should reject undefined password", () => {
            const result = authService.validatePassword(undefined);
            expect(result).to.equal(false);
        });
 
        it("should reject password shorter than minimum length", () => {
            const result = authService.validatePassword("short");
            expect(result).to.equal(false);
        });

        it("should reject password with only 7 chars", () => {
            const result = authService.validatePassword("Aa1!aaa");
            expect(result).to.equal(false);
        });

        it("should accept password with 8 chars", () => {
            const result = authService.validatePassword("Aa1!aaaa");
            expect(result).to.equal(true);
        });

        it("should accept password with 72 chars", () => {
            const result = authService.validatePassword("Aa!1" + "a".repeat(68));
            expect(result).to.equal(true);
        });

        it("should reject password with 73 or over chars", () => {
            const result = authService.validatePassword("Aa!1" + "a".repeat(69));
            expect(result).to.equal(false);
        });
 
        it("should reject password without numbers", () => {
            const result = authService.validatePassword("OnlyLetters!");
            expect(result).to.equal(false);
        });
 
        it("should reject password without special characters", () => {
            const result = authService.validatePassword("NoSpecial123");
            expect(result).to.equal(false);
        });
 
        it("should accept strong password", () => {
            const result = authService.validatePassword("StrongPass123!");
            expect(result).to.equal(true);
        });

        //Check for blocked special characters

        it("should reject password with a blocked special character (')", () => {
            const result = authService.validatePassword("Special!123'");
            expect(result).to.equal(false);
        });
        
        it("should reject password with a blocked special character (\\)", () => {
            const result = authService.validatePassword("Special!123\\");
            expect(result).to.equal(false);
        });
        
        it("should reject password with a blocked special character (>)", () => {
            const result = authService.validatePassword("Special!123>");
            expect(result).to.equal(false);
        });
        
        it("should reject password with a blocked special character (<)", () => {
            const result = authService.validatePassword("Special!123<");
            expect(result).to.equal(false);
        });
        
        it("should reject password with a blocked special character (\")", () => {
            const result = authService.validatePassword("Special!123\"");
            expect(result).to.equal(false);
        });
        
        it("should reject password with a blocked special character (;)", () => {
            const result = authService.validatePassword("Special!123;");
            expect(result).to.equal(false);
        });
        
        it("should reject password with a blocked special character (`)", () => {
            const result = authService.validatePassword("Special!123`");
            expect(result).to.equal(false);
        });
    });

    /*
     * Password Hashing
     */
    describe("Password Hashing", () => {
        it("should hash password correctly", async() => {
            const hash = await authService.hashPassword("password123");
            expect(hash).to.not.equal("password123");
        });
 
        it("should produce different hashes for same password (salt)", async() => {
            const hash1 = await authService.hashPassword("password123");
            const hash2 = await authService.hashPassword("password123");
            expect(hash1).to.not.equal(hash2);
        });
 
        it("should produce hash of appropriate length", async() => {
            const hash = await authService.hashPassword("password123");
            expect(hash.length).to.be.greaterThan(30);
        });
 
        it("should verify correct password against hash", async() => {
            const password = "MySecurePassword123!";
            const hash = await authService.hashPassword(password);
            const isValid = await authService.verifyPassword(password, hash);
            expect(isValid).to.equal(true);
        });
 
        it("should reject incorrect password against hash", async() => {
            const hash = await authService.hashPassword("CorrectPassword123!");
            const isValid = await authService.verifyPassword("WrongPassword123!", hash);
            expect(isValid).to.equal(false);
        });
    });

    // SQL Injection Testing
    describe("SQL Injection Testing", () => { 

        it("should reject SQLI in email field for (' OR '1'='1) ", () => {
            const result = authService.validateEmail("' OR '1'='1 ");
            expect(result).to.equal(false);
        });

        it("should reject SQLI in email field for (admin'--) ", () => {
            const result = authService.validateEmail("admin'--");
            expect(result).to.equal(false);
        });

        it("should reject SQLI in email field for ('; DROP TABLE users;--) ", () => {
            const result = authService.validateEmail("'; DROP TABLE users;--");
            expect(result).to.equal(false);
        });

        it("should reject SQLI in email field for (' UNION SELECT * FROM users--) ", () => {
            const result = authService.validateEmail("' UNION SELECT * FROM users--");
            expect(result).to.equal(false);
        });

        it("should accept a password containing SQL-like characters that are not blocked", () => {
            const result = authService.validatePassword("P@ssw0rd=1");
            expect(result).to.equal(true);
        })
        
    });

});