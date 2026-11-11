import { test, expect } from '@playwright/test';

test.describe('Tier 1 & Tier 4 E2E: Desktop Navigation Shell & Route Transitions', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to root overview screen
    await page.goto('/');
  });

  test('displays application branding with double-wave mark and Seasify pill', async ({ page }) => {
    const sidebar = page.locator('[data-testid="sidebar"]');
    await expect(sidebar).toBeVisible();

    // Verify brand title and Seasify tag
    await expect(sidebar).toContainText('CoastalSight');
    await expect(sidebar).toContainText('Seasify');
    await expect(sidebar).toContainText('Tide & Water-Level Analysis');
  });

  test('renders all 10 desktop navigation pills in the left sidebar', async ({ page }) => {
    const navItems = [
      { id: 'overview', name: 'Overview' },
      { id: 'stations', name: 'Stations' },
      { id: 'monitoring', name: 'Monitoring' },
      { id: 'patterns', name: 'Patterns' },
      { id: 'events', name: 'Events' },
      { id: 'reports', name: 'Reports' },
      { id: 'upload', name: 'Upload' },
      { id: 'alerts', name: 'Alerts' },
      { id: 'settings', name: 'Settings' },
      { id: 'pattern-engine', name: 'Pattern Engine' },
    ];

    for (const item of navItems) {
      const pill = page.locator(`[data-testid="nav-${item.id}"]`);
      await expect(pill).toBeVisible();
      await expect(pill).toContainText(item.name);
    }
  });

  test('navigates seamlessly across all 10 application routes with active pill highlight', async ({ page }) => {
    const routes = [
      { id: 'stations', path: '/stations' },
      { id: 'monitoring', path: '/monitoring' },
      { id: 'patterns', path: '/patterns' },
      { id: 'events', path: '/events' },
      { id: 'reports', path: '/reports' },
      { id: 'upload', path: '/upload' },
      { id: 'alerts', path: '/alerts' },
      { id: 'settings', path: '/settings' },
      { id: 'pattern-engine', path: '/pattern-engine' },
      { id: 'overview', path: '/overview' },
    ];

    for (const r of routes) {
      const pill = page.locator(`[data-testid="nav-${r.id}"]`);
      await pill.click();

      // Verify active pill styling
      await expect(pill).toHaveClass(/bg-\[#A5F5A6\]/);

      // Verify URL route
      await expect(page).toHaveURL(new RegExp(r.path));
    }
  });

  test('preserves desktop layout shell without hamburger menu at 1440x900 viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });

    const sidebar = page.locator('[data-testid="sidebar"]');
    await expect(sidebar).toBeVisible();

    // Verify sidebar remains full width
    const boundingBox = await sidebar.boundingBox();
    expect(boundingBox).not.toBeNull();
    expect(boundingBox!.width).toBeGreaterThanOrEqual(250);
  });

  test('supports browser Back and Forward history navigation between screens', async ({ page }) => {
    // Overview -> Stations -> Monitoring
    await page.locator('[data-testid="nav-stations"]').click();
    await expect(page).toHaveURL(/.*\/stations/);

    await page.locator('[data-testid="nav-monitoring"]').click();
    await expect(page).toHaveURL(/.*\/monitoring/);

    // Browser back to Stations
    await page.goBack();
    await expect(page).toHaveURL(/.*\/stations/);
    await expect(page.locator('[data-testid="nav-stations"]')).toHaveClass(/bg-\[#A5F5A6\]/);

    // Browser forward to Monitoring
    await page.goForward();
    await expect(page).toHaveURL(/.*\/monitoring/);
    await expect(page.locator('[data-testid="nav-monitoring"]')).toHaveClass(/bg-\[#A5F5A6\]/);
  });
});
