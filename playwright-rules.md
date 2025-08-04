# Windsurf Rules & Best Practices

This document outlines the coding standards, best practices, and conventions for our Playwright test automation project, following official Playwright guidelines and industry best practices.

## Table of Contents
- [Test Structure](#test-structure)
- [Locator Strategy](#locator-strategy)
- [Test Organization](#test-organization)
- [Page Object Model](#page-object-model)
- [Test Data Management](#test-data-management)
- [Assertions & Matchers](#assertions--matchers)
- [Configuration](#configuration)
- [Best Practices](#best-practices)
- [CI/CD Integration](#cicd-integration)

## Test Structure

### File Organization
- Keep test files in the `tests/` directory
- Group related test files in feature-based subdirectories (e.g., `tests/auth/`, `tests/checkout/`)
- Use `.spec.ts` extension for test files (TypeScript recommended)
- Keep test utilities in `tests/utils/`
- Store test data in `tests/testdata/`
- Keep page objects in `tests/pages/`

### Test File Structure
```typescript
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';

test.describe('Authentication', () => {
  let loginPage: LoginPage;
  
  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.navigate();
  });

  test('should login with valid credentials', async ({ page }) => {
    await loginPage.login('standard_user', 'secret_sauce');
    await expect(page).toHaveURL(/inventory/);
  });
});
```

## Locator Strategy

### Primary Locators (in order of preference)
1. `getByRole()` - Best for accessibility and maintainability
   ```typescript
   await page.getByRole('button', { name: 'Submit' }).click();
   ```

2. `getByLabel()` - For form fields with associated labels
   ```typescript
   await page.getByLabel('Username').fill('testuser');
   ```

3. `getByTestId()` - For elements with `data-testid` attributes
   ```typescript
   // In your HTML: <button data-testid="login-button">
   await page.getByTestId('login-button').click();
   ```

4. `getByText()` - When text content is stable and unique
   ```typescript
   await page.getByText('Welcome back').click();
   ```

5. `getByTitle()` - For elements with title attributes
   ```typescript
   await page.getByTitle('Close dialog').click();
   ```

### Best Practices
- **Never** use `page.locator()` directly in test files - wrap in page objects
- Avoid XPath selectors unless absolutely necessary
- Never use `page.$()` or `page.$$()` (legacy APIs)
- Prefer text-based selectors over complex CSS selectors
- Use `filter()` for non-unique elements:
  ```typescript
  await page.getByRole('listitem')
    .filter({ hasText: 'Item 1' })
    .getByRole('button', { name: 'Delete' })
    .click();
  ```

## Test Organization

### Test Hooks
- Use `test.beforeAll` for one-time setup
- Use `test.beforeEach` for common test setup
- Use `test.afterEach` for cleanup after each test
- Use `test.afterAll` for final cleanup

```typescript
test.describe('Shopping Cart', () => {
  let page: Page;
  let cartPage: CartPage;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    cartPage = new CartPage(page);
    await cartPage.navigate();
  });

  test.afterAll(async () => {
    await page.close();
  });
});
```

### Test Tagging Policy

#### Why Use Tags?
Tags help organize tests and control test execution. They allow you to:
- Run specific groups of tests (e.g., smoke, regression)
- Exclude certain tests (e.g., @flaky, @slow)
- Categorize tests by feature, priority, or other dimensions
- Integrate with CI/CD pipelines for different test stages

#### Standard Tags

1. **Test Type Tags**
   - `@smoke` - Critical path tests that verify core functionality
   - `@regression` - Comprehensive test coverage for existing features
   - `@e2e` - End-to-end tests that cover complete user flows
   - `@ui` - Tests that specifically verify UI components
   - `@api` - Tests that verify API endpoints
   - `@integration` - Tests that verify integration between components

2. **Test Characteristics**
   - `@slow` - Tests that take longer than average to execute
   - `@flaky` - Tests that are known to be occasionally unstable
   - `@wip` - Work in progress - tests that are not yet complete
   - `@manual` - Tests that require manual verification

3. **Feature/Area Tags**
   - `@auth` - Authentication and authorization tests
   - `@checkout` - Checkout process tests
   - `@search` - Search functionality tests
   - `@profile` - User profile management tests

#### Usage Examples

```typescript
// Tagging a single test
test('@smoke should allow user to login', async ({ page }) => {
  // Test implementation
});

// Tagging a test group
test.describe('Checkout Process @e2e', () => {
  // All tests in this group will inherit the @e2e tag
  test('should complete checkout as guest', async ({ page }) => {
    // Test implementation
  });

  test('should complete checkout as registered user', async ({ page }) => {
    // Test implementation
  });
});

// Multiple tags
test('@regression @slow should handle large file uploads', async ({ page }) => {
  // Test implementation
});
```

#### Running Tagged Tests

Run tests with specific tags:
```bash
# Run only smoke tests
npx playwright test --grep @smoke

# Run tests that have either @smoke or @regression tag
npx playwright test --grep "@smoke|@regression"

# Run tests that have both @e2e and @checkout tags
npx playwright test --grep "@e2e.*@checkout"

# Exclude flaky tests
npx playwright test --grep "@flaky" --grep-invert

# Run tests in parallel but limit workers for slow tests
npx playwright test --workers=4 &
npx playwright test --grep @slow --workers=1
```

#### Best Practices for Tagging

1. **Be Consistent**
   - Use consistent tag names across the codebase
   - Document all tags in this document
   - Follow the established naming convention (lowercase, kebab-case for multi-word tags)

2. **Tag Appropriately**
   - Don't over-tag tests (1-3 relevant tags per test is usually sufficient)
   - Use the most specific tag that applies
   - Update tags when test characteristics change

3. **CI/CD Integration**
   - Configure different test runs based on tags
   - Run critical tests (e.g., @smoke) on every commit
   - Schedule full regression runs (@regression) nightly
   - Isolate flaky tests in separate test runs

4. **Tag Maintenance**
   - Regularly review and update tags
   - Remove unnecessary tags
   - Document any new tags in this guide

5. **Avoid**
   - Using tags that are too broad (e.g., @test)
   - Creating too many similar tags (e.g., @slow, @veryslow)
   - Using tags for test organization (use `describe` blocks instead)

#### Example CI Configuration

```yaml
# .github/workflows/test.yml
jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        # Run smoke tests on every push
        include:
          - tag: '@smoke'
            job_name: 'Smoke Tests'
        # Run full regression on schedule
          - tag: '@regression'
            job_name: 'Regression Tests'
            schedule: '0 0 * * *'  # Daily at midnight
    
    steps:
      - name: Run tagged tests
        run: |
          if [ -n "${{ matrix.tag }}" ]; then
            npx playwright test --grep "${{ matrix.tag }}" --reporter=list,github
          fi
```

### Test Isolation
- Each test should be independent
- Reset application state between tests
- Use `test.describe.serial()` when tests must run in order
- Tag tests appropriately:
  ```typescript
  test('@smoke should load homepage', async ({ page }) => {
    // Test implementation
  });
  ```

## Page Object Model

### Guidelines
- One page object per page/component
- Use TypeScript for better type safety
- Keep selectors private
- Group related actions into methods
- Return `this` for method chaining when appropriate

### Example
```typescript
// login.page.ts
import { Page, expect } from '@playwright/test';

export class LoginPage {
  private readonly page: Page;
  
  // Locators
  private readonly usernameInput = this.page.getByLabel('Username');
  private readonly passwordInput = this.page.getByLabel('Password');
  private readonly loginButton = this.page.getByRole('button', { name: 'Login' });

  constructor(page: Page) {
    this.page = page;
  }

  async navigate(): Promise<void> {
    await this.page.goto('/login');
  }

  async login(username: string, password: string): Promise<void> {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }
}
```

## Test Data Management

### Test Data Factories
- Use factory pattern for test data
- Keep test data in separate files
- Use Faker.js for generating realistic test data
- Example:
  ```typescript
  // testdata/factory.ts
  import { faker } from '@faker-js/faker';
  
  export const createTestUser = (overrides = {}) => ({
    username: faker.internet.userName(),
    email: faker.internet.email(),
    password: faker.internet.password(),
    ...overrides
  });
  ```

### Environment Variables
- Use `.env` files for environment-specific configurations
- Never commit sensitive data
- Access variables via `process.env`
- Example `.env`:
  ```
  BASE_URL=http://localhost:3000
  TEST_USERNAME=testuser
  TEST_PASSWORD=testpass
  ```

## Assertions & Matchers

### Web-First Assertions
- Use Playwright's built-in assertions
- Chain assertions for better readability
- Example:
  ```typescript
  await expect(page.getByRole('heading', { name: 'Welcome' }))
    .toBeVisible()
    .toHaveText('Welcome back, User!');
  ```

### Common Matchers
- `toBeVisible()` - Element is visible
- `toHaveText()` - Element contains text
- `toHaveValue()` - Input has value
- `toHaveAttribute()` - Element has attribute
- `toHaveClass()` - Element has CSS class
- `toHaveCount()` - Number of elements
- `toBeFocused()` - Element has focus

## Configuration

### playwright.config.ts
- Configure browsers and devices
- Set up global timeouts
- Configure reporters
- Example:
  ```typescript
  import { defineConfig, devices } from '@playwright/test';
  
  export default defineConfig({
    testDir: './tests',
    timeout: 30 * 1000,
    expect: {
      timeout: 5000
    },
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: [
      ['html', { open: 'never' }],
      ['list']
    ],
    use: {
      baseURL: process.env.BASE_URL || 'http://localhost:3000',
      trace: 'on-first-retry',
      screenshot: 'only-on-failure',
    },
    projects: [
      {
        name: 'chromium',
        use: { ...devices['Desktop Chrome'] },
      },
      {
        name: 'firefox',
        use: { ...devices['Desktop Firefox'] },
      },
    ],
  });
  ```

## Best Practices

### Test Design
- Write small, focused tests
- Test one thing per test case
- Use descriptive test names
- Avoid test interdependencies
- Make tests deterministic

### Error Handling
- Use custom error messages
- Handle expected errors gracefully
- Take screenshots on failure
- Example:
  ```typescript
  test('should show error on invalid login', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.login('invalid', 'credentials');
    
    await expect(
      page.getByText('Invalid credentials'),
      'Error message should be visible for invalid login'
    ).toBeVisible();
  });
  ```

### Performance
- Run tests in parallel when possible
- Use `test.slow()` for slow tests
- Avoid unnecessary waits
- Use `waitFor` with specific conditions:
  ```typescript
  // Instead of:
  await page.waitForTimeout(5000);
  
  // Use:
  await page.waitForLoadState('networkidle');
  // or
  await expect(element).toBeVisible();
  ```

## CI/CD Integration

### GitHub Actions Example
```yaml
name: Playwright Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    timeout-minutes: 60
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
      matrix:
        node-version: [18.x]
    
    steps:
    - uses: actions/checkout@v3
    - name: Use Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v3
      with:
        node-version: ${{ matrix.node-version }}
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Install Playwright browsers
      run: npx playwright install --with-deps
    
    - name: Run Playwright tests
      run: npx playwright test --project=chromium --reporter=list,github
      env:
        BASE_URL: ${{ secrets.BASE_URL }}
    
    - name: Upload test results
      if: always()
      uses: actions/upload-artifact@v3
      with:
        name: playwright-report
        path: playwright-report/
        retention-days: 30
```

## Code Style

### TypeScript
- Enable strict mode
- Use interfaces for complex types
- Add return types to functions
- Use `readonly` for immutable properties

### Comments
- Use JSDoc for public methods
- Explain "why" not "what"
- Keep comments up-to-date
- Avoid redundant comments

## Version Control

### Branching
- Use feature branches
- Follow Git Flow or GitHub Flow
- Keep PRs small and focused

### Commit Messages
- Use conventional commits
- Be descriptive but concise
- Reference issue numbers
- Example:
  ```
  test: add login page tests
  
  Add comprehensive test coverage for the login page including:
  - Successful login
  - Error handling
  - Form validation
  
  Closes #123
  ```

## Continuous Improvement

### Test Maintenance
- Regularly review and update tests
- Remove or update flaky tests
- Refactor when application changes
- Monitor test execution time

### Learning
- Stay updated with Playwright releases
- Share knowledge with the team
- Contribute to the testing framework
- Attend testing conferences/meetups

## License

This document is part of the project's internal documentation and is subject to the project's license terms.
