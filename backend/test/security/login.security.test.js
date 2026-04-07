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

        it ("should reject empty email", () => {
            const result = authService.validateEmail("");
            expect(result).to.equal(false);
        })

        it ("should reject null email",() => {
            const result = authService.validateEmail(null);
            expect(result).to.equal(false);
        })

        it ("should reject undefined email", () => {
            const result = authService.validateEmail(undefined);
            expect(result).to.equal(false);
        })
 
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

        it ("should reject password longer than maximum length", () => {
            const longPassword = "A".repeat(73) + "1a!";
            const result = authService.validatePassword(longPassword);
            expect(result).to.equal(false);
        })

        it ("should accept password at minimum length", () => {
            const min_pass = "A1a!A1a!"
            const result = authService.validatePassword(min_pass);
            expect(result).to.equal(true);
        })

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

    /*
    * Security Prevention Testing
    * Test out account enumeration, SQL injection and brute force prevention?
    */

});