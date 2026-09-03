import type { PropertyInput } from "@/lib/property-input";

const description = `Departamento exterior de 120m2, ubicado en 1er. piso. Consta de 2 recámaras (la principal con baño y walking closet), baño completo para recámara secundaria y visitas, sala, comedor, cocina integral abierta con isla de granito, balcón, área de lavado, 2 cajones de estacionamiento y bodega de 6.40m2. Techos doble altura, pisos de mármol, iluminación y ventilación natural, canceles de vidrio templado.

Edificio de solo 6 departamento, con elevador y roof garden común, gas natural.
Mantenimiento mensual: $3,000

Vías de acceso principales: Viaducto Miguel Alemán, Eje 4 Xola, Gabriel Mancera, Amores, Av. Cuauhtémoc, La Morena, Obrero Mundial.
Cerca de todo tipo de comercio y tiendas de conveniencia, restaurantes, cafeterías, bancos, hospitales, estéticas, gimnasios, etc.
Centros comerciales cercanos: Parque Delta y Ancora Narvarte

*El precio es más gastos, impuestos y derechos, sujetos a cotización notaria.`;

const imageNames = [
  "ee8661dc347359b6d5b3d81103cabe4e.JPG",
  "8306b00e637403360d969c3e00fd9ee8.JPG",
  "6aa74b76408e67d96f7f534e87896c78.JPG",
  "fb3b60c0196d44cccaea0df008f99e10.JPG",
  "28fd02a21662054a6f901512ebbcd48a.JPG",
  "107a522f1cd917425ba3a2ff79cae427.JPG",
  "dfc9eb4489e744a0ab760df8a53f08b0.JPG",
  "45099e91cc4035d50986f14cc9038952.JPG",
  "c708ba3d9ce86871be37f0af01fe1d6a.JPG",
  "49459b856c640ae10cfef6577cbacfa4.JPG",
  "6548f146f37e67b3081129e9f9e178df.JPG",
  "092100062945dfb6d624d3e4037fad94.JPG",
  "518ab4e60cb7c4ebc7c51b830eb48a5c.JPG",
  "8608c942ad38fae3af74520c9eb23c81.JPG",
  "5f8f59a1175262d5b6af98360bf0d576.JPG",
  "79753c8413c2b8d967a517435ce08eb4.JPG",
  "a69ce57ad1f96981305a1a959de23ee0.JPG",
  "ac68d494988a45c0929bea2eab7aceaf.JPG",
  "fdeaaf091b6f13adeec28356a6546234.JPG",
  "9fa9e81528301cf09947eabbffbfcb0f.JPG",
  "94a5541c192412c7f403c63d8a3c3437.JPG",
  "9cac0e8ec42ba93f3eda8533e4ce9f1a.jpg",
  "a7dc3da75636c14dca78cea3855a7d7f.jpg",
];

export const remaxSeedProperty: PropertyInput = {
  schemaVersion: 1,
  source: {
    provider: "RE/MAX México",
    url: "https://remax.com.mx/propiedad/688205",
    listingId: "688205",
    listingKey: "RDV688205-447",
    observedAt: "2026-09-02T18:00:00-06:00",
    rawMetadata: {
      pageTitle: "Departamento en Venta en Narvarte",
      openGraph: {
        title: "Departamento en Venta en Narvarte",
        image: `https://cdn.remax.com.mx/properties/688205/${imageNames[0]}`,
        description,
      },
      visibleHeader: {
        operation: "VENTA",
        price: "$6,700,000 MXN",
        area: "120.80 m2",
        bedrooms: "2",
        bathrooms: "2",
        parking: "2",
      },
      details: {
        terreno: "120.80 m2",
        estacionamiento: ["2", "Descubierto"],
        conservacion: "Excelente",
        construccion: "120.80 m2",
        cuartoServicio: "No",
        edadPropiedad: "6 años",
        habitaciones: "2",
        orientacion: "Norte",
        usoSuelo: "Habitacional",
        banos: "2",
        nivelesPiso: "3 (1)",
        mantenimiento: "$3,000 MXN",
      },
      hiddenListingFields: {
        propiedadId: "688205",
        clave: "RDV688205-447",
        tipo: "3",
        opcion: "1",
        oficinaId: "447",
        origen: ["1678", "1943"],
        estadoNombre: "Ciudad de México",
        ciudadNombre: "Ciudad de México",
        coloniaNombre: "Narvarte Poniente",
      },
      mapEmbedCoordinates: "19.3986,-99.1601",
      technicalSheetQrUrl:
        "https://api.remax.com.mx/files/qrlive/RDV688205-447_QR.png",
      imageCount: 23,
    },
  },
  property: {
    title: "Departamento en Venta en Narvarte",
    description,
    propertyType: "APARTMENT",
    operationType: "SALE",
    price: { amount: 6_700_000, currency: "MXN" },
    address: {
      street: "Juan Sánchez Azcona",
      exteriorNumber: null,
      interiorNumber: null,
      neighborhood: "Narvarte Poniente",
      municipality: "Ciudad de México",
      state: "Ciudad de México",
      postalCode: "03020",
      countryCode: "MX",
      formatted:
        "Juan Sánchez Azcona, Narvarte Poniente, Ciudad de México, 03020",
    },
    coordinates: { latitude: 19.3986, longitude: -99.1601 },
    details: {
      landAreaM2: 120.8,
      constructionAreaM2: 120.8,
      bedrooms: 2,
      bathrooms: 2,
      parkingSpaces: 2,
      parkingType: "Descubierto",
      serviceRoom: false,
      propertyAgeYears: 6,
      condition: "Excelente",
      orientation: "Norte",
      landUse: "Habitacional",
      buildingLevels: 3,
      unitFloor: 1,
      maintenanceAmount: 3_000,
      maintenanceCurrency: "MXN",
    },
    technicalSheetQrUrl:
      "https://api.remax.com.mx/files/qrlive/RDV688205-447_QR.png",
  },
  images: imageNames.map((name, order) => ({
    url: `https://cdn.remax.com.mx/properties/688205/${name}`,
    alt: `Departamento en Narvarte — foto ${order + 1}`,
    order,
  })),
  features: [
    ["AREA", "Cocina integral"],
    ["AREA", "Elevador"],
    ["AREA", "Escuelas cercanas"],
    ["AREA", "Gimnasios cercanos"],
    ["AREA", "Parques cercanos"],
    ["EQUIPMENT", "Agua potable"],
    ["EQUIPMENT", "Calle pavimentada"],
    ["EQUIPMENT", "Cisterna"],
    ["EQUIPMENT", "Energía eléctrica"],
  ].map(([category, name]) => ({
    category: category as "AREA" | "EQUIPMENT",
    name,
  })),
  contact: {
    agentName: "Gina Beltrán",
    agentAvatarUrl: "https://cdn.remax.com.mx/agentes/1705086338.jpg",
    phones: ["5589506279", "5534660786"],
    email: null,
    officeName: "RE/MAX Orbita Inmobiliaria",
    sourceOfficeId: "447",
  },
};
