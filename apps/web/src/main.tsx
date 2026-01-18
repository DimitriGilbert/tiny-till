import { RouterProvider, createRouter } from "@tanstack/react-router";
import ReactDOM from "react-dom/client";

import Loader from "./components/loader";
import { routeTree } from "./routeTree.gen";
import { StorageErrorBoundary } from "./components/storage-error-boundary";
import { HydrateLoader } from "./components/hydrate-loader";
import { useServiceWorker } from "./hooks/useServiceWorker";

const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  defaultPendingComponent: () => <Loader />,
  context: {},
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

function App() {
  useServiceWorker();

  return (
    <RouterProvider router={router} />
  );
}

const rootElement = document.getElementById("app");

if (!rootElement) {
  throw new Error("Root element not found");
}

if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StorageErrorBoundary>
      <HydrateLoader>
        <App />
      </HydrateLoader>
    </StorageErrorBoundary>
  );
}
