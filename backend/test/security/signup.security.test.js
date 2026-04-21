import { expect } from "chai";
import bcrypt from "bcrypt";
import { AuthService } from "../../service/auth.service.js";
import UserModel from "../../models/user.model.js";

describe("Signup Security", () => {
    const originalFindByEmail = UserModel.findByEmail;
    const originalFindByUsername = UserModel.findByUsername;
    const originalCreate = UserModel.create;
    const originalHash = bcrypt.hash;

    afterEach(() => {
        UserModel.findByEmail = originalFindByEmail;
        UserModel.findByUsername = originalFindByUsername;
        UserModel.create = originalCreate;
        bcrypt.hash = originalHash;
    });


    it("should return a generic pending response when email already exists (anti-enumeration)", async () => {
        UserModel.findByEmail = async () => ({ id: 1, email: "taken@example.com" });
        UserModel.findByUsername = async () => null;
        bcrypt.hash = async () => "fake-hash";

        const result = await AuthService.signUp("newuser", "taken@example.com", "password123");

        expect(result.status).to.equal("pending");
        expect(result.message.toLowerCase()).to.include("verification email has been sent");
        expect(result.user).to.equal(undefined);
    });


    it("should return a generic pending response when username already exists (anti-enumeration)", async () => {
        UserModel.findByEmail = async () => null;
        UserModel.findByUsername = async () => ({ id: 1, username: "takenuser" });
        bcrypt.hash = async () => "fake-hash";

        const result = await AuthService.signUp("takenuser", "fresh@example.com", "password123");

        expect(result.status).to.equal("pending");
        expect(result.message.toLowerCase()).to.include("verification email has been sent");
        expect(result.user).to.equal(undefined);
    });


    it("should reject invalid email format", async () => {
        UserModel.findByEmail = async () => null;
        UserModel.findByUsername = async () => null;

        let caught = null;

        try {
            await AuthService.signUp("aman", "bademail", "password123");
        } catch (error) {
            caught = error;
        }

        expect(caught).to.not.equal(null);
        expect(caught.statusCode).to.equal(400);
        expect(caught.message).to.equal("Invalid email format");
    });


    it("should reject invalid password format", async () => {
        UserModel.findByEmail = async () => null;
        UserModel.findByUsername = async () => null;

        let caught = null;

        try {
            await AuthService.signUp("aman", "aman@example.com", "lettersonly");
        } catch (error) {
            caught = error;
        }

        expect(caught).to.not.equal(null);
        expect(caught.statusCode).to.equal(400);
        expect(caught.message).to.equal("Password does not meet requirements");
    });

    
    it("should create a new user and return the user details for OTP generation", async () => {
        UserModel.findByEmail = async () => null;
        UserModel.findByUsername = async () => null;
        UserModel.create = async (username, email, password) => ({
            id: 77,
            username,
            email,
            password
        });

        const result = await AuthService.signUp("aman", "aman@example.com", "password123");

        expect(result.status).to.equal("pending");
        expect(result.user).to.deep.equal({
            id: 77,
            username: "aman",
            email: "aman@example.com"
        });
    });
});