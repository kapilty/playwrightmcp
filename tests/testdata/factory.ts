import { faker } from '@faker-js/faker';

export interface TestUser {
  username: string;
  password: string;
}

export interface CheckoutInfo {
  firstName: string;
  lastName: string;
  postalCode: string;
}

export interface Product {
  name: string;
  price: string;
  description: string;
}

/**
 * Create a test user with default or overridden values
 */
export const createTestUser = (overrides: Partial<TestUser> = {}): TestUser => ({
  username: faker.internet.userName(),
  password: faker.internet.password(),
  ...overrides
});

/**
 * Create standard user credentials
 */
export const createStandardUser = (): TestUser => ({
  username: 'standard_user',
  password: 'secret_sauce'
});

/**
 * Create locked out user credentials
 */
export const createLockedOutUser = (): TestUser => ({
  username: 'locked_out_user',
  password: 'secret_sauce'
});

/**
 * Create problem user credentials
 */
export const createProblemUser = (): TestUser => ({
  username: 'problem_user',
  password: 'secret_sauce'
});

/**
 * Create performance glitch user credentials
 */
export const createPerformanceGlitchUser = (): TestUser => ({
  username: 'performance_glitch_user',
  password: 'secret_sauce'
});

/**
 * Create checkout information with default or overridden values
 */
export const createCheckoutInfo = (overrides: Partial<CheckoutInfo> = {}): CheckoutInfo => ({
  firstName: faker.person.firstName(),
  lastName: faker.person.lastName(),
  postalCode: faker.location.zipCode(),
  ...overrides
});

/**
 * Create valid checkout information
 */
export const createValidCheckoutInfo = (): CheckoutInfo => ({
  firstName: 'John',
  lastName: 'Doe',
  postalCode: '12345'
});

/**
 * Create checkout info with special characters
 */
export const createSpecialCharCheckoutInfo = (): CheckoutInfo => ({
  firstName: 'José',
  lastName: "O'Connor",
  postalCode: 'A1B-2C3'
});

/**
 * Create empty checkout info
 */
export const createEmptyCheckoutInfo = (): CheckoutInfo => ({
  firstName: '',
  lastName: '',
  postalCode: ''
});

/**
 * Create product data
 */
export const createProduct = (overrides: Partial<Product> = {}): Product => ({
  name: faker.commerce.productName(),
  price: faker.commerce.price({ min: 1, max: 100 }),
  description: faker.commerce.productDescription(),
  ...overrides
});

/**
 * Get all available products in the store
 */
export const getAvailableProducts = (): Product[] => [
  {
    name: 'Sauce Labs Backpack',
    price: '$29.99',
    description: 'carry.allTheThings() with the sleek, streamlined Sly Pack that melds uncompromising style with unequaled laptop and tablet protection.'
  },
  {
    name: 'Sauce Labs Bike Light',
    price: '$9.99',
    description: 'A red light isn\'t the desired state in testing but it sure helps when riding your bike at night. Water-resistant with 3 lighting modes, 1 AAA battery included.'
  },
  {
    name: 'Sauce Labs Bolt T-Shirt',
    price: '$15.99',
    description: 'Get your testing superhero on with the Sauce Labs bolt T-shirt. From American Apparel, 100% ringspun combed cotton, heather gray with red bolt.'
  },
  {
    name: 'Sauce Labs Fleece Jacket',
    price: '$49.99',
    description: 'It\'s not every day that you come across a midweight quarter-zip fleece jacket capable of handling everything from a relaxing day outdoors to a busy day at the office.'
  },
  {
    name: 'Sauce Labs Onesie',
    price: '$7.99',
    description: 'Rib snap infant onesie for the junior automation engineer in development. Reinforced 3-snap bottom closure, two-needle hemmed sleeved and bottom won\'t unravel.'
  },
  {
    name: 'Test.allTheThings() T-Shirt (Red)',
    price: '$15.99',
    description: 'This classic Sauce Labs t-shirt is perfect to wear when cozying up to your keyboard to automate a few tests. Super-soft and comfy ringspun combed cotton.'
  }
];

/**
 * Get product by name
 */
export const getProductByName = (name: string): Product | undefined => {
  return getAvailableProducts().find(product => product.name === name);
};

/**
 * Get product names for easier test data access
 */
export const PRODUCT_NAMES = {
  BACKPACK: 'Sauce Labs Backpack',
  BIKE_LIGHT: 'Sauce Labs Bike Light',
  BOLT_TSHIRT: 'Sauce Labs Bolt T-Shirt',
  FLEECE_JACKET: 'Sauce Labs Fleece Jacket',
  ONESIE: 'Sauce Labs Onesie',
  TEST_TSHIRT: 'Test.allTheThings() T-Shirt (Red)'
} as const;

/**
 * Get sort options for easier test data access
 */
export const SORT_OPTIONS = {
  NAME_AZ: 'az',
  NAME_ZA: 'za',
  PRICE_LOW_HIGH: 'lohi',
  PRICE_HIGH_LOW: 'hilo'
} as const; 