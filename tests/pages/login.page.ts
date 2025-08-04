import { Page, expect } from '@playwright/test';

export class LoginPage {
  private readonly page: Page;
  
  // Locators using recommended strategies
  private readonly usernameInput;
  private readonly passwordInput;
  private readonly loginButton;
  private readonly errorMessage;

  constructor(page: Page) {
    this.page = page;
    // Fix: Use getByRole() with textbox role for form fields
    this.usernameInput = this.page.getByRole('textbox', { name: 'Username' });
    this.passwordInput = this.page.getByRole('textbox', { name: 'Password' });
    this.loginButton = this.page.getByRole('button', { name: 'Login' });
    this.errorMessage = this.page.getByRole('heading', { level: 3 });

  }

  /**
   * Navigate to the login page
   */
  async navigate(): Promise<void> {
    await this.page.goto('/');
  }

  /**
   * Fill in login credentials
   */
  async fillCredentials(username: string, password: string): Promise<void> {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
  }

  /**
   * Fill username only
   */
  async fillUsername(username: string): Promise<void> {
    await this.usernameInput.fill(username);
  }

  /**
   * Fill password only
   */
  async fillPassword(password: string): Promise<void> {
    await this.passwordInput.fill(password);
  }

  /**
   * Click the login button
   */
  async clickLogin(): Promise<void> {
    await this.loginButton.click();
  }

  /**
   * Complete login process with credentials
   */
  async login(username: string, password: string): Promise<void> {
    await this.fillCredentials(username, password);
    await this.clickLogin();
  }

  /**
   * Get error message text
   */
  async getErrorMessage(): Promise<string> {
    return await this.errorMessage.textContent() || '';
  }

  /**
   * Check if error message is visible
   */
  async isErrorMessageVisible(): Promise<boolean> {
    return await this.errorMessage.isVisible();
  }

  /**
   * Verify successful login by checking URL and page title
   */
  async verifySuccessfulLogin(): Promise<void> {
    // Check URL
    await expect(this.page).toHaveURL(/inventory/);
    
    // Check for multiple inventory page indicators
    await expect(
      this.page.getByText(/Swag Labs/),
      'Page should contain "Swag Labs Products" text'
    ).toBeVisible();
    
    await expect(
      this.page.getByRole('combobox'),
      'Product sorting dropdown should be present'
    ).toBeVisible();
    
    await expect(
      this.page.getByRole('button', { name: 'Add to cart' }).first(),
      'Add to cart buttons should be visible on inventory page'
    ).toBeVisible();
  }

  /**
   * Verify error message contains specific text
   */
  async verifyErrorMessage(expectedText: string): Promise<void> {
    await expect(this.errorMessage, `Error message should contain "${expectedText}"`).toContainText(expectedText);
  }

  /**
   * Verify login form is visible
   */
  async verifyLoginFormVisible(): Promise<void> {
    await expect(this.usernameInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.loginButton).toBeVisible();
  }
} 