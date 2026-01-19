import { devices } from "@playwright/test";

interface DeviceConfig {
  name: string;
  playwrightDevice: string;
  viewport: { width: number; height: number };
  category: "mobile" | "tablet" | "desktop";
}

export const mobileDevices: DeviceConfig[] = [
  {
    name: "iPhone SE",
    playwrightDevice: "iPhone SE",
    viewport: { width: 375, height: 667 },
    category: "mobile",
  },
  {
    name: "iPhone 14",
    playwrightDevice: "iPhone 14",
    viewport: { width: 390, height: 844 },
    category: "mobile",
  },
  {
    name: "iPhone 14 Pro",
    playwrightDevice: "iPhone 14 Pro",
    viewport: { width: 393, height: 852 },
    category: "mobile",
  },
  {
    name: "Pixel 5",
    playwrightDevice: "Pixel 5",
    viewport: { width: 393, height: 851 },
    category: "mobile",
  },
  {
    name: "Samsung Galaxy S21",
    playwrightDevice: "Galaxy S21",
    viewport: { width: 360, height: 800 },
    category: "mobile",
  },
];

export const tabletDevices: DeviceConfig[] = [
  {
    name: "iPad Mini",
    playwrightDevice: "iPad Mini",
    viewport: { width: 768, height: 1024 },
    category: "tablet",
  },
  {
    name: "iPad Pro",
    playwrightDevice: "iPad Pro",
    viewport: { width: 1024, height: 1366 },
    category: "tablet",
  },
  {
    name: "Surface Pro",
    playwrightDevice: "Surface Pro",
    viewport: { width: 912, height: 1368 },
    category: "tablet",
  },
];

export const desktopDevices: DeviceConfig[] = [
  {
    name: "Desktop Small",
    playwrightDevice: "Desktop Chrome",
    viewport: { width: 1366, height: 768 },
    category: "desktop",
  },
  {
    name: "Desktop Large",
    playwrightDevice: "Desktop Chrome",
    viewport: { width: 1920, height: 1080 },
    category: "desktop",
  },
  {
    name: "Desktop Ultra-wide",
    playwrightDevice: "Desktop Chrome",
    viewport: { width: 2560, height: 1440 },
    category: "desktop",
  },
];

export const allDevices: DeviceConfig[] = [
  ...mobileDevices,
  ...tabletDevices,
  ...desktopDevices,
];

export function getDevicesByCategory(category: "mobile" | "tablet" | "desktop"): DeviceConfig[] {
  return allDevices.filter((device) => device.category === category);
}

export function getDeviceByName(name: string): DeviceConfig | undefined {
  return allDevices.find((device) => device.name === name);
}

export function getViewportString(viewport: { width: number; height: number }): string {
  return `${viewport.width}x${viewport.height}`;
}
