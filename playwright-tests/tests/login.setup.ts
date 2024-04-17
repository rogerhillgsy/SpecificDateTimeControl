import { chromium, FullConfig, test as setup } from "@playwright/test";
import {existsSync} from "fs";

// Log in to CRM.
// Will require manual intervention for MFA.
//
setup("do login", async ({ page, baseURL }) => {
  //if there is any issue use chromium.launch({ headless: false })

  // If there is not existing preserved state, go through authentication steps and then store the browser state to be
  // reused the next time around.
  if (
    process.env.storageState != null &&
    !existsSync(process.env.storageState)
  ) {
    if (process.env.isRefreshCookies === "1") {
      const browser = await chromium.launch({ headless: false });
      const page = await browser.newPage();
      let userName = process.env.loginUserName;

      await page.goto(baseURL!, { waitUntil: "networkidle" });

      const userNameTextBox = page.locator("[name=loginfmt]");
      userNameTextBox.fill(userName!);
      await page.getByRole("button", { name: "Next" }).click();

      const passwordTextBox = page.locator("[name=passwd]");
      passwordTextBox.fill(process.env.password!);
      await page.getByRole("button", { name: "Sign In" }).click();

      // The next section is needed if MFA is enabled on your tenant.
      // await page
      //   .getByText("Approve a request on my Microsoft Authenticator App")
      //   .click();
      // await page.getByText("Yes").click();

      await page
        .getByText("Stay signed in?")
        .click();
      await page.getByText("Yes").click();

      await page.waitForURL("**/main.aspx**");

      await page.context().storageState({ path: process.env.storageState });
    }
  }
});
