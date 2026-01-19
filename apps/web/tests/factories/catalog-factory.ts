import { createProduct } from "./product-factory";

interface Catalog {
  products: unknown[];
  exportDate: string;
  version: string;
}

export function createCatalog(productCount: number = 10): Catalog {
  return {
    version: "1.0.0",
    exportDate: new Date().toISOString(),
    products: Array.from({ length: productCount }, (_, index) => createProduct({
      name: `Product ${index + 1}`,
      price: (index + 1) * 1000,
    })),
  };
}

export function createEmptyCatalog(): Catalog {
  return {
    version: "1.0.0",
    exportDate: new Date().toISOString(),
    products: [],
  };
}

export function createLargeCatalog(count: number = 100): Catalog {
  return createCatalog(count);
}

export function createCatalogWithDuplicates(): Catalog {
  const baseProduct = createProduct({ name: "Duplicate Product" });
  return {
    version: "1.0.0",
    exportDate: new Date().toISOString(),
    products: [baseProduct, baseProduct],
  };
}

export function createCatalogWithMissingFields(): unknown[] {
  return [
    { id: crypto.randomUUID(), name: "Valid Product" },
    { id: crypto.randomUUID(), price: 1000 },
    { id: crypto.randomUUID(), name: "Another Valid Product", price: 500, createdAt: Date.now() },
  ];
}

export function createCatalogWithInvalidData(): unknown[] {
  return [
    { id: crypto.randomUUID(), name: "Negative Price", price: -1000 },
    { id: crypto.randomUUID(), name: "Zero Price", price: 0 },
    { id: crypto.randomUUID(), name: "String Price", price: NaN },
  ];
}

export function createCatalogWithInvalidJSON(): string {
  return JSON.stringify({ version: "1.0.0", products: [{ id: "invalid" }] });
}

export function createCatalogWithImages(imageCount: number = 5): Catalog {
  return {
    version: "1.0.0",
    exportDate: new Date().toISOString(),
    products: Array.from({ length: imageCount }, (_, index) => createProduct({
      name: `Product with Image ${index + 1}`,
      price: (index + 1) * 1000,
      imageData: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==`,
    })),
  };
}

export function createCatalogWithDifferentVersions(): Record<string, Catalog> {
  return {
    "1.0.0": createCatalog(5),
    "2.0.0": createCatalog(5),
    "0.9.0": createCatalog(5),
  };
}

export function createExportString(catalog: Catalog): string {
  return JSON.stringify(catalog, null, 2);
}

export function createCatalogJSONFile(catalog: Catalog): Blob {
  return new Blob([JSON.stringify(catalog, null, 2)], {
    type: "application/json",
  });
}

export function createCorruptedJSONFile(): Blob {
  return new Blob(["{ invalid json }"], {
    type: "application/json",
  });
}

export function parseCatalogFromJSON(jsonString: string): Catalog {
  return JSON.parse(jsonString) as Catalog;
}

export function validateCatalogSchema(catalog: unknown): boolean {
  if (typeof catalog !== "object" || catalog === null) {
    return false;
  }

  const catalogObj = catalog as Record<string, unknown>;

  if (!catalogObj.version || typeof catalogObj.version !== "string") {
    return false;
  }

  if (!Array.isArray(catalogObj.products)) {
    return false;
  }

  return catalogObj.products.every((product) => {
    if (typeof product !== "object" || product === null) {
      return false;
    }

    const productObj = product as Record<string, unknown>;
    return (
      typeof productObj.id === "string" &&
      typeof productObj.name === "string" &&
      typeof productObj.price === "number"
    );
  });
}
