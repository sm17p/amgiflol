import { createFixture, withExtension } from "playwright-webextext";

import path from "node:path";
import { firefox } from "playwright";
import { expect } from "playwright/test";

let extensionPath = path.resolve("dist/firefox-mv3");
console.log("🚀 ~ extensionPath:", extensionPath);

const browser = await withExtension(firefox, extensionPath).launch({
  headless: false
});

// const { test, expect } = createFixture(extensionPath);

// test("Popup counter increments when clicked", async ({ page, }) => {
    
// });

(async () => {
    const page = await browser.newPage();
    await page.goto("https://example.com/");
})();