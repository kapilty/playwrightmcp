# Sauce Demo Playwright Tests

This repository contains comprehensive automated tests for the [Sauce Demo](https://www.saucedemo.com) e-commerce website using Playwright, following industry best practices and the Page Object Model pattern. The purpose of this repository is to demonstrate how to generate Playwright test cases for a website using Playwright's Modern Component Pattern (MCP). The provided prompt can be adapted to generate test cases for any website.

## Test Case Generation Prompt for Playwright MCP

You can generate test cases for the Sauce Demo website using the following prompt:

```
I would like you to write me some tests for https://www.saucedemo.com. Please open up and login with user 'standard_user' and password 'secret'. Explore it briefly and then outline five functional aspects that should be tested. Please follow the guidelines as mentioned in @playwright-rules.md
```

This prompt will generate test cases that align with the testing structure and guidelines used in this repository.

## Overview

The tests cover five main functional aspects of the Sauce Demo website:

1. **User Authentication & Login System** (`tests/auth/authentication.spec.ts`)
   - Valid and invalid login scenarios
   - Different user types (standard, locked out, problem, performance glitch)
   - Form validation
   - Logout functionality

2. **Product Inventory & Shopping Cart Management** (`tests/cart/shopping-cart.spec.ts`)
   - Adding/removing items from cart
   - Cart badge updates
   - Cart page navigation
   - Empty cart handling

3. **Product Sorting & Filtering** (`tests/sorting/product-sorting.spec.ts`)
   - Name sorting (A-Z, Z-A)
   - Price sorting (low-high, high-low)
   - Sort order persistence
   - Product count verification

4. **Checkout Process & Form Validation** (`tests/checkout/checkout.spec.ts`)
   - Complete checkout flow
   - Form validation (first name, last name, postal code)
   - Multiple item checkout
   - Payment and shipping information display

5. **Navigation & Menu Functionality** (`tests/navigation/navigation.spec.ts`)
   - Menu opening/closing
   - Navigation links
   - App state reset
   - Footer links
   - Logo navigation

## Prerequisites

- Node.js (version 16 or higher)
- npm or yarn package manager

## Installation

1. Clone or download this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Install Playwright browsers:
   ```bash
   npm run install-browsers
   ```
4. Build TypeScript:
   ```bash
   npm run build
   ```

## Running Tests

### Run All Tests
```bash
npm test
```

### Run Specific Test Categories
```bash
# Authentication tests only
npm run test:auth

# Shopping cart tests only
npm run test:cart

# Product sorting tests only
npm run test:sorting

# Checkout tests only
npm run test:checkout

# Navigation tests only
npm run test:navigation
```

### Run Tests by Tags
```bash
# Run only smoke tests
npm run test:smoke

# Run only regression tests
npm run test:regression

# Run tests with specific tags
npx playwright test --grep @auth
npx playwright test --grep @cart
npx playwright test --grep @checkout
```

### Run Tests with Browser UI
```bash
# Run tests with headed browsers (visible)
npm run test:headed

# Run tests in debug mode
npm run test:debug
```

### View Test Reports
```bash
npm run report
```

## Test Credentials

The tests use the following Sauce Demo credentials:

- **Username**: `standard_user`
- **Password**: `secret_sauce`

Other available test users:
- `locked_out_user` - Account locked out
- `problem_user` - Account with UI issues
- `performance_glitch_user` - Account with performance issues
- `error_user` - Account with error states
- `visual_user` - Account for visual testing

## Screenshots

All tests automatically capture screenshots on completion and save them to the `screenshots/` directory with timestamped filenames. This helps with debugging and provides visual evidence of test execution.

## Project Structure

```
tests/
├── auth/                    # Authentication tests
│   └── authentication.spec.ts
├── cart/                    # Shopping cart tests
│   └── shopping-cart.spec.ts
├── checkout/                # Checkout process tests
│   └── checkout.spec.ts
├── sorting/                 # Product sorting tests
│   └── product-sorting.spec.ts
├── navigation/              # Navigation tests
│   └── navigation.spec.ts
├── pages/                   # Page Object Model classes
│   ├── login.page.ts
│   ├── inventory.page.ts
│   ├── cart.page.ts
│   └── checkout.page.ts
├── testdata/                # Test data factories
│   └── factory.ts
└── utils/                   # Utility functions
    └── screenshot.ts
```

## Test Structure

Each test file follows a consistent structure using the Page Object Model:

```typescript
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { createStandardUser } from '../testdata/factory';

test.describe('Authentication @auth', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.navigate();
  });

  test('@smoke should login successfully', async ({ page }) => {
    const user = createStandardUser();
    await loginPage.login(user.username, user.password);
    await loginPage.verifySuccessfulLogin();
  });
});
```

## Architecture

### Page Object Model
The tests follow the Page Object Model pattern for better maintainability:
- **Page Objects**: Encapsulate page-specific logic and selectors
- **Test Data Factories**: Generate realistic test data using Faker.js
- **Utility Classes**: Provide reusable functionality like screenshot capture

### Test Tagging
Tests are tagged for better organization and execution control:
- `@smoke`: Critical path tests that verify core functionality
- `@regression`: Comprehensive test coverage for existing features
- `@auth`: Authentication and authorization tests
- `@cart`: Shopping cart functionality tests
- `@checkout`: Checkout process tests
- `@slow`: Tests that take longer than average to execute

## Configuration

The tests are configured via `playwright.config.ts` with the following features:

- **TypeScript support**: Full type safety and IntelliSense
- **Multi-browser support**: Chrome, Firefox, Safari, and mobile browsers
- **Parallel execution**: Tests run in parallel for faster execution
- **Retry logic**: Failed tests are retried on CI
- **Screenshots**: Captured on test completion
- **Videos**: Recorded for failed tests
- **Traces**: Collected for debugging

## Available Browsers

The tests run against multiple browsers and devices:

- **Desktop**: Chrome, Firefox, Safari
- **Mobile**: Chrome (Pixel 5), Safari (iPhone 12)

## CI/CD Integration

The tests are configured for CI/CD environments with:

- Retry logic for flaky tests
- Parallel execution optimization
- Multiple output formats (HTML, JSON, JUnit XML)

## Troubleshooting

### Common Issues

1. **Browser not found**: Run `npm run install-browsers`
2. **Tests failing**: Check if the Sauce Demo website is accessible
3. **Screenshot errors**: Ensure the `screenshots/` directory is writable

### Debug Mode

Run tests in debug mode to step through execution:
```bash
npm run test:debug
```

### View Traces

If tests fail, traces are automatically generated and can be viewed with:
```bash
npx playwright show-trace trace.zip
```

## IDE Integration with Playwright MCP

### Installation

1. **Install Playwright MCP**
   ```bash
   npm install -D @playwright/test @playwright/mcp
   ```

2. **Install Playwright Browsers**
   ```bash
   npx playwright install
   ```

### IDE Setup

#### Windsurf
1. Open the command palette (`Cmd+Shift+P` on Mac, `Ctrl+Shift+P` on Windows/Linux)
2. Search for and select "Install Extension"
3. Search for "Playwright MCP" and install it
4. Restart Windsurf when prompted
5. Open any test file and use the built-in test runner UI

#### Cursor
1. Install the official Playwright extension from the Cursor extensions marketplace
2. Reload Cursor after installation
3. The extension will automatically detect Playwright tests in your workspace
4. Use the test explorer in the sidebar to run and debug tests

#### GitHub Copilot
1. Install the GitHub Copilot extension
2. Open a test file (`.spec.ts` or `.test.ts`)
3. Use Copilot's inline suggestions to write and improve your tests
4. For test generation, type a comment describing the test and let Copilot suggest the implementation

### Running Tests

Run all tests:
```bash
npx playwright test
```

Run tests in UI mode:
```bash
npx playwright test --ui
```

Run a specific test file:
```bash
npx playwright test tests/example.spec.ts
```

### Debugging
- Use the built-in debugger in your IDE
- Add `test.setTimeout(0)` to pause test execution
- Use `page.pause()` to enter debug mode during test execution
- Check the test traces in the `test-results` directory for failed tests

## Contributing

When adding new tests:

1. Follow the existing naming conventions
2. Include appropriate assertions
3. Add screenshots for visual verification
4. Update this README if adding new test categories

## License

MIT License - feel free to use these tests for your own projects.
