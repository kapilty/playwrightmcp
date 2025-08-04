import { Page, expect } from '@playwright/test';

export class CartPage {
  private readonly page: Page;
  
  // Locators using recommended strategies
  private readonly cartItems;
  private readonly continueShoppingButton;
  private readonly checkoutButton;
  private readonly cartTitle;

  constructor(page: Page) {
    this.page = page;
    this.cartItems = this.page.locator('.cart_item');
    this.continueShoppingButton = this.page.getByTestId('continue-shopping');
    this.checkoutButton = this.page.getByTestId('checkout');
    this.cartTitle = this.page.getByRole('heading', { name: 'Your Cart' });
  }

  /**
   * Navigate to cart page
   */
  async navigate(): Promise<void> {
    await this.page.goto('/cart.html');
  }

  /**
   * Get number of items in cart
   */
  async getCartItemCount(): Promise<number> {
    return await this.cartItems.count();
  }

  /**
   * Remove item from cart by product name
   */
  async removeItem(productName: string): Promise<void> {
    const removeButton = this.page.getByTestId(`remove-${productName.toLowerCase().replace(/\s+/g, '-')}`);
    await removeButton.click();
  }

  /**
   * Click continue shopping button
   */
  async continueShopping(): Promise<void> {
    await this.continueShoppingButton.click();
  }

  /**
   * Click checkout button
   */
  async checkout(): Promise<void> {
    await this.checkoutButton.click();
  }

  /**
   * Get item title by index
   */
  async getItemTitle(index: number): Promise<string> {
    return await this.cartItems.nth(index).locator('.inventory_item_name').textContent() || '';
  }

  /**
   * Get item price by index
   */
  async getItemPrice(index: number): Promise<string> {
    return await this.cartItems.nth(index).locator('.inventory_item_price').textContent() || '';
  }

  /**
   * Verify cart is empty
   */
  async verifyCartIsEmpty(): Promise<void> {
    await expect(this.cartItems).toHaveCount(0);
  }

  /**
   * Verify cart has specific number of items
   */
  async verifyCartItemCount(expectedCount: number): Promise<void> {
    await expect(this.cartItems, `Cart should have ${expectedCount} items`).toHaveCount(expectedCount);
  }

  /**
   * Verify specific item is in cart
   */
  async verifyItemInCart(productName: string): Promise<void> {
    const itemTitle = this.page.locator('.inventory_item_name').filter({ hasText: productName });
    await expect(itemTitle, `Product "${productName}" should be in cart`).toBeVisible();
  }

  /**
   * Verify cart title is displayed
   */
  async verifyCartTitle(): Promise<void> {
    await expect(this.cartTitle).toBeVisible();
  }

  /**
   * Verify checkout button is enabled
   */
  async verifyCheckoutButtonEnabled(): Promise<void> {
    await expect(this.checkoutButton).toBeEnabled();
  }

  /**
   * Verify checkout button is disabled
   */
  async verifyCheckoutButtonDisabled(): Promise<void> {
    await expect(this.checkoutButton).toBeDisabled();
  }
} 