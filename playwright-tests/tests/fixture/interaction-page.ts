import type { Page, Locator } from "@playwright/test";
import { expect } from "@playwright/test";

/**
 * Class that encapsulates the UI setup and interactions with the New Interaction form.
 */
export class InteractionPage {
    constructor(public readonly page: Page) {}

    async goto() {
        await this.page.goto(`${process.env.environmentUrl}/${process.env.testApp}`);
        await expect(this.page).toHaveTitle(/Accounts My Active Accounts -( Power Apps)?/, { timeout: 30000});

        await this.page.getByText("Interactions", { exact: true }).click();
        await this.page.getByLabel("New", { exact: true, timeout: 20000 }).click();
        await expect(this.page).toHaveTitle(/Interaction: Form 2: New Interaction -( Power Apps)?/,  { timeout: 30000});
        await this.page.getByRole("tab", { name: "Copilot" }).click(); // Get rid of copilot.

        // Don't really need to set the account on New forms.
        // await this.page.getByLabel("Account, Lookup", { exact: true }).fill("fullers");
        // await this.page.getByLabel("Fullers").click();
    }

    async setOOBDate(date?: string, time?: string) {
        if (date ) {
            await this.page.getByLabel("Date of Interaction Date OOB", { exact: true }).fill(date); 
        } else {
            await this.page.getByLabel("Date of Interaction Date OOB", { exact: true }).fill(""); 
            await this.page.getByLabel("Date of Interaction Date OOB", { exact: true }).press("Tab");
        }
        this.page.keyboard.press("Tab");

        if (time) {
            await this.page.getByLabel("Time of Interaction Date OOB", { exact: true }).fill(time); 
            this.page.keyboard.press("Tab");
        }
    }
    async setSpecificDate(date?: string, time?: string) {
        if (date) {
            await this.page.getByTestId("date").focus();
            await this.page.getByTestId("date").pressSequentially(date, { delay: 300 });       
        } else {
            await this.page.getByTestId("date").clear();
        }

        if (time) {
            await this.page.getByTestId("time").focus();
            await this.page.getByTestId("time").pressSequentially(time, { delay: 200 });  
        } else {
            await this.page.getByTestId("time").clear();
        }
    }

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
    async assertSpecificDate(date?: string, time?: string) {
        if (date) {
            await expect(this.page.getByTestId("date")).toHaveValue(date);
        } else {
            await expect(this.page.getByTestId("date")).    toBeEmpty();
        }
        if (time) {
            await expect(this.page.getByTestId("time")).toHaveValue(time);
        } else {
            await expect(this.page.getByTestId("time")).toBeEmpty();
        }
    }
}