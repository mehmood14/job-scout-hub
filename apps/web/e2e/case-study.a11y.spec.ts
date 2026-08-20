import { AxeBuilder } from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("the public case study has no serious or critical accessibility violations", async ({ page }) => {
  await page.goto("/case-study");
  await expect(page.getByRole("heading", { name: "A job search should help you choose a better next chapter." })).toBeVisible();

  const results = await new AxeBuilder({ page }).analyze();
  const blockingViolations = results.violations.filter((violation) =>
    violation.impact === "serious" || violation.impact === "critical",
  );

  expect(blockingViolations).toEqual([]);
});
