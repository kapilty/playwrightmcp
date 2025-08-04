import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { 
  createStandardUser, 
  createLockedOutUser, 
  createProblemUser, 
  createPerformanceGlitchUser,
  createTestUser 
} from '../testdata/factory';
import { ScreenshotUtil } from '../utils/screenshot';

test.describe('Authentication @auth', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    // Initialize page object
    loginPage = new LoginPage(page);
    
    // Setup: Navigate to login page before each test
    await loginPage.navigate();
  });

  test.describe('Successful Login Scenarios @smoke', () => {
    test('@smoke should authenticate with valid standard user credentials', async ({ page }) => {
      // Setup: Create standard user
      const user = createStandardUser();
      
      // Action: Perform login
      await loginPage.login(user.username, user.password);
      
      // Assert: Verify successful authentication
      await expect(
        loginPage.verifySuccessfulLogin(),
        'User should be successfully logged in with standard credentials'
      ).resolves.toBeUndefined();
      
      await ScreenshotUtil.takeScreenshotOnSuccess(page, 'auth-successful-login');
    });

    test('@regression should verify login form elements are properly displayed', async ({ page }) => {
      // Assert: Login form should be visible and accessible
      await expect(
        loginPage.verifyLoginFormVisible(),
        'Login form elements should be visible to user'
      ).resolves.toBeUndefined();
      
      await ScreenshotUtil.takeScreenshotOnSuccess(page, 'auth-login-form-elements');
    });
  });

  test.describe('Failed Authentication Scenarios @regression', () => {
    test('@regression should display error message for invalid credentials', async ({ page }) => {
      // Setup: Create invalid user credentials
      const invalidUser = createTestUser();
      
      // Action: Attempt login with invalid credentials
      await loginPage.login(invalidUser.username, invalidUser.password);
      
      // Assert: Error message should be displayed
      await expect(
        loginPage.verifyErrorMessage('Epic sadface'),
        'Error message should appear for invalid credentials'
      ).resolves.toBeUndefined();
      
      await ScreenshotUtil.takeScreenshotOnSuccess(page, 'auth-invalid-credentials');
    });

    test('@regression should prevent login for locked out user account', async ({ page }) => {
      // Setup: Create locked out user
      const lockedUser = createLockedOutUser();
      
      // Action: Attempt login with locked account
      await loginPage.login(lockedUser.username, lockedUser.password);
      
      // Assert: Locked out message should be displayed
      await expect(
        loginPage.verifyErrorMessage('Sorry, this user has been locked out'),
        'Locked out message should appear for restricted account'
      ).resolves.toBeUndefined();
      
      await ScreenshotUtil.takeScreenshotOnSuccess(page, 'auth-locked-user');
    });
  });

  test.describe('Special User Scenarios @regression', () => {
    test('@regression should login with problem user and identify UI issues', async ({ page }) => {
      // Setup: Create problem user
      const problemUser = createProblemUser();
      
      // Action: Login with problem user
      await loginPage.login(problemUser.username, problemUser.password);
      
      // Assert: Login should succeed despite UI issues
      await expect(
        loginPage.verifySuccessfulLogin(),
        'Problem user should be able to login successfully'
      ).resolves.toBeUndefined();
      
      // Fix: Check for 404 images instead of dog images
      const productImages = page.locator('.inventory_item_img img');
      await expect(
        productImages.first(),
        'Problem user should display 404 error images instead of product images'
      ).toHaveAttribute('src', /.*404.*/);
      
      await ScreenshotUtil.takeScreenshotOnSuccess(page, 'auth-problem-user-issues');
    });

    test('@slow should handle performance glitch user with extended timeout', async ({ page }) => {
      // Setup: Create performance glitch user
      const performanceUser = createPerformanceGlitchUser();
      
      // Action: Login with performance glitch user
      await loginPage.login(performanceUser.username, performanceUser.password);
      
      // Assert: Wait for page to load with extended timeout for performance issues
      await expect(
        page.waitForURL(/inventory/, { timeout: 10000 }),
        'Page should load within extended timeout for performance glitch user'
      ).resolves.toBeUndefined();
      
      await expect(
        loginPage.verifySuccessfulLogin(),
        'Performance glitch user should eventually login successfully'
      ).resolves.toBeUndefined();
      
      await ScreenshotUtil.takeScreenshotOnSuccess(page, 'auth-performance-glitch-user');
    });
  });

  test.describe('Form Validation @ui', () => {
    test('@regression should validate empty username and password fields', async ({ page }) => {
      // Action: Click login without entering credentials
      await loginPage.clickLogin();
      
      // Assert: Username required error should be displayed
      await expect(
        loginPage.verifyErrorMessage('Username is required'),
        'Error message should appear when username is empty'
      ).resolves.toBeUndefined();
      
      await ScreenshotUtil.takeScreenshotOnSuccess(page, 'auth-empty-fields-validation');
    });

    test('@regression should validate username field when password is empty', async ({ page }) => {
      // Setup: Create user for username input
      const user = createStandardUser();
      
      // Action: Fill username only and attempt login
      await loginPage.fillUsername(user.username);
      await loginPage.clickLogin();
      
      // Assert: Password required error should be displayed
      await expect(
        loginPage.verifyErrorMessage('Password is required'),
        'Error message should appear when password is empty'
      ).resolves.toBeUndefined();
      
      await ScreenshotUtil.takeScreenshotOnSuccess(page, 'auth-username-only-validation');
    });

    test('@regression should validate password field when username is empty', async ({ page }) => {
      // Setup: Create user for password input
      const user = createStandardUser();
      
      // Action: Fill password only and attempt login
      await loginPage.fillPassword(user.password);
      await loginPage.clickLogin();
      
      // Assert: Username required error should be displayed
      await expect(
        loginPage.verifyErrorMessage('Username is required'),
        'Error message should appear when username is empty'
      ).resolves.toBeUndefined();
      
      await ScreenshotUtil.takeScreenshotOnSuccess(page, 'auth-password-only-validation');
    });
  });

  test.describe('Input Validation @regression', () => {
    test('@regression should handle special characters in username field', async ({ page }) => {
      // Setup: Create user with special characters in username
      const specialUser = createTestUser({ username: 'test@user.com' });
      
      // Action: Attempt login with special characters
      await loginPage.login(specialUser.username, specialUser.password);
      
      // Assert: Error message should be displayed for invalid credentials
      await expect(
        loginPage.verifyErrorMessage('Epic sadface'),
        'Error message should appear for username with special characters'
      ).resolves.toBeUndefined();
      
      await ScreenshotUtil.takeScreenshotOnSuccess(page, 'auth-special-characters-username');
    });

    test('@regression should handle extremely long username input', async ({ page }) => {
      // Setup: Create user with very long username
      const longUser = createTestUser({ 
        username: 'a'.repeat(1000) 
      });
      
      // Action: Attempt login with very long username
      await loginPage.login(longUser.username, longUser.password);
      
      // Assert: Error message should be displayed for invalid credentials
      await expect(
        loginPage.verifyErrorMessage('Epic sadface'),
        'Error message should appear for extremely long username'
      ).resolves.toBeUndefined();
      
      await ScreenshotUtil.takeScreenshotOnSuccess(page, 'auth-long-username-input');
    });
  });
}); 