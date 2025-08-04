import { Page, expect } from '@playwright/test';

export class InventoryPage {
  private readonly page: Page;
  
  // Locators using recommended strategies
  private readonly productSortContainer;
  private readonly shoppingCartBadge;
  private readonly shoppingCartLink;
  private readonly menuButton;
  private readonly menuItems;
  private readonly logoutLink;
  private readonly resetAppStateLink;

  constructor(page: Page) {
    this.page = page;
    this.productSortContainer = this.page.getByTestId('product-sort-container');
    this.shoppingCartBadge = this.page.getByTestId('shopping-cart-badge');
    this.shoppingCartLink = this.page.getByTestId('shopping-cart-link');
    this.menuButton = this.page.getByTestId('react-burger-menu-btn');
    this.menuItems = this.page.getByTestId('nav-menu');
    this.logoutLink = this.page.getByTestId('logout-sidebar-link');
    this.resetAppStateLink = this.page.getByTestId('reset-sidebar-link');
  }

  /**
   * Navigate to inventory page
   */
  async navigate(): Promise<void> {
    await this.page.goto('/inventory.html');
  }

  /**
   * Add product to cart by product name
   */
  async addProductToCart(productName: string): Promise<void> {
    const addButton = this.page.getByTestId(`add-to-cart-${productName.toLowerCase().replace(/\s+/g, '-')}`);
    await addButton.click();
  }

  /**
   * Remove product from cart by product name
   */
  async removeProductFromCart(productName: string): Promise<void> {
    const removeButton = this.page.getByTestId(`remove-${productName.toLowerCase().replace(/\s+/g, '-')}`);
    await removeButton.click();
  }

  /**
   * Get cart badge count
   */
  async getCartBadgeCount(): Promise<string> {
    return await this.shoppingCartBadge.textContent() || '0';
  }

  /**
   * Check if cart badge is visible
   */
  async isCartBadgeVisible(): Promise<boolean> {
    return await this.shoppingCartBadge.isVisible();
  }

  /**
   * Click shopping cart link
   */
  async clickShoppingCart(): Promise<void> {
    await this.shoppingCartLink.click();
  }

  /**
   * Sort products by option
   */
  async sortProducts(option: 'az' | 'za' | 'lohi' | 'hilo'): Promise<void> {
    await this.productSortContainer.selectOption(option);
  }

  /**
   * Get current sort option
   */
  async getCurrentSortOption(): Promise<string> {
    return await this.productSortContainer.inputValue();
  }

  /**
   * Open menu
   */
  async openMenu(): Promise<void> {
    await this.menuButton.click();
  }

  /**
   * Close menu
   */
  async closeMenu(): Promise<void> {
    await this.page.getByTestId('react-burger-cross-btn').click();
  }

  /**
   * Logout from menu
   */
  async logout(): Promise<void> {
    await this.openMenu();
    await this.logoutLink.click();
  }

  /**
   * Reset app state
   */
  async resetAppState(): Promise<void> {
    await this.openMenu();
    await this.resetAppStateLink.click();
  }

  /**
   * Get all product names
   */
  async getProductNames(): Promise<string[]> {
    return await this.page.locator('.inventory_item_name').allTextContents();
  }

  /**
   * Get all product prices
   */
  async getProductPrices(): Promise<string[]> {
    return await this.page.locator('.inventory_item_price').allTextContents();
  }

  /**
   * Verify products are sorted by name A-Z
   */
  async verifyProductsSortedByNameAZ(): Promise<void> {
    const productNames = await this.getProductNames();
    const sortedNames = [...productNames].sort();
    expect(productNames).toEqual(sortedNames);
  }

  /**
   * Verify products are sorted by name Z-A
   */
  async verifyProductsSortedByNameZA(): Promise<void> {
    const productNames = await this.getProductNames();
    const sortedNames = [...productNames].sort().reverse();
    expect(productNames).toEqual(sortedNames);
  }

  /**
   * Verify products are sorted by price low to high
   */
  async verifyProductsSortedByPriceLowToHigh(): Promise<void> {
    const productPrices = await this.getProductPrices();
    const priceNumbers = productPrices.map(price => parseFloat(price.replace('$', '')));
    const sortedPrices = [...priceNumbers].sort((a, b) => a - b);
    expect(priceNumbers).toEqual(sortedPrices);
  }

  /**
   * Verify products are sorted by price high to low
   */
  async verifyProductsSortedByPriceHighToLow(): Promise<void> {
    const productPrices = await this.getProductPrices();
    const priceNumbers = productPrices.map(price => parseFloat(price.replace('$', '')));
    const sortedPrices = [...priceNumbers].sort((a, b) => b - a);
    expect(priceNumbers).toEqual(sortedPrices);
  }

  /**
   * Verify cart badge shows expected count
   */
  async verifyCartBadgeCount(expectedCount: string): Promise<void> {
    await expect(this.shoppingCartBadge, `Cart badge should show count ${expectedCount}`).toHaveText(expectedCount);
  }

  /**
   * Verify menu is open
   */
  async verifyMenuIsOpen(): Promise<void> {
    await expect(this.menuItems).toBeVisible();
  }

  /**
   * Verify menu is closed
   */
  async verifyMenuIsClosed(): Promise<void> {
    await expect(this.menuItems).not.toBeVisible();
  }

  /**
   * Verify add to cart button is visible for product
   */
  async verifyAddToCartButtonVisible(productName: string): Promise<void> {
    const addButton = this.page.getByTestId(`add-to-cart-${productName.toLowerCase().replace(/\s+/g, '-')}`);
    await expect(addButton).toBeVisible();
    await expect(addButton).toHaveText('Add to cart');
  }

  /**
   * Verify remove button is visible for product
   */
  async verifyRemoveButtonVisible(productName: string): Promise<void> {
    const removeButton = this.page.getByTestId(`remove-${productName.toLowerCase().replace(/\s+/g, '-')}`);
    await expect(removeButton).toBeVisible();
    await expect(removeButton).toHaveText('Remove');
  }
} 