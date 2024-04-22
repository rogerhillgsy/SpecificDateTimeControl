import { isNullOrUndefined } from "util";
import { test, expect } from "./interaction-fixture";

/**
 * List of locales we will test with.
 */
const locales = [
    { locale: "en-US", timezoneId: "America/New_York" },
    { locale: "en-GB", timezoneId: "Europe/London" },
    { locale: "de-DE", timezoneId: "Europe/Berlin" },
    { locale: "en-SG", timezoneId: "Asia/Singapore" },
    { locale: "en-NZ", timezoneId: "Pacific/Auckland" },
];

for (const locale of locales) {
    // Run our tests with the each locale.
    test.describe(`${locale.timezoneId} timezone - Test data transfer between OOB date control and specific control and vice versa.`, () => {
        test.use(locale);

        /**
         * Both dates will initially be not set.
         */
        test(`Basic Test`, async ({ interactionPage, page }) => {
            await interactionPage.assertOOBDate(undefined, undefined);
        });

        /**
         * Setting the OOB date control updates the specific date control correctly.
         */
        test(`OOB to specific date control`, async ({ interactionPage, page }) => {
            // Set OOB date and expect specific date to have same value
            await interactionPage.setOOBDate("17/02/2024", "12:30");
            await interactionPage.assertSpecificDate("2024-02-17", "12:30");
            // Clear OOB date and check that specific date field is cleared.
            await interactionPage.setOOBDate("", "");
            await interactionPage.assertSpecificDate("", "");
        });

        /**
         * Setting the specific date control will update the OOB control correctly.
         */
        test(`Specific date control to OOB`, async ({ interactionPage, page }) => {
            await interactionPage.setSpecificDate("12042024", "00:30");
            await interactionPage.assertOOBDate("12/04/2024", "00:30");
            // Clear specific date and check that OOB date field is cleared.
            await interactionPage.setSpecificDate("", "");
            await interactionPage.assertOOBDate("", "");
        });

        /**
         * Partly setting the specific date does not set the OOB date.
         */
        test("Partial specific date not valid", async ({ interactionPage, page }) => {
            await interactionPage.setSpecificDate("12042024", undefined);
            await interactionPage.assertOOBDate(undefined, undefined);
        });

        /**
         * Partly setting the OOB date causews both dates to be set with a time of 08:00
         */
        test("Partial OOB date is valid", async ({ interactionPage, page }) => {
            await interactionPage.setOOBDate("17/02/2024", undefined);
            await interactionPage.assertSpecificDate("2024-02-17", "08:00");
        });
    });
}
