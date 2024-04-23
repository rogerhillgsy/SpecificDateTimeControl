/* eslint-disable no-debugger */
// @ts-check
import { test, expect } from "@playwright/test";

/**
 * Not using a fixture.
 * Test of the CRM UI Interactions page and specific/OOB dates.
 */

test.use({
    locale: "en-US",
    timezoneId: "US/Eastern",
});

test("Open Interaction App", async ({ page }) => {
    await page.goto(process.env.environmentUrl!!);

    await expect(page).toHaveTitle(/Accounts My Active Accounts -( Power Apps)?/, { timeout: 30000 });
});

test( "Create new Interaction with GMT date", async({page}) => {
    await createInteractionWithDate(page, new Date("2024-03-02T12:34"));
});
test( "Create new Interaction with summer datetime", async({page}) => {
    await createInteractionWithDate(page, new Date("2024-04-05T23:56"));
});

test( "Create new Interaction with day > 12", async( {page}) => {
    await createInteractionWithDate(page, new Date("2024-02-28T00:08"));
});

 async function createInteractionWithDate(page: any, testdate: Date): Promise<void> {
    const dateText = `${testdate.getDate().toString().padStart(2,"0")}/${(testdate.getMonth()+1).toString().padStart(2,"0")}/${testdate.getFullYear()}`;
    const dateSequence = testdate.toLocaleDateString( undefined, { "month" : "2-digit", "day" : "2-digit", "year" : "numeric"} ).replace(/\//g,"").padStart(8,"0");
    const [isoDate, isoTime] = testdate.toISOString().split("T");
    const timeText = testdate.toLocaleTimeString().replace(/:00( |$)/ ,"");
    const expectedOOBTimeText = `${testdate.getHours().toString().padStart(2,"0")}:${testdate.getMinutes().toString().padStart(2,"0")}`;
    
    await page.goto(`${process.env.environmentUrl}/${process.env.testApp}`);
    await expect(page).toHaveTitle(/Accounts My Active Accounts -( Power Apps)?/, { timeout: 30000 });

    await page.getByText("Interactions", { exact: true }).click();
    await page.getByLabel("New", { exact: true }).click();
    await expect(page).toHaveTitle(/Interaction: Form 2: New Interaction -( Power Apps)?/,{ timeout: 30000 });
    await page.getByRole('tab', { name: 'Copilot' }).click(); // Get rid of copilot.

    await page.getByLabel("Account, Lookup", { exact: true }).fill("fullers");
    await page.getByLabel("Fullers").click();

    // Fill in OOB date
    await expect(page.getByLabel("Time of Interaction Date OOB", { exact: true })).not.toBeVisible();
    await page.getByLabel("Date of Interaction Date OOB", { exact: true }).fill(dateText); // '03/02/2024');
    await page.keyboard.press("Tab");
    await expect(page.getByLabel("Time of Interaction Date OOB", { exact: true })).toBeVisible();
    await expect(page.getByLabel("Time of Interaction Date OOB", { exact: true })).toHaveValue("08:00");
    await expect(page.getByTestId("date")).toHaveValue(isoDate);
    await expect(page.getByTestId("time")).toHaveValue("08:00");

    // Clear the specific date and check everything clears.
    await page.getByTestId("date").clear();
    await   expect(page.getByLabel("Date of Interaction Date OOB", { exact: true })).toBeEmpty();
    await expect(page.getByLabel("Time of Interaction Date OOB", { exact: true })).not.toBeVisible();
    await expect(page.getByTestId("date")).toBeEmpty();
    await expect(page.getByTestId("time")).toBeEmpty();

    // Simulate direct typing of date as unbroken string of numbers. 
    await page.getByTestId("date").focus();
    await page.getByTestId("date").pressSequentially(dateSequence, { delay: 200 });
    await expect(page.getByLabel("Date of Interaction Date OOB", { exact: true })).toBeEmpty();
    await expect(page.getByLabel("Time of Interaction Date OOB", { exact: true })).not.toBeVisible();
    await page.getByTestId("time").focus();
    await page.getByTestId("time").pressSequentially(timeText, { delay: 100 });
   // await page.keyboard.press("Tab");

    await expect(page.getByLabel("Date of Interaction Date OOB", { exact: true })).not.toBeEmpty();
    await expect(page.getByLabel("Time of Interaction Date OOB", { exact: true })).toBeVisible();
    await expect(page.getByLabel("Date of Interaction Date OOB", { exact: true })).toHaveValue(dateText);
    await expect(page.getByLabel("Time of Interaction Date OOB", { exact: true })).toHaveValue(expectedOOBTimeText);
}
