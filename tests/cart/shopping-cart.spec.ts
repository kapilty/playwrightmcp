import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { InventoryPage } from '../pages/inventory.page';
import { CartPage } from '../pages/cart.page';
import { createStandardUser, PRODUCT_NAMES } from '../testdata/factory';
import { ScreenshotUtil } from '../utils/screenshot';

test.describe('Shopping Cart @cart', () => {
  let loginPage: LoginPage;
  let inventoryPage: InventoryPage;
  let cartPage: CartPage;

  test.beforeEach(async ({ page }) => {
    // Initialize page objects
    loginPage = new LoginPage(page);
    inventoryPage = new InventoryPage(page);
    cartPage = new CartPage(page);
    
    // Setup: Login before each test for consistent state
    const user = createStandardUser();
    await loginPage.navigate();
    await loginPage.login(user.username, user.password);
    await loginPage.verifySuccessfulLogin();
  });

  test.describe('Cart Badge Functionality @ui', () => {
    test('@smoke should display cart badge when adding single item', async ({ page }) => {
      // Verify initial state: cart badge should not be visible
      await expect(
        inventoryPage.isCartBadgeVisible(),
        'Cart badge should not be visible initially'
      ).resolves.toBe(false);
      
      // Action: Add item to cart
      await inventoryPage.addProductToCart(PRODUCT_NAMES.BACKPACK);
      
      // Assert: Cart badge should display count "1"
      await expect(
        inventoryPage.verifyCartBadgeCount('1'),
        'Cart badge should show count "1" after adding item'
      ).resolves.toBeUndefined();
      
      await ScreenshotUtil.takeScreenshotOnSuccess(page, 'cart-badge-single-item');
    });

    test('@regression should update cart badge count for multiple items', async ({ page }) => {
      // Action: Add multiple items to cart
      await inventoryPage.addProductToCart(PRODUCT_NAMES.BACKPACK);
      await inventoryPage.addProductToCart(PRODUCT_NAMES.BIKE_LIGHT);
      await inventoryPage.addProductToCart(PRODUCT_NAMES.BOLT_TSHIRT);
      
      // Assert: Cart badge should display correct count
      await expect(
        inventoryPage.verifyCartBadgeCount('3'),
        'Cart badge should show count "3" for three items'
      ).resolves.toBeUndefined();
      
      await ScreenshotUtil.takeScreenshotOnSuccess(page, 'cart-badge-multiple-items');
    });

    test('@regression should decrease cart badge count when removing items', async ({ page }) => {
      // Setup: Add two items to cart
      await inventoryPage.addProductToCart(PRODUCT_NAMES.BACKPACK);
      await inventoryPage.addProductToCart(PRODUCT_NAMES.BIKE_LIGHT);
      
      // Verify initial count
      await expect(
        inventoryPage.verifyCartBadgeCount('2'),
        'Cart badge should show count "2" initially'
      ).resolves.toBeUndefined();
      
      // Action: Remove one item
      await inventoryPage.removeProductFromCart(PRODUCT_NAMES.BACKPACK);
      
      // Assert: Cart badge should update to "1"
      await expect(
        inventoryPage.verifyCartBadgeCount('1'),
        'Cart badge should decrease to "1" after removing item'
      ).resolves.toBeUndefined();
      
      await ScreenshotUtil.takeScreenshotOnSuccess(page, 'cart-badge-decrease-count');
    });
  });

  test.describe('Cart Page Navigation @e2e', () => {
    test('@regression should navigate to cart page and display added items', async ({ page }) => {
      // Setup: Add items to cart
      await inventoryPage.addProductToCart(PRODUCT_NAMES.BACKPACK);
      await inventoryPage.addProductToCart(PRODUCT_NAMES.BIKE_LIGHT);
      
      // Action: Navigate to cart page
      await inventoryPage.clickShoppingCart();
      
      // Assert: Should be on cart page
      await expect(
        page,
        'Should navigate to cart page'
      ).toHaveURL(/cart/);
      
      await expect(
        cartPage.verifyCartTitle(),
        'Cart page title should be visible'
      ).resolves.toBeUndefined();
      
      // Assert: Items should be displayed in cart
      await expect(
        cartPage.verifyItemInCart(PRODUCT_NAMES.BACKPACK),
        'Backpack should be visible in cart'
      ).resolves.toBeUndefined();
      
      await expect(
        cartPage.verifyItemInCart(PRODUCT_NAMES.BIKE_LIGHT),
        'Bike light should be visible in cart'
      ).resolves.toBeUndefined();
      
      // Assert: Correct item count
      await expect(
        cartPage.verifyCartItemCount(2),
        'Cart should contain exactly 2 items'
      ).resolves.toBeUndefined();
      
      await ScreenshotUtil.takeScreenshotOnSuccess(page, 'cart-page-items-display');
    });

    test('@regression should handle empty cart state correctly', async ({ page }) => {
      // Action: Navigate to cart without adding items
      await inventoryPage.clickShoppingCart();
      
      // Assert: Should be on cart page
      await expect(
        page,
        'Should navigate to cart page'
      ).toHaveURL(/cart/);
      
      await expect(
        cartPage.verifyCartTitle(),
        'Cart page title should be visible'
      ).resolves.toBeUndefined();
      
      // Assert: Cart should be empty
      await expect(
        cartPage.verifyCartIsEmpty(),
        'Cart should display empty state'
      ).resolves.toBeUndefined();
      
      // Assert: Checkout button should be disabled
      await expect(
        cartPage.verifyCheckoutButtonDisabled(),
        'Checkout button should be disabled for empty cart'
      ).resolves.toBeUndefined();
      
      await ScreenshotUtil.takeScreenshotOnSuccess(page, 'cart-page-empty-state');
    });
  });

  test.describe('Cart Page Interactions @ui', () => {
    test('@regression should remove items from cart page and update badge', async ({ page }) => {
      // Setup: Add items and navigate to cart
      await inventoryPage.addProductToCart(PRODUCT_NAMES.BACKPACK);
      await inventoryPage.addProductToCart(PRODUCT_NAMES.BIKE_LIGHT);
      await inventoryPage.clickShoppingCart();
      
      // Action: Remove item from cart page
      await cartPage.removeItem(PRODUCT_NAMES.BACKPACK);
      
      // Assert: Item count should decrease
      await expect(
        cartPage.verifyCartItemCount(1),
        'Cart should contain only 1 item after removal'
      ).resolves.toBeUndefined();
      
      // Assert: Remaining item should still be present
      await expect(
        cartPage.verifyItemInCart(PRODUCT_NAMES.BIKE_LIGHT),
        'Bike light should remain in cart'
      ).resolves.toBeUndefined();
      
      // Assert: Cart badge should be updated
      await expect(
        inventoryPage.verifyCartBadgeCount('1'),
        'Cart badge should reflect updated count'
      ).resolves.toBeUndefined();
      
      await ScreenshotUtil.takeScreenshotOnSuccess(page, 'cart-page-remove-item');
    });

    test('@regression should continue shopping and return to inventory page', async ({ page }) => {
      // Setup: Add item and navigate to cart
      await inventoryPage.addProductToCart(PRODUCT_NAMES.BACKPACK);
      await inventoryPage.clickShoppingCart();
      
      // Action: Click continue shopping
      await cartPage.continueShopping();
      
      // Assert: Should return to inventory page
      await expect(
        page,
        'Should navigate back to inventory page'
      ).toHaveURL(/inventory/);
      
      await expect(
        page.getByRole('heading', { name: 'Products' }),
        'Products heading should be visible'
      ).toBeVisible();
      
      // Assert: Cart badge should maintain count
      await expect(
        inventoryPage.verifyCartBadgeCount('1'),
        'Cart badge should maintain item count'
      ).resolves.toBeUndefined();
      
      await ScreenshotUtil.takeScreenshotOnSuccess(page, 'cart-page-continue-shopping');
    });
  });

  test.describe('Checkout Flow Integration @e2e', () => {
    test('@regression should proceed to checkout from cart page', async ({ page }) => {
      // Setup: Add item and navigate to cart
      await inventoryPage.addProductToCart(PRODUCT_NAMES.BACKPACK);
      await inventoryPage.clickShoppingCart();
      
      // Action: Click checkout button
      await cartPage.checkout();
      
      // Assert: Should navigate to checkout page
      await expect(
        page,
        'Should navigate to checkout information page'
      ).toHaveURL(/checkout-step-one/);
      
      await expect(
        page.getByRole('heading', { name: 'Checkout: Your Information' }),
        'Checkout information heading should be visible'
      ).toBeVisible();
      
      await ScreenshotUtil.takeScreenshotOnSuccess(page, 'cart-page-checkout-flow');
    });
  });

  test.describe('Product Management @regression', () => {
    test('@regression should add all available products to cart', async ({ page }) => {
      // Action: Add all 6 products to cart
      await inventoryPage.addProductToCart(PRODUCT_NAMES.BACKPACK);
      await inventoryPage.addProductToCart(PRODUCT_NAMES.BIKE_LIGHT);
      await inventoryPage.addProductToCart(PRODUCT_NAMES.BOLT_TSHIRT);
      await inventoryPage.addProductToCart(PRODUCT_NAMES.FLEECE_JACKET);
      await inventoryPage.addProductToCart(PRODUCT_NAMES.ONESIE);
      await inventoryPage.addProductToCart(PRODUCT_NAMES.TEST_TSHIRT);
      
      // Assert: Cart badge should show total count
      await expect(
        inventoryPage.verifyCartBadgeCount('6'),
        'Cart badge should show count "6" for all products'
      ).resolves.toBeUndefined();
      
      // Action: Navigate to cart page
      await inventoryPage.clickShoppingCart();
      
      // Assert: All items should be in cart
      await expect(
        cartPage.verifyCartItemCount(6),
        'Cart should contain all 6 products'
      ).resolves.toBeUndefined();
      
      await ScreenshotUtil.takeScreenshotOnSuccess(page, 'cart-all-products');
    });

    test('@regression should toggle add/remove button states correctly', async ({ page }) => {
      // Assert: Initially, add button should be visible
      await expect(
        inventoryPage.verifyAddToCartButtonVisible(PRODUCT_NAMES.BACKPACK),
        'Add to cart button should be visible initially'
      ).resolves.toBeUndefined();
      
      // Action: Add item to cart
      await inventoryPage.addProductToCart(PRODUCT_NAMES.BACKPACK);
      
      // Assert: Button should change to remove state
      await expect(
        inventoryPage.verifyRemoveButtonVisible(PRODUCT_NAMES.BACKPACK),
        'Remove button should be visible after adding item'
      ).resolves.toBeUndefined();
      
      // Action: Remove item from cart
      await inventoryPage.removeProductFromCart(PRODUCT_NAMES.BACKPACK);
      
      // Assert: Button should return to add state
      await expect(
        inventoryPage.verifyAddToCartButtonVisible(PRODUCT_NAMES.BACKPACK),
        'Add to cart button should be visible after removing item'
      ).resolves.toBeUndefined();
      
      await ScreenshotUtil.takeScreenshotOnSuccess(page, 'cart-button-state-toggle');
    });
  });
}); 