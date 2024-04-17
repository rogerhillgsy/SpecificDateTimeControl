import { test as base } from '@playwright/test';
import { InteractionPage } from './interaction-page';

// To streamline testins, add an "InteractionPage" fixture.
export const test = base.extend<{ interactionPage: InteractionPage }>({
    interactionPage: async ({ page}, use)=> {
    const interactionPage = new InteractionPage(page);
    await interactionPage.goto();
    // Execute the test(...,()=>{}) function with the interactionPage that we have just set up.
    await use(interactionPage);
  },
});

export { expect } from '@playwright/test';
