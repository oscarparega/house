import assert from "node:assert/strict";
import test from "node:test";
import {
  canonicalizeListingUrl,
  propertyInputSchema,
} from "../src/lib/property-input";
import {
  remaxDelValleProperty,
  remaxSeedProperties,
  remaxSeedProperty,
} from "../src/lib/remax-seed";

test("the RE/MAX seed satisfies the ingestion contract", () => {
  const parsed = propertyInputSchema.parse(remaxSeedProperty);
  assert.equal(parsed.source.listingId, "688205");
  assert.equal(parsed.images.length, 23);
  assert.deepEqual(parsed.property.coordinates, {
    latitude: 19.3986,
    longitude: -99.1601,
  });
});

test("every RE/MAX seed satisfies the ingestion contract", () => {
  const parsed = remaxSeedProperties.map((property) =>
    propertyInputSchema.parse(property),
  );
  assert.deepEqual(
    parsed.map((property) => property.source.listingId),
    ["688205", "682749"],
  );
  assert.equal(remaxDelValleProperty.images.length, 9);
  assert.equal(remaxDelValleProperty.features.length, 22);
  assert.deepEqual(remaxDelValleProperty.property.coordinates, {
    latitude: 19.3967,
    longitude: -99.1682,
  });
});

test("canonical URLs discard tracking parameters, fragments, and trailing slashes", () => {
  assert.equal(
    canonicalizeListingUrl(
      "https://remax.com.mx/propiedad/688205/?utm_source=model#photos",
    ),
    "https://remax.com.mx/propiedad/688205",
  );
});

test("coordinates must be valid and provided as a complete pair", () => {
  const invalid = structuredClone(remaxSeedProperty);
  invalid.property.coordinates = { latitude: 120, longitude: -99.1601 };
  assert.equal(propertyInputSchema.safeParse(invalid).success, false);
});

test("nullable listing facts remain accepted", () => {
  const sparse = structuredClone(remaxSeedProperty);
  sparse.property.price.amount = null;
  sparse.property.coordinates = null;
  sparse.property.details.bedrooms = null;
  assert.equal(propertyInputSchema.safeParse(sparse).success, true);
});
