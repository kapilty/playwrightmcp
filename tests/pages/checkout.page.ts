import { Page, expect } from '@playwright/test';

export interface CheckoutInfo {
  firstName: string;
  lastName: string;
  postalCode: string;
}

export class CheckoutPage {
  private readonly page: Page;
  
  // Locators using recommended strategies
  private readonly firstNameInput;
  private readonly lastNameInput;
  private readonly postalCodeInput;
  private readonly continueButton;
  private readonly cancelButton;
  private readonly errorMessage;
  private readonly checkoutTitle;

  constructor(page: Page) {
    this.page = page;
    this.firstNameInput = this.page.getByTestId('firstName');
    this.lastNameInput = this.page.getByTestId('lastName');
    this.postalCodeInput = this.page.getByTestId('postalCode');
    this.continueButton = this.page.getByTestId('continue');
    this.cancelButton = this.page.getByTestId('cancel');
    this.errorMessage = this.page.getByTestId('error');
    this.checkoutTitle = this.page.getByRole('heading', { name: 'Checkout: Your Information' });
  }

  /**
   * Navigate to checkout step one
   */
  async navigate(): Promise<void> {
    await this.page.goto('/checkout-step-one.html');
  }

  /**
   * Fill checkout information
   */
  async fillCheckoutInfo(info: CheckoutInfo): Promise<void> {
    await this.firstNameInput.fill(info.firstName);
    await this.lastNameInput.fill(info.lastName);
    await this.postalCodeInput.fill(info.postalCode);
  }

  /**
   * Fill first name only
   */
  async fillFirstName(firstName: string): Promise<void> {
    await this.firstNameInput.fill(firstName);
  }

  /**
   * Fill last name only
   */
  async fillLastName(lastName: string): Promise<void> {
    await this.lastNameInput.fill(lastName);
  }

  /**
   * Fill postal code only
   */
  async fillPostalCode(postalCode: string): Promise<void> {
    await this.postalCodeInput.fill(postalCode);
  }

  /**
   * Click continue button
   */
  async continue(): Promise<void> {
    await this.continueButton.click();
  }

  /**
   * Click cancel button
   */
  async cancel(): Promise<void> {
    await this.cancelButton.click();
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
   * Verify checkout title is displayed
   */
  async verifyCheckoutTitle(): Promise<void> {
    await expect(this.checkoutTitle).toBeVisible();
  }

  /**
   * Verify error message contains specific text
   */
  async verifyErrorMessage(expectedText: string): Promise<void> {
    await expect(this.errorMessage, `Error message should contain "${expectedText}"`).toContainText(expectedText);
  }

  /**
   * Verify navigation to checkout overview
   */
  async verifyNavigationToOverview(): Promise<void> {
    await expect(this.page).toHaveURL(/checkout-step-two/);
    await expect(this.page.getByRole('heading', { name: 'Checkout: Overview' })).toBeVisible();
  }

  /**
   * Verify navigation back to inventory
   */
  async verifyNavigationToInventory(): Promise<void> {
    await expect(this.page).toHaveURL(/inventory/);
  }
}

export class CheckoutOverviewPage {
  private readonly page: Page;
  
  // Locators using recommended strategies
  private readonly finishButton;
  private readonly cancelButton;
  private readonly paymentInfo;
  private readonly shippingInfo;
  private readonly subtotalLabel;
  private readonly taxLabel;
  private readonly totalLabel;

  constructor(page: Page) {
    this.page = page;
    this.finishButton = this.page.getByTestId('finish');
    this.cancelButton = this.page.getByTestId('cancel');
    this.paymentInfo = this.page.getByTestId('payment-info');
    this.shippingInfo = this.page.getByTestId('shipping-info');
    this.subtotalLabel = this.page.getByTestId('subtotal-label');
    this.taxLabel = this.page.getByTestId('tax-label');
    this.totalLabel = this.page.getByTestId('total-label');
  }

  /**
   * Navigate to checkout overview
   */
  async navigate(): Promise<void> {
    await this.page.goto('/checkout-step-two.html');
  }

  /**
   * Click finish button
   */
  async finish(): Promise<void> {
    await this.finishButton.click();
  }

  /**
   * Click cancel button
   */
  async cancel(): Promise<void> {
    await this.cancelButton.click();
  }

  /**
   * Get payment information
   */
  async getPaymentInfo(): Promise<string> {
    return await this.paymentInfo.textContent() || '';
  }

  /**
   * Get shipping information
   */
  async getShippingInfo(): Promise<string> {
    return await this.shippingInfo.textContent() || '';
  }

  /**
   * Get subtotal
   */
  async getSubtotal(): Promise<string> {
    return await this.subtotalLabel.textContent() || '';
  }

  /**
   * Get tax amount
   */
  async getTax(): Promise<string> {
    return await this.taxLabel.textContent() || '';
  }

  /**
   * Get total amount
   */
  async getTotal(): Promise<string> {
    return await this.totalLabel.textContent() || '';
  }

  /**
   * Verify payment information is displayed
   */
  async verifyPaymentInfoDisplayed(): Promise<void> {
    await expect(this.paymentInfo).toBeVisible();
  }

  /**
   * Verify shipping information is displayed
   */
  async verifyShippingInfoDisplayed(): Promise<void> {
    await expect(this.shippingInfo).toBeVisible();
  }

  /**
   * Verify navigation to checkout complete
   */
  async verifyNavigationToComplete(): Promise<void> {
    await expect(this.page).toHaveURL(/checkout-complete/);
    await expect(this.page.getByRole('heading', { name: 'Checkout: Complete!' })).toBeVisible();
  }
}

export class CheckoutCompletePage {
  private readonly page: Page;
  
  // Locators using recommended strategies
  private readonly completeHeader;
  private readonly completeText;
  private readonly ponyExpressImage;
  private readonly backToProductsButton;

  constructor(page: Page) {
    this.page = page;
    this.completeHeader = this.page.getByTestId('complete-header');
    this.completeText = this.page.getByTestId('complete-text');
    this.ponyExpressImage = this.page.getByTestId('pony-express');
    this.backToProductsButton = this.page.getByTestId('back-to-products');
  }

  /**
   * Navigate to checkout complete
   */
  async navigate(): Promise<void> {
    await this.page.goto('/checkout-complete.html');
  }

  /**
   * Click back to products button
   */
  async backToProducts(): Promise<void> {
    await this.backToProductsButton.click();
  }

  /**
   * Get complete header text
   */
  async getCompleteHeader(): Promise<string> {
    return await this.completeHeader.textContent() || '';
  }

  /**
   * Get complete text
   */
  async getCompleteText(): Promise<string> {
    return await this.completeText.textContent() || '';
  }

  /**
   * Verify complete header
   */
  async verifyCompleteHeader(expectedText: string): Promise<void> {
    await expect(this.completeHeader, `Complete header should be "${expectedText}"`).toHaveText(expectedText);
  }

  /**
   * Verify pony express image is displayed
   */
  async verifyPonyExpressImage(): Promise<void> {
    await expect(this.ponyExpressImage).toBeVisible();
  }

  /**
   * Verify navigation back to inventory
   */
  async verifyNavigationToInventory(): Promise<void> {
    await expect(this.page).toHaveURL(/inventory/);
  }
} 