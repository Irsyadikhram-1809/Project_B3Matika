import { test, expect } from '@playwright/test';

test.describe('B3Matika UI Invariants', () => {
  test('Auth pages should render with correct visual styling (radius, positions)', async ({ page }) => {
    await page.goto('/masuk');

    // 1. Verify Card exists and has border radius
    const authCard = page.locator('.auth-card');
    await expect(authCard).toBeVisible();
    
    // Evaluate computed styles for the card
    const cardBorderRadius = await authCard.evaluate((el) => window.getComputedStyle(el).borderRadius);
    // Based on app.css var(--radius) which is typically 12px or similar, just ensure it's not '0px'
    expect(cardBorderRadius).not.toBe('0px');

    // 2. Verify Primary Button
    const loginBtn = page.locator('button.btn.btn-block');
    await expect(loginBtn).toBeVisible();

    const btnStyles = await loginBtn.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return {
        borderRadius: style.borderRadius,
        display: style.display,
        width: style.width
      };
    });

    // It should have border-radius and typically be full width in auth forms
    expect(btnStyles.borderRadius).not.toBe('0px');
    expect(['inline-flex', 'flex']).toContain(btnStyles.display);

    // 3. Verify Navbar exists and looks ok
    const navbar = page.locator('header.navbar');
    await expect(navbar).toBeVisible();
    const navDisplay = await navbar.evaluate((el) => window.getComputedStyle(el).display);
    expect(navDisplay).not.toBe('none');
  });

  test('Admin Login page should render with visual styling', async ({ page }) => {
    await page.goto('/panel-rahasia/login');

    const authCard = page.locator('.auth-card');
    await expect(authCard).toBeVisible();
    const cardBorderRadius = await authCard.evaluate((el) => window.getComputedStyle(el).borderRadius);
    expect(cardBorderRadius).not.toBe('0px');

    const loginBtn = page.locator('button.btn.btn-block');
    await expect(loginBtn).toBeVisible();
  });
});
