import { isNullOrUndefined } from "util";
import { test, expect } from "./interaction-fixture";

/**
 * List of locales we will test with.
 */
const locales = [{ locale: "en-GB", timezoneId: "Europe/London" }];
const locale = locales[0];

// Run our tests with the each locale.
test.describe(`${locale.timezoneId} timezone - Test data transfer between OOB date control and specific control and vice versa.`, () => {
    test.use(locale);
    /**
     * Setting the OOB date control updates the specific date control correctly.
     */
    test(`Specific OOB to specific date control`, async ({ interactionPage, page }) => {
        // Set OOB date and expect specific date to have same value
        await interactionPage.setOOBDate("17/02/2024", "12:30");
        await interactionPage.assertSpecificDate("2024-02-17", "12:30");
        // Clear OOB date and check that specific date field is cleared.
        await interactionPage.setOOBDate("", "");
        await interactionPage.assertSpecificDate("", "");
    });
});
