import { Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Utility class for taking screenshots with proper error handling
 */
export class ScreenshotUtil {
  private static readonly screenshotsDir = path.join(process.cwd(), 'screenshots');

  /**
   * Ensure screenshots directory exists
   */
  static ensureScreenshotsDir(): void {
    if (!fs.existsSync(this.screenshotsDir)) {
      fs.mkdirSync(this.screenshotsDir, { recursive: true });
    }
  }

  /**
   * Generate timestamp for filename
   */
  static generateTimestamp(): string {
    return new Date().toISOString().replace(/[:.]/g, '-');
  }

  /**
   * Take a screenshot with proper error handling
   */
  static async takeScreenshot(
    page: Page,
    testName: string,
    options: {
      fullPage?: boolean;
      path?: string;
    } = {}
  ): Promise<string> {
    try {
      this.ensureScreenshotsDir();
      
      const timestamp = this.generateTimestamp();
      const filename = `${testName}-${timestamp}.png`;
      const filepath = options.path || path.join(this.screenshotsDir, filename);
      
      await page.screenshot({
        path: filepath,
        fullPage: options.fullPage ?? true
      });
      
      return filepath;
    } catch (error) {
      console.error('Failed to take screenshot:', error);
      return '';
    }
  }

  /**
   * Take screenshot on test failure
   */
  static async takeScreenshotOnFailure(
    page: Page,
    testName: string
  ): Promise<void> {
    try {
      await this.takeScreenshot(page, `${testName}-failure`);
    } catch (error) {
      console.error('Failed to take failure screenshot:', error);
    }
  }

  /**
   * Take screenshot on test success
   */
  static async takeScreenshotOnSuccess(
    page: Page,
    testName: string
  ): Promise<void> {
    try {
      await this.takeScreenshot(page, `${testName}-success`);
    } catch (error) {
      console.error('Failed to take success screenshot:', error);
    }
  }
} 