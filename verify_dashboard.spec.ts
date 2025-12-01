
import { test, expect } from '@playwright/test';

test('Coach Dashboard renders Home view with widgets', async ({ page }) => {
  // Go to localhost
  await page.goto('http://localhost:5173/');

  // Wait for the Dashboard to load (checking for a unique element on the Home view)
  // We check for "Actions Prioritaires" which is the title of the first widget
  const actionsTitle = page.getByText('Actions Prioritaires');
  await expect(actionsTitle).toBeVisible({ timeout: 15000 });

  // Check for Team Health Widget
  const teamHealthTitle = page.getByText('Santé de l\'équipe');
  await expect(teamHealthTitle).toBeVisible();

  // Check for Recent Records Widget
  const recordsTitle = page.getByText('Derniers Records');
  await expect(recordsTitle).toBeVisible();

  // Check for Mock Data content
  await expect(page.getByText('Alice Martin')).toBeVisible(); // Pending wellness & record
  await expect(page.getByText('Sprints 30m')).toBeVisible(); // Pending validation
  await expect(page.getByText('Squat')).toBeVisible(); // Record exercise

  // Verify Navigation to Hub
  const hubButton = page.getByText('Hub'); // Button in the bottom tab bar
  await hubButton.click();

  // Verify Hub View is visible (e.g., "Hub Coach" title)
  const hubTitle = page.getByText('Hub Coach');
  await expect(hubTitle).toBeVisible();

  // Take a screenshot for visual confirmation
  await page.screenshot({ path: 'coach_dashboard_verified.png' });
});
