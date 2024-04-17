import { test, expect } from "./interaction-fixture";

const locales = [
    { locale: "en-US", timezoneId: "America/New_York" },
    { locale: "en-GB", timezoneId: "Europe/London" },
    { locale: "de-DE", timezoneId: "Europe/Berlin" },
    { locale: "en-SG", timezoneId: "Asia/Singapore" },
    { locale: "en-NZ", timezoneId: "Pacific/Auckland" },
];

for (const locale of locales) {
    {
        test.describe(
            locale.timezoneId +
                `${locale.timezoneId} timezone - Test data transfer between OOB date control and specific control and vice versa.`,
            () => {
                test.use(locale);

                test(`Basic Test`, async ({ interactionPage, page }) => {
                    await interactionPage.assertOOBDate(undefined, undefined);
                });

                test(`OOB to specific date control`, async ({ interactionPage, page }) => {
                    // Set OOB date and expect specific date to have same value
                    await interactionPage.setOOBDate("17/02/2024", "12:30");
                    await interactionPage.assertSpecificDate("2024-02-17", "12:30");
                });

                test(`Specific date control to OOB`, async ({ interactionPage, page }) => {
                    await interactionPage.setSpecificDate("12042024", "00:30");
                    await interactionPage.assertOOBDate("12/04/2024", "00:30");
                });
            }
        );
    }
}
