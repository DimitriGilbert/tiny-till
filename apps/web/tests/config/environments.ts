export interface EnvironmentConfig {
  name: string;
  baseURL: string;
  buildCommand: string;
  devMode: boolean;
  serviceWorker: boolean;
  headless: boolean;
  description: string;
}

export const environments: EnvironmentConfig[] = [
  {
    name: "development",
    baseURL: "http://localhost:3001",
    buildCommand: "npm run dev",
    devMode: true,
    serviceWorker: false,
    headless: false,
    description: "Local development server with hot reload and dev tools",
  },
  {
    name: "staging",
    baseURL: "http://localhost:3001",
    buildCommand: "npm run build && npm run serve",
    devMode: false,
    serviceWorker: true,
    headless: true,
    description: "Production build locally with service worker enabled",
  },
  {
    name: "production-simulation",
    baseURL: process.env.PRODUCTION_URL || "http://localhost:3001",
    buildCommand: "npm run build && npm run serve",
    devMode: false,
    serviceWorker: true,
    headless: true,
    description: "Simulated production environment with full minification",
  },
];

export function getEnvironment(name: string): EnvironmentConfig | undefined {
  return environments.find((env) => env.name === name);
}

export function getEnvironmentServiceWorkers(environment: EnvironmentConfig): "allow" | "block" {
  return environment.serviceWorker ? "allow" : "block";
}
