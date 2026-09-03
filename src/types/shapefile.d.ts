declare module "shapefile" {
  export type Feature = {
    type: "Feature";
    properties: Record<string, unknown>;
    geometry: { type: string; coordinates: unknown };
  };

  export function open(
    shp: string,
    dbf?: string,
    options?: { encoding?: string },
  ): Promise<{
    read(): Promise<{ done: boolean; value?: Feature }>;
  }>;
}
