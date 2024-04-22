import type { Page, Locator } from "@playwright/test";
import { expect } from "@playwright/test";
import { unwatchFile } from "fs";

/**
 * Class that encapsulates the UI setup and interactions with the New Interaction form.
 */
export class InteractionPage {
    constructor(public readonly page: Page) {}

    async goto() {
        await this.page.goto(`${process.env.environmentUrl}/${process.env.testApp}`);
        await expect(this.page).toHaveTitle(/Accounts My Active Accounts -( Power Apps)?/, { timeout: 30000 });
        // FF: "Interactions Active Interactions - Power Apps"
        // FF: 

        await this.page.getByText("Interactions", { exact: true }).click();
        await this.page.getByLabel("Account Interactions");
        await this.page.getByLabel("New", { exact: true }).click();
        await expect(this.page).toHaveTitle(/Interaction: Form 2: New Interaction -( Power Apps)?/, { timeout: 30000 });
        await this.page.getByRole("tab", { name: "Copilot" }).click(); // Get rid of copilot.

        // Could set the account on New form, but don't really need to.
        // await this.page.getByLabel("Account, Lookup", { exact: true }).fill("fullers");
        // await this.page.getByLabel("Fullers").click();
    }

    /**
     * Set the date on the out of the box control
     * @param date Date to be set (or undefined if it is to be cleared)
     * @param time Time to be set (or undefined if it is to be cleared)
     */
    async setOOBDate(date?: string, time?: string) {
        if (date) {
            await this.page.getByLabel("Date of Interaction Date OOB", { exact: true }).clear();
            await this.page.getByLabel("Date of Interaction Date OOB", { exact: true }).fill(date);
            await this.page.getByLabel("Date of Interaction Date OOB", { exact: true }).press("Enter");
        } else {
            let value;
            // Clearing the Out Of Box date control is flaky, so may need to retry.
            do {
                await this.page.getByLabel("Date of Interaction Date OOB", { exact: true }).click();
                await this.page.getByLabel("Date of Interaction Date OOB", { exact: true }).fill("");
                await this.page.getByLabel("Date of Interaction Date OOB", { exact: true }).press("Enter");
                value = await this.page.getByLabel("Date of Interaction Date OOB", { exact: true }).inputValue();
            } while (value != "");
        }
        await this.page.getByLabel("Date of Interaction Date OOB", { exact: true }).press("Tab");
 
        if (time) {
            await this.page.getByLabel("Time of Interaction Date OOB", { exact: true }).fill(time);
        }
        await this.page.keyboard.press("Tab");
    }

    /**
     * Set the specificDate control on the form to a given date and time.
     * @param date Date to be set (or undefined if it is to be cleared)
     * @param time Time to be set (or undefined if it is to be cleared)
     */
    async setSpecificDate(date?: string, time?: string) {
        if (date) {
            await this.page.getByTestId("date").focus();
            await this.page.getByTestId("date").pressSequentially(date, { delay: 300 });
        } else {
            await this.page.getByTestId("date").clear();
        }

        if (time) {
            await this.page.getByTestId("time").focus();
            await this.page.getByTestId("time").pressSequentially(time, { delay: 100 });
        } else {
            await this.page.getByTestId("time").clear();
        }
    }

    /**
     * Assert the value of the out of the box date control
     * @param date Date to be asserted (or undefined for an empty date)
     * @param time Time to be asserted (or undefined for an empty time)
     */
    async assertOOBDate(date?: string, time?: string) {
        if (date) {
            await expect(this.page.getByLabel("Date of Interaction Date OOB", { exact: true })).not.toBeEmpty();
            await expect(this.page.getByLabel("Date of Interaction Date OOB", { exact: true })).toHaveValue(date);
        } else {
            await expect(this.page.getByLabel("Date of Interaction Date OOB", { exact: true })).toBeEmpty();
        }
        if (time) {
            await expect(this.page.getByLabel("Time of Interaction Date OOB", { exact: true })).toBeVisible();
            await expect(this.page.getByLabel("Time of Interaction Date OOB", { exact: true })).toHaveValue(time);
        } else {
            await expect(this.page.getByLabel("Time of Interaction Date OOB", { exact: true })).not.toBeVisible();
        }
    }

    /**
     * Assert the value of our custom Specific date control.
     * @param date Date to be asserted (or undefined for an empty date)
     * @param time Time to be asserted (or undefined for an empty time)
     */
    async assertSpecificDate(date?: string, time?: string) {
        if (date) {
            await expect(this.page.getByTestId("date")).toHaveValue(date);
        } else {
            var value2 = await this.page.getByTestId("date").inputValue();
            await expect(this.page.getByTestId("date")).toBeEmpty();
        }
        if (time) {
            await expect(this.page.getByTestId("time")).toHaveValue(time);
        } else {
            await expect(this.page.getByTestId("time")).toBeEmpty();
        }
    }
}
