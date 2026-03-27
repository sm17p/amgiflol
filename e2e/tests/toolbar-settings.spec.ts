import type { Locator, Page } from "@playwright/test";

import { expect, test } from "../fixtures";
import { openToolbarSettings } from "../pages/extension";
import {
	enableStableDomainInStorage,
	expectSvelteAppLoaded,
	getExtensionRoot,
	openStableTestPage,
} from "../pages/web";

async function ensureVotePressedOn(locator: Locator): Promise<void> {
	for (let i = 0; i < 2; i++) {
		if ((await locator.getAttribute("aria-pressed")) === "true") {
			return;
		}
		await locator.click();
	}
	await expect(locator).toHaveAttribute("aria-pressed", "true");
}

async function openToolbarSettingsUntilVisible(page: Page, target: Locator): Promise<void> {
	for (let i = 0; i < 2; i++) {
		await openToolbarSettings(page);
		const visible = await target.isVisible({ timeout: 1000 }).catch(() => false);
		if (visible) {
			return;
		}
	}
	await expect(target).toBeVisible();
}

test.describe("Toolbar settings menu", () => {
	test("feature voting and behaviour toggles are visible and interactive", async ({
		context,
		extensionId: _extensionId,
		page,
	}) => {
		test.setTimeout(15_000);

		await enableStableDomainInStorage(context);
		await openStableTestPage(page);
		await expect(getExtensionRoot(page)).toHaveCount(1);
		await expectSvelteAppLoaded(page);
		const settingsMenu = page.getByRole("menu").first();

		const featureVoting = page.getByRole("group", { name: "Feature Voting" }).first();
		await openToolbarSettingsUntilVisible(page, featureVoting);

		const animationDebuggerVote = page
			.getByRole("button", { name: "Animation Debugger" })
			.first();
		await expect(animationDebuggerVote).toBeVisible();
		await animationDebuggerVote.scrollIntoViewIfNeeded();
		const votePressedBefore = await animationDebuggerVote.getAttribute("aria-pressed");
		await animationDebuggerVote.click();
		const votePressedAfter = await animationDebuggerVote.getAttribute("aria-pressed");
		expect(votePressedAfter).not.toBe(votePressedBefore);

		const toolbarAutoHideItem = page
			.getByRole("menuitemcheckbox", { name: /Auto-Hide/i })
			.first();
		await expect(toolbarAutoHideItem).toBeVisible();
		await toolbarAutoHideItem.scrollIntoViewIfNeeded();

		const autoHideBefore = await toolbarAutoHideItem.getAttribute("aria-checked");
		await toolbarAutoHideItem.click();
		const autoHideAfter = await toolbarAutoHideItem.getAttribute("aria-checked");
		expect(autoHideAfter).not.toBe(autoHideBefore);

		const viewport = page.viewportSize();
		expect(viewport).toBeTruthy();
		if (!viewport) throw new Error("viewport not available");
		await page.mouse.move(viewport.width / 2, viewport.height - 1);
		await openToolbarSettingsUntilVisible(page, settingsMenu);

		const toolbarAutoHideItemAfter = settingsMenu
			.getByRole("menuitemcheckbox", { name: /Auto-Hide/i })
			.first();
		await expect(toolbarAutoHideItemAfter).toBeVisible();
		const autoHideAfterReopen = await toolbarAutoHideItemAfter.getAttribute("aria-checked");
		expect(autoHideAfterReopen).toBe(autoHideAfter);
	});

	test("Feature Voting upvotes can both be on and do not cross-toggle", async ({
		context,
		extensionId: _extensionId,
		page,
	}) => {
		test.setTimeout(15_000);

		await enableStableDomainInStorage(context);
		await openStableTestPage(page);
		await expect(getExtensionRoot(page)).toHaveCount(1);
		await expectSvelteAppLoaded(page);

		const featureVoting = page.getByRole("group", { name: "Feature Voting" }).first();
		await openToolbarSettingsUntilVisible(page, featureVoting);

		const voteA = featureVoting.getByRole("button", {
			name: "Animation Debugger",
		});
		const voteB = featureVoting.getByRole("button", { name: "Color Debugger" });

		const featureVotingSwitch = featureVoting.getByRole("switch", {
			name: "Feature Voting",
		});
		if (!(await voteA.isVisible())) {
			await featureVotingSwitch.click();
		}

		await expect(voteA).toBeVisible();
		await expect(voteB).toBeVisible();
		await voteA.scrollIntoViewIfNeeded();
		await voteB.scrollIntoViewIfNeeded();

		await ensureVotePressedOn(voteA);
		const aPressedAfterAOnRaw = await voteA.getAttribute("aria-pressed");
		if (aPressedAfterAOnRaw !== "true") {
			throw new Error(
				`expected vote A aria-pressed "true", got ${String(aPressedAfterAOnRaw)}`,
			);
		}
		const aPressedAfterAOn = aPressedAfterAOnRaw;

		for (let i = 0; i < 2; i++) {
			if ((await voteB.getAttribute("aria-pressed")) === "true") {
				break;
			}
			expect(await voteA.getAttribute("aria-pressed")).toBe(aPressedAfterAOn);
			await voteB.click();
		}

		await expect(voteA).toHaveAttribute("aria-pressed", "true");
		await expect(voteB).toHaveAttribute("aria-pressed", "true");
		await expect(voteA).toHaveAttribute("aria-pressed", aPressedAfterAOn);
	});
});
