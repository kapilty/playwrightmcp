import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { InventoryPage } from '../pages/inventory.page';
import { CartPage } from '../pages/cart.page';
import { CheckoutPage, CheckoutOverviewPage, CheckoutCompletePage } from '../pages/checkout.page';
import { createStandardUser, createValidCheckoutInfo, createSpecialCharCheckoutInfo, createEmptyCheckoutInfo, PRODUCT_NAMES } from '../testdata/factory';
import { ScreenshotUtil } from '../utils/screenshot';

test.describe('Checkout Process @checkout', () => {
  let loginPage: LoginPage;
  let inventoryPage: InventoryPage;
  let cartPage: CartPage;
  let checkoutPage: CheckoutPage;
  let checkoutOverviewPage: CheckoutOverviewPage;
  let checkoutCompletePage: CheckoutCompletePage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    inventoryPage = new InventoryPage(page);
    cartPage = new CartPage(page);
    checkoutPage = new CheckoutPage(page);
    checkoutOverviewPage = new CheckoutOverviewPage(page);
    checkoutCompletePage = new CheckoutCompletePage(page);
    
    // Login before each test
    const user = createStandardUser();
    await loginPage.navigate();
    await loginPage.login(user.username, user.password);
    await loginPage.verifySuccessfulLogin();
  });

  test('@smoke should complete full checkout process successfully', async ({ page }) => {
    // Add item to cart
    await inventoryPage.addProductToCart(PRODUCT_NAMES.BACKPACK);
    
    // Go to cart
    await inventoryPage.clickShoppingCart();
    
    // Click checkout
    await cartPage.checkout();
    
    // Fill checkout information
    const checkoutInfo = createValidCheckoutInfo();
    await checkoutPage.fillCheckoutInfo(checkoutInfo);
    
    // Continue to overview
    await checkoutPage.continue();
    
    // Verify checkout overview page
    await checkoutPage.verifyNavigationToOverview();
    
    // Verify item details
    await expect(page.locator('[data-test="item-4-title"]')).toHaveText(PRODUCT_NAMES.BACKPACK);
    await expect(page.locator('[data-test="item-4-price"]')).toHaveText('$29.99');
    
    // Verify payment and shipping info
    await checkoutOverviewPage.verifyPaymentInfoDisplayed();
    await checkoutOverviewPage.verifyShippingInfoDisplayed();
    
    // Complete checkout
    await checkoutOverviewPage.finish();
    
    // Verify checkout complete page
    await checkoutOverviewPage.verifyNavigationToComplete();
    await checkoutCompletePage.verifyCompleteHeader('Thank you for your order!');
    
    await ScreenshotUtil.takeScreenshotOnSuccess(page, 'complete-checkout');
  });

  test('@regression should validate empty first name field', async ({ page }) => {
    // Add item and go to checkout
    await inventoryPage.addProductToCart(PRODUCT_NAMES.BACKPACK);
    await inventoryPage.clickShoppingCart();
    await cartPage.checkout();
    
    // Fill only last name and postal code
    const checkoutInfo = createValidCheckoutInfo();
    await checkoutPage.fillLastName(checkoutInfo.lastName);
    await checkoutPage.fillPostalCode(checkoutInfo.postalCode);
    
    // Try to continue
    await checkoutPage.continue();
    
    // Verify error message
    await checkoutPage.verifyErrorMessage('First Name is required');
    
    await ScreenshotUtil.takeScreenshotOnSuccess(page, 'empty-firstname');
  });

  test('@regression should validate empty last name field', async ({ page }) => {
    // Add item and go to checkout
    await inventoryPage.addProductToCart(PRODUCT_NAMES.BACKPACK);
    await inventoryPage.clickShoppingCart();
    await cartPage.checkout();
    
    // Fill only first name and postal code
    const checkoutInfo = createValidCheckoutInfo();
    await checkoutPage.fillFirstName(checkoutInfo.firstName);
    await checkoutPage.fillPostalCode(checkoutInfo.postalCode);
    
    // Try to continue
    await checkoutPage.continue();
    
    // Verify error message
    await checkoutPage.verifyErrorMessage('Last Name is required');
    
    await ScreenshotUtil.takeScreenshotOnSuccess(page, 'empty-lastname');
  });

  test('@regression should validate empty postal code field', async ({ page }) => {
    // Add item and go to checkout
    await inventoryPage.addProductToCart(PRODUCT_NAMES.BACKPACK);
    await inventoryPage.clickShoppingCart();
    await cartPage.checkout();
    
    // Fill only first name and last name
    const checkoutInfo = createValidCheckoutInfo();
    await checkoutPage.fillFirstName(checkoutInfo.firstName);
    await checkoutPage.fillLastName(checkoutInfo.lastName);
    
    // Try to continue
    await checkoutPage.continue();
    
    // Verify error message
    await checkoutPage.verifyErrorMessage('Postal Code is required');
    
    await ScreenshotUtil.takeScreenshotOnSuccess(page, 'empty-postalcode');
  });

  test('@regression should cancel checkout and return to inventory', async ({ page }) => {
    // Add item and go to checkout
    await inventoryPage.addProductToCart(PRODUCT_NAMES.BACKPACK);
    await inventoryPage.clickShoppingCart();
    await cartPage.checkout();
    
    // Click cancel
    await checkoutPage.cancel();
    
    // Verify back to inventory page
    await checkoutPage.verifyNavigationToInventory();
    
    // Verify cart still has item
    await inventoryPage.verifyCartBadgeCount('1');
    
    await ScreenshotUtil.takeScreenshotOnSuccess(page, 'cancel-checkout');
  });

  test('@regression should verify checkout overview with multiple items', async ({ page }) => {
    // Add multiple items
    await inventoryPage.addProductToCart(PRODUCT_NAMES.BACKPACK);
    await inventoryPage.addProductToCart(PRODUCT_NAMES.BIKE_LIGHT);
    await inventoryPage.addProductToCart(PRODUCT_NAMES.BOLT_TSHIRT);
    
    // Go to checkout
    await inventoryPage.clickShoppingCart();
    await cartPage.checkout();
    
    // Fill information
    const checkoutInfo = createValidCheckoutInfo();
    await checkoutPage.fillCheckoutInfo(checkoutInfo);
    await checkoutPage.continue();
    
    // Verify overview page shows all items
    await expect(page.locator('.cart_item')).toHaveCount(3);
    await expect(page.locator('[data-test="item-4-title"]')).toHaveText(PRODUCT_NAMES.BACKPACK);
    await expect(page.locator('[data-test="item-0-title"]')).toHaveText(PRODUCT_NAMES.BIKE_LIGHT);
    await expect(page.locator('[data-test="item-1-title"]')).toHaveText(PRODUCT_NAMES.BOLT_TSHIRT);
    
    // Verify subtotal calculation
    const subtotal = await checkoutOverviewPage.getSubtotal();
    expect(subtotal).toContain('$55.97'); // $29.99 + $9.99 + $15.99
    
    await ScreenshotUtil.takeScreenshotOnSuccess(page, 'checkout-overview-multiple');
  });

  test('@regression should verify payment and shipping information display', async ({ page }) => {
    // Add item and complete checkout information
    await inventoryPage.addProductToCart(PRODUCT_NAMES.BACKPACK);
    await inventoryPage.clickShoppingCart();
    await cartPage.checkout();
    
    const checkoutInfo = createValidCheckoutInfo();
    await checkoutPage.fillCheckoutInfo(checkoutInfo);
    await checkoutPage.continue();
    
    // Verify payment information is displayed
    await checkoutOverviewPage.verifyPaymentInfoDisplayed();
    const paymentInfo = await checkoutOverviewPage.getPaymentInfo();
    expect(paymentInfo).toContain('SauceCard');
    
    // Verify shipping information is displayed
    await checkoutOverviewPage.verifyShippingInfoDisplayed();
    const shippingInfo = await checkoutOverviewPage.getShippingInfo();
    expect(shippingInfo).toContain('Free Pony Express Delivery');
    
    await ScreenshotUtil.takeScreenshotOnSuccess(page, 'payment-shipping-info');
  });

  test('@regression should verify checkout complete page elements', async ({ page }) => {
    // Complete checkout process
    await inventoryPage.addProductToCart(PRODUCT_NAMES.BACKPACK);
    await inventoryPage.clickShoppingCart();
    await cartPage.checkout();
    
    const checkoutInfo = createValidCheckoutInfo();
    await checkoutPage.fillCheckoutInfo(checkoutInfo);
    await checkoutPage.continue();
    await checkoutOverviewPage.finish();
    
    // Verify complete page elements
    await expect(page.locator('.title')).toHaveText('Checkout: Complete!');
    await checkoutCompletePage.verifyCompleteHeader('Thank you for your order!');
    
    const completeText = await checkoutCompletePage.getCompleteText();
    expect(completeText).toContain('Your order has been dispatched');
    
    // Verify pony express image is displayed
    await checkoutCompletePage.verifyPonyExpressImage();
    
    await ScreenshotUtil.takeScreenshotOnSuccess(page, 'checkout-complete-elements');
  });

  test('@regression should return to inventory from checkout complete page', async ({ page }) => {
    // Complete checkout process
    await inventoryPage.addProductToCart(PRODUCT_NAMES.BACKPACK);
    await inventoryPage.clickShoppingCart();
    await cartPage.checkout();
    
    const checkoutInfo = createValidCheckoutInfo();
    await checkoutPage.fillCheckoutInfo(checkoutInfo);
    await checkoutPage.continue();
    await checkoutOverviewPage.finish();
    
    // Click back home
    await checkoutCompletePage.backToProducts();
    
    // Verify back to inventory page
    await checkoutCompletePage.verifyNavigationToInventory();
    
    // Verify cart is empty after successful checkout
    await expect(inventoryPage.isCartBadgeVisible()).resolves.toBe(false);
    
    await ScreenshotUtil.takeScreenshotOnSuccess(page, 'back-to-inventory');
  });

  test('@regression should handle special characters in checkout form', async ({ page }) => {
    // Add item and go to checkout
    await inventoryPage.addProductToCart(PRODUCT_NAMES.BACKPACK);
    await inventoryPage.clickShoppingCart();
    await cartPage.checkout();
    
    // Fill with special characters
    const specialCheckoutInfo = createSpecialCharCheckoutInfo();
    await checkoutPage.fillCheckoutInfo(specialCheckoutInfo);
    
    // Continue to overview
    await checkoutPage.continue();
    
    // Verify successful navigation to overview
    await checkoutPage.verifyNavigationToOverview();
    
    await ScreenshotUtil.takeScreenshotOnSuccess(page, 'special-characters-checkout');
  });

  test('@regression should verify total calculation in checkout overview', async ({ page }) => {
    // Add multiple items with different prices
    await inventoryPage.addProductToCart(PRODUCT_NAMES.BACKPACK); // $29.99
    await inventoryPage.addProductToCart(PRODUCT_NAMES.ONESIE);    // $7.99
    
    // Go to checkout
    await inventoryPage.clickShoppingCart();
    await cartPage.checkout();
    
    const checkoutInfo = createValidCheckoutInfo();
    await checkoutPage.fillCheckoutInfo(checkoutInfo);
    await checkoutPage.continue();
    
    // Verify subtotal, tax, and total calculations
    const subtotal = await checkoutOverviewPage.getSubtotal();
    const tax = await checkoutOverviewPage.getTax();
    const total = await checkoutOverviewPage.getTotal();
    
    expect(subtotal).toContain('$37.98'); // $29.99 + $7.99
    expect(tax).toContain('$2.40'); // 6.25% tax
    expect(total).toContain('$40.38'); // subtotal + tax
    
    await ScreenshotUtil.takeScreenshotOnSuccess(page, 'total-calculation');
  });
}); 