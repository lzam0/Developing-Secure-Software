
process.env.JWT_WEB_TOKEN_SECRET = 'test-secret';
process.env.JWT_EXPIRES_IN = '2h';
process.env.SALT_ROUNDS = '10';
process.env.PEPPER = 'test-pepper';

import { describe, test, expect, beforeEach, vi } from 'vitest'

vi.mock('../../models/user.model.js');
vi.mock('bcrypt');

const bcrypt = (await import('bcrypt')).default;
const UserModel = (await import('../../models/user.model.js')).default;
const AuthService = (await import('../../service/auth.service.js')).default;



// ----Account Enumeration Testing for Sign Up----

//testing if existing email or username returns the same message as successful registration, so attackers cant enumerate accounts based on responses

describe('Account Enumeration Protection - SignUp', () => {
  
  beforeEach(() => vi.clearAllMocks());

  test('existing email returns same message as successful registration', async () => {
    UserModel.findByEmail.mockResolvedValue({ id: 1, email: 'taken@test.com' }); 
    UserModel.findByUsername.mockResolvedValue(null);
    bcrypt.hash.mockResolvedValue('fakehash');

    const result = await AuthService.signUp('newuser', 'taken@test.com', 'Password1');

    expect(result.message).toBe(
      'A verification email has been sent to your email address. Please check your inbox and follow the instructions to complete your registration.'
    );
    expect(result.status).toBe('pending');
  });

  test('existing username returns same message as successful registration', async () => {
    UserModel.findByEmail.mockResolvedValue(null);
    UserModel.findByUsername.mockResolvedValue({ id: 1, username: 'takenuser' });
    bcrypt.hash.mockResolvedValue('fakehash');

    const result = await AuthService.signUp('takenuser', 'new@test.com', 'Password1');

    expect(result.message).toBe(
      'A verification email has been sent to your email address. Please check your inbox and follow the instructions to complete your registration.'
    );
    expect(result.status).toBe('pending');
  });

  test('new user also returns the same pending message (responses are indistinguishable)', async () => {
    UserModel.findByEmail.mockResolvedValue(null);
    UserModel.findByUsername.mockResolvedValue(null);
    UserModel.create.mockResolvedValue({ id: 2, username: 'newuser', email: 'new@test.com' });
    bcrypt.hash.mockResolvedValue('hashedpw');

    const result = await AuthService.signUp('newuser', 'new@test.com', 'Password1');

    expect(result.message).toBe(
      'A verification email has been sent to your email address. Please check your inbox and follow the instructions to complete your registration.'
    );
    expect(result.status).toBe('pending');
  });
});




//Test that a fake hash is done on sign up when email or username is taken, to make response times similar to successful registration, preventing timing attacks for account enumeration
describe('Timing Attack Protection - SignUp', () => {
  beforeEach(() => vi.clearAllMocks());
test('performs bcrypt hash even when user exists (prevents timing attack)', async () => {
  UserModel.findByEmail.mockResolvedValue({ id: 1, email: 'taken@test.com' });
  UserModel.findByUsername.mockResolvedValue(null);
  bcrypt.hash.mockResolvedValue('fakehash');

  await AuthService.signUp('user', 'taken@test.com', 'Password1');

  // bcrypt.hash must still be called to equalise response time
  expect(bcrypt.hash).toHaveBeenCalledTimes(1); 
});
});



// ----Account Enumeration Testing for Sign In----

//testing if non-existent user and wrong password returns the same message, so attackers cant enumerate accounts based on responses
describe('Account Enumeration Protection - SignIn', () => {
    beforeEach(() => vi.clearAllMocks());

  test('non-existent user throws same error message as wrong password', async () => {
    UserModel.findByEmailOrUsername.mockResolvedValue(null);
    bcrypt.hash.mockResolvedValue('fakehash');

    await expect(AuthService.signIn('ghost@test.com', 'Password1'))
      .rejects.toMatchObject({ message: 'Invalid credentials', statusCode: 401 });
  });

  test('wrong password throws same error message as non-existent user', async () => {
    UserModel.findByEmailOrUsername.mockResolvedValue({ id: 1, password: 'hashed' });
    vi.spyOn(AuthService, 'verifyPassword').mockResolvedValue(false);

    await expect(AuthService.signIn('real@test.com', 'wrongpassword'))
      .rejects.toMatchObject({ message: 'Invalid credentials', statusCode: 401 });
  });

  test('fake hash is called when user is not found (for timing)', async () => {
    UserModel.findByEmailOrUsername.mockResolvedValue(null);
    bcrypt.hash.mockResolvedValue('fakehash');

    await AuthService.signIn('ghost@test.com', 'Password1').catch(() => {});

    expect(bcrypt.hash).toHaveBeenCalledTimes(1);
  });
});