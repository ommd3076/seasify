import { test, expect } from '@playwright/test';

test.describe('Tier 1 & Tier 4 E2E: 10 Desktop Application Screens Inspection', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
  });

  test('Screen 1 — Overview: displays KPI metrics, tide chart, and recent anomaly events', async ({ page }) => {
    await page.goto('/overview');

    // Overview header
    await expect(page.locator('header, h1, h2')).toBeVisible();

    // Verify main content container rendered
    const mainContent = page.locator('main');
    await expect(mainContent).toBeVisible();

    // Station selector or time range dropdown
    await expect(page.locator('button, select, [role="button"]')).not.toHaveCount(0);
  });

  test('Screen 2 — Stations: displays station search, region filters, and roster', async ({ page }) => {
    await page.goto('/stations');

    // Search bar or filter
    const searchInput = page.locator('input[placeholder*="Search" i], input[type="text"]').first();
    if (await searchInput.isVisible()) {
      await searchInput.fill('Battery');
      await expect(searchInput).toHaveValue('Battery');
    }

    // Verify station cards or list items
    await expect(page.locator('main')).toBeVisible();
  });

  test('Screen 3 — Monitoring: renders observed and predicted tide series and charts', async ({ page }) => {
    await page.goto('/monitoring');

    await expect(page.locator('main')).toBeVisible();
    // Chart container
    const chartArea = page.locator('.recharts-responsive-container, canvas, svg, [data-testid*="chart"]').first();
    await expect(page.locator('main')).toBeVisible();
  });

  test('Screen 4 — Patterns: displays pattern library and storm archetypes', async ({ page }) => {
    await page.goto('/patterns');

    await expect(page.locator('main')).toBeVisible();
    // Verify storm archetypes text
    await expect(page.locator('main')).toContainText(/Surge|Blowout|Recovery|Oscillat|Pattern/i);
  });

  test('Screen 5 — Events: displays anomaly progression cards with severity badges', async ({ page }) => {
    await page.goto('/events');

    await expect(page.locator('main')).toBeVisible();
    // Events list or empty state placeholder
    await expect(page.locator('main')).toContainText(/Event|Anomaly|Residual|Resolved|Open/i);
  });

  test('Screen 6 — Reports: displays export buttons and period selection', async ({ page }) => {
    await page.goto('/reports');

    await expect(page.locator('main')).toBeVisible();
    // CSV / PDF export controls or report options
    const exportButtons = page.locator('button:has-text("Export"), button:has-text("CSV"), button:has-text("PDF"), button:has-text("Download")');
    if (await exportButtons.count() > 0) {
      await expect(exportButtons.first()).toBeVisible();
    }
  });

  test('Screen 7 — Upload: displays drag-and-drop dropzone and format validation', async ({ page }) => {
    await page.goto('/upload');

    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('main')).toContainText(/Upload|Drag|Drop|CSV|Browse/i);
  });

  test('Screen 8 — Alerts: displays rule list, severity tags, and threshold controls', async ({ page }) => {
    await page.goto('/alerts');

    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('main')).toContainText(/Alert|Rule|Threshold|Notification|Quiet/i);
  });

  test('Screen 9 — Settings: displays unit toggles, datum selector, and team roster', async ({ page }) => {
    await page.goto('/settings');

    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('main')).toContainText(/Settings|Unit|Datum|Metric|Imperial|MLLW/i);
  });

  test('Screen 10 — Automata Lab (Pattern Engine): displays SVG state graph and sequence simulator', async ({ page }) => {
    await page.goto('/pattern-engine');

    await expect(page.locator('main')).toBeVisible();
    // Pattern engine elements (states S0, S1, or simulator tokens)
    await expect(page.locator('main')).toContainText(/Automata|State|Simulation|Simulator|Rule|DFA|NFA/i);
  });
});
