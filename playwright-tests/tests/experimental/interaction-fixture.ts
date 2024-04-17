import { test as base } from '@playwright/test';
import { InteractionPage } from './interaction-page';

// Extend basic test by providing a "todoPage" fixture.
export const test = base.extend<{ interactionPage: InteractionPage }>({
    interactionPage: async ({ page}, use)=> {
  // test.use({ 
  //   locale: "en-US",
  //   timezoneId: "America/New_York"
  // });
    const interactionPage = new InteractionPage(page);
    await interactionPage.goto();
    await use(interactionPage);
  },
});

export { expect } from '@playwright/test';
