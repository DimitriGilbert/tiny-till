import type { Page } from "@playwright/test";

type Viewport = { width: number; height: number };

export async function setViewport(page: Page, viewport: Viewport): Promise<void> {
  await page.setViewportSize(viewport);
  await page.waitForTimeout(200);
}

export async function getViewport(page: Page): Promise<Viewport> {
  return page.viewportSize() || { width: 1280, height: 720 };
}

export async function setMobileViewport(page: Page): Promise<void> {
  await setViewport(page, { width: 375, height: 667 });
}

export async function setTabletViewport(page: Page): Promise<void> {
  await setViewport(page, { width: 768, height: 1024 });
}

export async function setDesktopViewport(page: Page): Promise<void> {
  await setViewport(page, { width: 1920, height: 1080 });
}

export async function rotateViewport(page: Page): Promise<void> {
  const currentViewport = await getViewport(page);
  await setViewport(page, { width: currentViewport.height, height: currentViewport.width });
}

export async function simulateDevice(page: Page, deviceName: string): Promise<void> {
  const deviceViewports: Record<string, Viewport> = {
    "iPhone SE": { width: 375, height: 667 },
    "iPhone 14": { width: 390, height: 844 },
    "iPhone 14 Pro": { width: 393, height: 852 },
    "Pixel 5": { width: 393, height: 851 },
    "Galaxy S21": { width: 360, height: 800 },
    "iPad Mini": { width: 768, height: 1024 },
    "iPad Pro": { width: 1024, height: 1366 },
    "Surface Pro": { width: 912, height: 1368 },
    "Desktop Small": { width: 1366, height: 768 },
    "Desktop Large": { width: 1920, height: 1080 },
    "Desktop Ultra-wide": { width: 2560, height: 1440 },
  };

  const viewport = deviceViewports[deviceName];
  if (viewport) {
    await setViewport(page, viewport);
  } else {
    throw new Error(`Unknown device: ${deviceName}`);
  }
}

export function isMobileViewport(viewport: Viewport): boolean {
  return viewport.width < 768;
}

export function isTabletViewport(viewport: Viewport): boolean {
  return viewport.width >= 768 && viewport.width < 1024;
}

export function isDesktopViewport(viewport: Viewport): boolean {
  return viewport.width >= 1024;
}

export async function waitForLayoutStable(page: Page): Promise<void> {
  await page.waitForFunction(
    () => {
      const width1 = document.documentElement.offsetWidth;
      const height1 = document.documentElement.offsetHeight;
      return new Promise((resolve) => {
        setTimeout(() => {
          const width2 = document.documentElement.offsetWidth;
          const height2 = document.documentElement.offsetHeight;
          resolve(width1 === width2 && height1 === height2);
        }, 100);
      });
    },
    undefined,
    { timeout: 5000 }
  );
}
