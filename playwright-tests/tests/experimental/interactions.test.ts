/* eslint-disable no-debugger */
// @ts-check
import {test,expect} from '@playwright/test'

test.use({
    locale: 'en-GB',
    timezoneId: "Europe/London"
});

test('Open Interaction App', async({page}) => {
    await page.goto(process.env.environmentUrl!!);

    await expect(page).toHaveTitle(/Accounts My Active Accounts -( Power Apps)?/)
});

test('Create New Interaction', async({page}) => {
    await page.goto(`${process.env.environmentUrl}/${process.env.testApp}`);

    await expect(page).toHaveTitle(/Accounts My Active Accounts -( Power Apps)?/)

    await page.getByText('Interactions', { exact: true }).click();
    await page.getByLabel('New', { exact: true }).click();
    await expect(page).toHaveTitle(/Interaction: Form 2: New Interaction -( Power Apps)?/)
   // await page.getByRole('tab', { name: 'Copilot' }).click(); // Get rid ofr copilot.
    await page.getByLabel('Account, Lookup', { exact: true }).fill('fullers');
    await page.getByLabel('Fullers').click();

    // Fill in OOB date
    await expect(page.getByLabel('Time of Interaction Date OOB', {exact: true})).not.toBeVisible();
    await page.getByLabel('Date of Interaction Date OOB', { exact: true }).fill('03/02/2024');
    await page.getByLabel('Date of Interaction Date OOB', { exact: true }).press("Tab");
    await expect(page.getByLabel('Time of Interaction Date OOB', {exact: true})).toBeVisible();
    await expect(page.getByLabel('Time of Interaction Date OOB', {exact: true})).toHaveValue('8:00 AM');
    await expect(page.getByTestId('date')).toHaveValue('2024-03-02');
    await expect(page.getByTestId('time')).toHaveValue('08:00');

    // Get rid of copilot tab.
    await page.getByRole('tab', { name: 'Copilot' }).click(); 
    // Clear the specific date.
   await page.getByTestId('date').focus();
    await page.getByTestId('date').pressSequentially('12022024', { delay: 300 });
    await expect(page.getByLabel('Date of Interaction Date OOB', { exact: true })).toBeEmpty();
    await expect(page.getByLabel('Time of Interaction Date OOB', {exact: true})).not.toBeVisible();
    await expect(page.getByTestId('date')).toBeEmpty();
    await expect(page.getByTestId('time')).toBeEmpty();
});
