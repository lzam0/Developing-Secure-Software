import { expect } from "chai";
import OtpModel from "../../models/otp.model.js";
import pool from "../../controllers/database.js";

describe("OTP Model Security", () => {
    let originalQuery;

    beforeEach(() => {
        originalQuery = pool.query;
    });

    afterEach(() => {
        pool.query = originalQuery;
    });

    it("invalidateExistingOtps should update only unused OTPs for the given user and purpose", async () => {
        let capturedQuery = "";
        let capturedParams = [];

        pool.query = async (query, params) => {
            capturedQuery = query;
            capturedParams = params;
            return { rows: [] };
        };

        await OtpModel.invalidateExistingOtps(7, "signup");

        expect(capturedQuery.toLowerCase()).to.include("update email_otps");
        expect(capturedQuery.toLowerCase()).to.include("where userid = $1 and purpose = $2 and used = false");
        expect(capturedParams).to.deep.equal([7, "signup"]);
    });

    it("create should insert OTP hash, purpose and expiry", async () => {
        const fakeRow = {
            otpid: 1,
            userid: 7,
            otp_hash: "hashed-otp",
            purpose: "signin",
            expires_at: new Date(),
            attempts: 0,
            used: false
        };

        let capturedParams = [];

        pool.query = async (_query, params) => {
            capturedParams = params;
            return { rows: [fakeRow] };
        };

        const result = await OtpModel.create(7, "hashed-otp", "signin", "2026-04-14T12:00:00.000Z");

        expect(capturedParams).to.deep.equal([7, "hashed-otp", "signin", "2026-04-14T12:00:00.000Z"]);
        expect(result).to.deep.equal(fakeRow);
    });

    it("findLatestActiveByUserId should query by user and purpose", async () => {
        const fakeRow = {
            otpid: 99,
            userid: 3,
            otp_hash: "abc",
            purpose: "signup",
            expires_at: new Date(),
            attempts: 0,
            used: false
        };

        let capturedQuery = "";
        let capturedParams = [];

        pool.query = async (query, params) => {
            capturedQuery = query;
            capturedParams = params;
            return { rows: [fakeRow] };
        };

        const result = await OtpModel.findLatestActiveByUserId(3, "signup");

        expect(capturedQuery.toLowerCase()).to.include("from email_otps");
        expect(capturedQuery.toLowerCase()).to.include("where userid = $1 and purpose = $2 and used = false");
        expect(capturedQuery.toLowerCase()).to.include("order by created_at desc");
        expect(capturedParams).to.deep.equal([3, "signup"]);
        expect(result).to.deep.equal(fakeRow);
    });

    it("incrementAttempts should increase attempts and return the updated count", async () => {
        pool.query = async (_query, params) => {
            expect(params).to.deep.equal([55]);
            return { rows: [{ attempts: 3 }] };
        };

        const result = await OtpModel.incrementAttempts(55);
        expect(result).to.deep.equal({ attempts: 3 });
    });

    it("markUsed should mark a specific OTP as used", async () => {
        let capturedParams = [];

        pool.query = async (_query, params) => {
            capturedParams = params;
            return { rows: [] };
        };

        await OtpModel.markUsed(42);
        expect(capturedParams).to.deep.equal([42]);
    });
});