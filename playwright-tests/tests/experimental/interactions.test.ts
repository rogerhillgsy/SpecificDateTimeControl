/* eslint-disable no-debugger */
// @ts-check
import { test, expect } from "@playwright/test";

test.use({
    locale: "en-GB",
    timezoneId: "Europe/London",
});

test("Open Interaction App", async ({ page }) => {
    await page.goto(process.env.environmentUrl!!);

    await expect(page).toHaveTitle(/Accounts My Active Accounts -( Power Apps)?/);
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

//test. .each(["2024-03-02T12:34","2024-04-05T23:56","2024-02-28T00:08"])("%s Create new interaction", (interactionDate: string) => {
 async function createInteractionWithDate(page: any, testdate: Date): Promise<void> {
//    const testdate = new Date(interactionDate);
    const dateText = `${testdate.getDate()}/${testdate.getMonth()+1}/${testdate.getFullYear()}`;
    const localeDateText = dateText.replace("/", "-");
    const dateSequence = dateText.replace("/", "");
    const [isoDate, isoTime] = testdate.toISOString().split("T");
    const timeText = `${testdate.getHours().toString().padStart(2,"0")}:${testdate.getMinutes().toString().padStart(2,"0")}`;

    await page.goto(`${process.env.environmentUrl}/${process.env.testApp}`);
    await expect(page).toHaveTitle(/Accounts My Active Accounts -( Power Apps)?/);

    await page.getByText("Interactions", { exact: true }).click();
    await page.getByLabel("New", { exact: true }).click();
    await expect(page).toHaveTitle(/Interaction: Form 2: New Interaction -( Power Apps)?/);
    // await page.getByRole('tab', { name: 'Copilot' }).click(); // Get rid ofr copilot.
    await page.getByLabel("Account, Lookup", { exact: true }).fill("fullers");
    await page.getByLabel("Fullers").click();

    // Fill in OOB date
    await expect(page.getByLabel("Time of Interaction Date OOB", { exact: true })).not.toBeVisible();
    await page.getByLabel("Date of Interaction Date OOB", { exact: true }).fill(dateText); // '03/02/2024');
    await page.getByLabel("Date of Interaction Date OOB", { exact: true }).press("Tab");
    await expect(page.getByLabel("Time of Interaction Date OOB", { exact: true })).toBeVisible();
    await expect(page.getByLabel("Time of Interaction Date OOB", { exact: true })).toHaveValue("08:00");
    await expect(page.getByTestId("date")).toHaveValue(isoDate);
    await expect(page.getByTestId("time")).toHaveValue("08:00");

    // Get rid of copilot tab.
    await page.getByRole("tab", { name: "Copilot" }).click();

    // Clear the specific date and check everything clears.
    await page.getByTestId("date").clear();
    await   expect(page.getByLabel("Date of Interaction Date OOB", { exact: true })).toBeEmpty();
    await expect(page.getByLabel("Time of Interaction Date OOB", { exact: true })).not.toBeVisible();
    await expect(page.getByTestId("date")).toBeEmpty();
    await expect(page.getByTestId("time")).toBeEmpty();

    // Simualte direct typing of date as unbroken string of numbers. 
    await page.getByTestId("date").focus();
    await page.getByTestId("date").pressSequentially(dateSequence, { delay: 300 });
    await expect(page.getByLabel("Date of Interaction Date OOB", { exact: true })).not.toBeEmpty();
    await expect(page.getByLabel("Time of Interaction Date OOB", { exact: true })).toBeVisible();
    await expect(page.getByLabel("Time of Interaction Date OOB", { exact: true })).not.toBeEmpty();
    await expect(page.getByTestId("date")).not.toBeEmpty();
    await expect(page.getByTestId("date")).toHaveValue(localeDateText);
    await expect(page.getByTestId("time")).not.toBeEmpty();
    await expect(page.getByTestId("time")).toHaveValue(isoTime);

}
