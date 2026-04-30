import { expect } from "chai";
import request from 'supertest';
import { createTestApp } from "../helpers/createTestApp.js";
import { TEST_SECRET, validToken } from '../helpers/tokenFactory.js';

const app = createTestApp({ secret: TEST_SECRET });

describe('Input sanitisation', () => {
})