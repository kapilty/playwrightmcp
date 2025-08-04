import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { InventoryPage } from '../pages/inventory.page';
import { createStandardUser, PRODUCT_NAMES } from '../testdata/factory';
import { ScreenshotUtil } from '../utils/screenshot';

test.describe('Navigation & Menu @navigation', () => {
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

  test('@smoke should open and close menu successfully', async ({ page }) => {
    // Verify menu is initially closed
    await inventoryPage.verifyMenuIsClosed();
    
    // Open menu
    await inventoryPage.openMenu();
    
    // Verify menu is open
    await inventoryPage.verifyMenuIsOpen();
    
    // Verify menu items are present
    await expect(page.getByTestId('inventory-sidebar-link')).toHaveText('All Items');
    await expect(page.getByTestId('about-sidebar-link')).toHaveText('About');
    await expect(page.getByTestId('logout-sidebar-link')).toHaveText('Logout');
    await expect(page.getByTestId('reset-sidebar-link')).toHaveText('Reset App State');
    
    // Close menu
    await inventoryPage.closeMenu();
    
    // Verify menu is closed
    await inventoryPage.verifyMenuIsClosed();
    
    await ScreenshotUtil.takeScreenshotOnSuccess(page, 'menu-open-close');
  });

  test('@regression should navigate to All Items from menu', async ({ page }) => {
    // Add item to cart first
    await inventoryPage.addProductToCart(PRODUCT_NAMES.BACKPACK);
    
    // Navigate to cart
    await inventoryPage.clickShoppingCart();
    
    // Open menu and click All Items
    await inventoryPage.openMenu();
    await page.getByTestId('inventory-sidebar-link').click();
    
    // Verify back to inventory page
    await expect(page).toHaveURL(/inventory/);
    await expect(page.getByRole('heading', { name: 'Products' })).toBeVisible();
    
    // Verify cart badge still shows item count
    await inventoryPage.verifyCartBadgeCount('1');
    
    await ScreenshotUtil.takeScreenshotOnSuccess(page, 'menu-all-items');
  });

  test('@regression should navigate to About page from menu', async ({ page }) => {
    // Open menu and click About
    await inventoryPage.openMenu();
    await page.getByTestId('about-sidebar-link').click();
    
    // Verify navigation to Sauce Labs website
    await expect(page).toHaveURL(/saucelabs\.com/);
    
    await ScreenshotUtil.takeScreenshotOnSuccess(page, 'menu-about');
  });

  test('@regression should logout from menu', async ({ page }) => {
    // Open menu and click Logout
    await inventoryPage.logout();
    
    // Verify logout successful
    await expect(page).toHaveURL(/saucedemo\.com\/$/);
    await expect(page.getByTestId('login-button')).toBeVisible();
    
    await ScreenshotUtil.takeScreenshotOnSuccess(page, 'menu-logout');
  });

  test('@regression should reset app state from menu', async ({ page }) => {
    // Add items to cart first
    await inventoryPage.addProductToCart(PRODUCT_NAMES.BACKPACK);
    await inventoryPage.addProductToCart(PRODUCT_NAMES.BIKE_LIGHT);
    
    // Verify cart has items
    await inventoryPage.verifyCartBadgeCount('2');
    
    // Open menu and click Reset App State
    await inventoryPage.resetAppState();
    
    // Verify cart is cleared
    await expect(inventoryPage.isCartBadgeVisible()).resolves.toBe(false);
    
    // Verify all buttons are back to "Add to cart"
    const addButton = page.getByTestId(`add-to-cart-${PRODUCT_NAMES.BACKPACK.toLowerCase().replace(/\s+/g, '-')}`);
    await expect(addButton).toHaveText('Add to cart');
    
    await ScreenshotUtil.takeScreenshotOnSuccess(page, 'menu-reset-state');
  });

  test('@regression should navigate to cart from header', async ({ page }) => {
    // Add item to cart
    await inventoryPage.addProductToCart(PRODUCT_NAMES.BACKPACK);
    
    // Click cart icon in header
    await inventoryPage.clickShoppingCart();
    
    // Verify navigation to cart page
    await expect(page).toHaveURL(/cart/);
    await expect(page.getByRole('heading', { name: 'Your Cart' })).toBeVisible();
    
    // Verify item is in cart
    await expect(page.locator('[data-test="item-4-title"]')).toHaveText(PRODUCT_NAMES.BACKPACK);
    
    await ScreenshotUtil.takeScreenshotOnSuccess(page, 'header-cart-navigation');
  });

  test('@regression should navigate to product detail page', async ({ page }) => {
    // Click on first product
    await page.getByTestId('item-4-title').click();
    
    // Verify navigation to product detail page
    await expect(page).toHaveURL(/inventory-item\.html\?id=4/);
    
    // Verify product details are displayed
    await expect(page.getByTestId('item-4-title')).toHaveText(PRODUCT_NAMES.BACKPACK);
    await expect(page.getByTestId('item-4-price')).toHaveText('$29.99');
    await expect(page.getByTestId('item-4-desc')).toContainText('carry.allTheThings()');
    
    await ScreenshotUtil.takeScreenshotOnSuccess(page, 'product-detail-page');
  });

  test('@regression should navigate back from product detail page', async ({ page }) => {
    // Go to product detail page
    await page.getByTestId('item-4-title').click();
    await expect(page).toHaveURL(/inventory-item\.html\?id=4/);
    
    // Click back button
    await page.getByTestId('back-to-products').click();
    
    // Verify back to inventory page
    await expect(page).toHaveURL(/inventory/);
    await expect(page.getByRole('heading', { name: 'Products' })).toBeVisible();
    
    await ScreenshotUtil.takeScreenshotOnSuccess(page, 'back-from-product-detail');
  });

  test('@regression should verify menu accessibility and keyboard navigation', async ({ page }) => {
    // Verify menu button is accessible
    const menuButton = page.getByTestId('react-burger-menu-btn');
    await expect(menuButton).toBeVisible();
    await expect(menuButton).toBeEnabled();
    
    // Open menu with keyboard
    await menuButton.focus();
    await page.keyboard.press('Enter');
    
    // Verify menu is open
    await inventoryPage.verifyMenuIsOpen();
    
    // Navigate menu items with keyboard
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    
    // Verify logout successful
    await expect(page).toHaveURL(/saucedemo\.com\/$/);
    
    await ScreenshotUtil.takeScreenshotOnSuccess(page, 'menu-keyboard-navigation');
  });

  test('@regression should verify footer links functionality', async ({ page }) => {
    // Verify footer links are present
    await expect(page.locator('a[href="https://twitter.com/saucelabs"]')).toBeVisible();
    await expect(page.locator('a[href="https://www.facebook.com/saucelabs"]')).toBeVisible();
    await expect(page.locator('a[href="https://www.linkedin.com/company/sauce-labs/"]')).toBeVisible();
    
    // Click Twitter link
    await page.locator('a[href="https://twitter.com/saucelabs"]').click();
    
    // Verify navigation to Twitter (in new tab)
    const newPage = await page.context().waitForEvent('page');
    await expect(newPage).toHaveURL(/twitter\.com/);
    
    await ScreenshotUtil.takeScreenshotOnSuccess(page, 'footer-links');
  });

  test('@regression should verify app logo navigation', async ({ page }) => {
    // Add item to cart and go to cart page
    await inventoryPage.addProductToCart(PRODUCT_NAMES.BACKPACK);
    await inventoryPage.clickShoppingCart();
    
    // Click on app logo
    await page.locator('.app_logo').click();
    
    // Verify navigation back to inventory page
    await expect(page).toHaveURL(/inventory/);
    await expect(page.getByRole('heading', { name: 'Products' })).toBeVisible();
    
    // Verify cart badge still shows item count
    await inventoryPage.verifyCartBadgeCount('1');
    
    await ScreenshotUtil.takeScreenshotOnSuccess(page, 'logo-navigation');
  });

  test('@regression should verify menu state persistence across page navigation', async ({ page }) => {
    // Open menu
    await inventoryPage.openMenu();
    await inventoryPage.verifyMenuIsOpen();
    
    // Navigate to cart page
    await inventoryPage.clickShoppingCart();
    
    // Verify menu is closed on new page
    await inventoryPage.verifyMenuIsClosed();
    
    // Open menu on cart page
    await inventoryPage.openMenu();
    await inventoryPage.verifyMenuIsOpen();
    
    // Navigate back to inventory
    await page.getByTestId('inventory-sidebar-link').click();
    
    // Verify menu is closed on inventory page
    await inventoryPage.verifyMenuIsClosed();
    
    await ScreenshotUtil.takeScreenshotOnSuccess(page, 'menu-state-persistence');
  });

  test('@regression should verify menu close on outside click', async ({ page }) => {
    // Open menu
    await inventoryPage.openMenu();
    await inventoryPage.verifyMenuIsOpen();
    
    // Click outside menu (on main content area)
    await page.locator('.inventory_container').click();
    
    // Verify menu is closed
    await inventoryPage.verifyMenuIsClosed();
    
    await ScreenshotUtil.takeScreenshotOnSuccess(page, 'menu-close-outside-click');
  });

  test('@regression should verify menu items are properly styled and accessible', async ({ page }) => {
    // Open menu
    await inventoryPage.openMenu();
    
    // Verify menu items have proper styling and are clickable
    const menuItems = [
      'inventory-sidebar-link',
      'about-sidebar-link', 
      'logout-sidebar-link',
      'reset-sidebar-link'
    ];
    
    for (const itemId of menuItems) {
      const menuItem = page.getByTestId(itemId);
      await expect(menuItem).toBeVisible();
      await expect(menuItem).toBeEnabled();
    }
    
    await ScreenshotUtil.takeScreenshotOnSuccess(page, 'menu-items-styling');
  });
}); 