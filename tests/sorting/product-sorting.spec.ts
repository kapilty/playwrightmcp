import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { InventoryPage } from '../pages/inventory.page';
import { createStandardUser, SORT_OPTIONS } from '../testdata/factory';
import { ScreenshotUtil } from '../utils/screenshot';

test.describe('Product Sorting @sorting', () => {
  let loginPage: LoginPage;
  let inventoryPage: InventoryPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    inventoryPage = new InventoryPage(page);
    
    // Login before each test
    const user = createStandardUser();
    await loginPage.navigate();
    await loginPage.login(user.username, user.password);
    await loginPage.verifySuccessfulLogin();
  });

  test('@smoke should sort products by name A to Z (default)', async ({ page }) => {
    // Verify default sort is "Name (A to Z)"
    await expect(inventoryPage.getCurrentSortOption()).resolves.toBe(SORT_OPTIONS.NAME_AZ);
    
    // Verify products are sorted alphabetically A to Z
    await inventoryPage.verifyProductsSortedByNameAZ();
    
    // Verify first product is "Sauce Labs Backpack"
    const productNames = await inventoryPage.getProductNames();
    expect(productNames[0]).toBe('Sauce Labs Backpack');
    
    await ScreenshotUtil.takeScreenshotOnSuccess(page, 'sort-name-az');
  });

  test('@regression should sort products by name Z to A', async ({ page }) => {
    // Change sort to "Name (Z to A)"
    await inventoryPage.sortProducts(SORT_OPTIONS.NAME_ZA);
    
    // Verify sort option is selected
    await expect(inventoryPage.getCurrentSortOption()).resolves.toBe(SORT_OPTIONS.NAME_ZA);
    
    // Verify products are sorted alphabetically Z to A
    await inventoryPage.verifyProductsSortedByNameZA();
    
    // Verify first product is "Test.allTheThings() T-Shirt (Red)"
    const productNames = await inventoryPage.getProductNames();
    expect(productNames[0]).toBe('Test.allTheThings() T-Shirt (Red)');
    
    await ScreenshotUtil.takeScreenshotOnSuccess(page, 'sort-name-za');
  });

  test('@regression should sort products by price low to high', async ({ page }) => {
    // Change sort to "Price (low to high)"
    await inventoryPage.sortProducts(SORT_OPTIONS.PRICE_LOW_HIGH);
    
    // Verify sort option is selected
    await expect(inventoryPage.getCurrentSortOption()).resolves.toBe(SORT_OPTIONS.PRICE_LOW_HIGH);
    
    // Verify prices are sorted from low to high
    await inventoryPage.verifyProductsSortedByPriceLowToHigh();
    
    // Verify first product has lowest price ($7.99)
    const productPrices = await inventoryPage.getProductPrices();
    expect(productPrices[0]).toBe('$7.99');
    
    await ScreenshotUtil.takeScreenshotOnSuccess(page, 'sort-price-low-high');
  });

  test('@regression should sort products by price high to low', async ({ page }) => {
    // Change sort to "Price (high to low)"
    await inventoryPage.sortProducts(SORT_OPTIONS.PRICE_HIGH_LOW);
    
    // Verify sort option is selected
    await expect(inventoryPage.getCurrentSortOption()).resolves.toBe(SORT_OPTIONS.PRICE_HIGH_LOW);
    
    // Verify prices are sorted from high to low
    await inventoryPage.verifyProductsSortedByPriceHighToLow();
    
    // Verify first product has highest price ($49.99)
    const productPrices = await inventoryPage.getProductPrices();
    expect(productPrices[0]).toBe('$49.99');
    
    await ScreenshotUtil.takeScreenshotOnSuccess(page, 'sort-price-high-low');
  });

  test('@regression should maintain sort order when adding items to cart', async ({ page }) => {
    // Sort by price low to high
    await inventoryPage.sortProducts(SORT_OPTIONS.PRICE_LOW_HIGH);
    
    // Add first item to cart
    await inventoryPage.addProductToCart('Sauce Labs Onesie');
    
    // Verify sort order is maintained
    await expect(inventoryPage.getCurrentSortOption()).resolves.toBe(SORT_OPTIONS.PRICE_LOW_HIGH);
    const productPrices = await inventoryPage.getProductPrices();
    expect(productPrices[0]).toBe('$7.99');
    
    // Add another item
    await inventoryPage.addProductToCart('Sauce Labs Bike Light');
    
    // Verify sort order is still maintained
    await expect(inventoryPage.getCurrentSortOption()).resolves.toBe(SORT_OPTIONS.PRICE_LOW_HIGH);
    const updatedPrices = await inventoryPage.getProductPrices();
    expect(updatedPrices[0]).toBe('$7.99');
    
    await ScreenshotUtil.takeScreenshotOnSuccess(page, 'sort-maintained-with-cart');
  });

  test('@regression should verify all sorting options are available', async ({ page }) => {
    // Verify all 4 sorting options are present
    const sortOptions = page.locator('[data-test="product-sort-container"] option');
    await expect(sortOptions).toHaveCount(4);
    
    // Verify option texts
    await expect(sortOptions.nth(0)).toHaveText('Name (A to Z)');
    await expect(sortOptions.nth(1)).toHaveText('Name (Z to A)');
    await expect(sortOptions.nth(2)).toHaveText('Price (low to high)');
    await expect(sortOptions.nth(3)).toHaveText('Price (high to low)');
    
    await ScreenshotUtil.takeScreenshotOnSuccess(page, 'sort-options-available');
  });

  test('@regression should verify product count remains same after sorting', async ({ page }) => {
    // Count products initially
    const initialProductCount = await page.locator('.inventory_item').count();
    expect(initialProductCount).toBe(6);
    
    // Sort by different options and verify count remains same
    await inventoryPage.sortProducts(SORT_OPTIONS.NAME_ZA);
    let productCount = await page.locator('.inventory_item').count();
    expect(productCount).toBe(6);
    
    await inventoryPage.sortProducts(SORT_OPTIONS.PRICE_LOW_HIGH);
    productCount = await page.locator('.inventory_item').count();
    expect(productCount).toBe(6);
    
    await inventoryPage.sortProducts(SORT_OPTIONS.PRICE_HIGH_LOW);
    productCount = await page.locator('.inventory_item').count();
    expect(productCount).toBe(6);
    
    await ScreenshotUtil.takeScreenshotOnSuccess(page, 'sort-product-count');
  });

  test('@regression should verify product details remain intact after sorting', async ({ page }) => {
    // Get product details before sorting
    const productNames = await inventoryPage.getProductNames();
    const productPrices = await inventoryPage.getProductPrices();
    const productDescriptions = await page.locator('.inventory_item_desc').allTextContents();
    
    // Sort by price high to low
    await inventoryPage.sortProducts(SORT_OPTIONS.PRICE_HIGH_LOW);
    
    // Verify all product details are still present (just in different order)
    const sortedProductNames = await inventoryPage.getProductNames();
    const sortedProductPrices = await inventoryPage.getProductPrices();
    const sortedProductDescriptions = await page.locator('.inventory_item_desc').allTextContents();
    
    // Verify all original products are still present
    expect(sortedProductNames.sort()).toEqual(productNames.sort());
    expect(sortedProductPrices.sort()).toEqual(productPrices.sort());
    expect(sortedProductDescriptions.sort()).toEqual(productDescriptions.sort());
    
    await ScreenshotUtil.takeScreenshotOnSuccess(page, 'sort-product-details');
  });

  test('@regression should verify sort dropdown is accessible and functional', async ({ page }) => {
    // Verify sort dropdown is visible and enabled
    const sortDropdown = page.locator('[data-test="product-sort-container"]');
    await expect(sortDropdown).toBeVisible();
    await expect(sortDropdown).toBeEnabled();
    
    // Verify dropdown can be clicked and options can be selected
    await sortDropdown.click();
    
    // Select each option and verify it works
    const options = [SORT_OPTIONS.NAME_AZ, SORT_OPTIONS.NAME_ZA, SORT_OPTIONS.PRICE_LOW_HIGH, SORT_OPTIONS.PRICE_HIGH_LOW];
    
    for (const option of options) {
      await inventoryPage.sortProducts(option);
      await expect(inventoryPage.getCurrentSortOption()).resolves.toBe(option);
    }
    
    await ScreenshotUtil.takeScreenshotOnSuccess(page, 'sort-dropdown-functional');
  });
}); 