import { test as base } from "@playwright/test";

type TestFixtures = {
  testPage: string;
};

export const test = base.extend<TestFixtures>({
  testPage: async ({ page }, use) => {
    await use("/");
  },
});

export const expect = test.expect;
