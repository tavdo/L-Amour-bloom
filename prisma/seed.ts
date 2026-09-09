import { config as loadEnv } from "dotenv";
import { PrismaClient, type ProductStatus } from "../generated/prisma";
import bcrypt from "bcryptjs";
import { createPrismaAdapter, resolveDatabaseUrl } from "../lib/prisma-adapter";

loadEnv({ path: ".env.local" });
loadEnv();

const connectionString = resolveDatabaseUrl();
const prisma = new PrismaClient({
  adapter: createPrismaAdapter(connectionString),
});

const img = (id: string, extra = "") =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1400&q=80${extra}`;

async function main() {
  const adminEmail = (process.env.ADMIN_EMAIL ?? "admin@example.com").toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD ?? "changeme-admin";

  await prisma.orderItem.deleteMany();
  await prisma.paymentEvent.deleteMany();
  await prisma.order.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.productTranslation.deleteMany();
  await prisma.product.deleteMany();
  await prisma.categoryTranslation.deleteMany();
  await prisma.category.deleteMany();
  await prisma.shippingRegion.deleteMany();
  await prisma.adminSession.deleteMany();

  const passwordHash = await bcrypt.hash(adminPassword, 12);
  await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: { passwordHash, name: "Studio admin" },
    create: {
      email: adminEmail,
      passwordHash,
      name: "Studio admin",
    },
  });

  await prisma.siteSetting.upsert({
    where: { key: "usd_rate_hint" },
    update: { value: "0.37" },
    create: { key: "usd_rate_hint", value: "0.37" },
  });

  await prisma.shippingRegion.createMany({
    data: [
      {
        slug: "tbilisi",
        nameEn: "Tbilisi",
        nameKa: "თბილისი",
        priceGel: 1000,
        priceUsd: 400,
        sortOrder: 1,
      },
      {
        slug: "regional-city",
        nameEn: "Regional city",
        nameKa: "რეგიონული ქალაქი",
        priceGel: 1500,
        priceUsd: 550,
        sortOrder: 2,
      },
      {
        slug: "village",
        nameEn: "Village / other settlement",
        nameKa: "სოფელი / სხვა დასახლება",
        priceGel: 2000,
        priceUsd: 750,
        sortOrder: 3,
      },
    ],
  });

  const categories = [
    {
      slug: "bouquets",
      sortOrder: 1,
      en: { name: "Bouquets", description: "Handheld preserved and mixed-media bouquets." },
      ka: { name: "თაიგულები", description: "შემონახული და შერეული მასალის თაიგულები." },
    },
    {
      slug: "compositions",
      sortOrder: 2,
      en: { name: "Compositions", description: "Table and interior arrangements." },
      ka: { name: "კომპოზიციები", description: "მაგიდისა და ინტერიერის კომპოზიციები." },
    },
    {
      slug: "wall-decor",
      sortOrder: 3,
      en: { name: "Wall décor", description: "Wreaths and hanging botanical pieces." },
      ka: { name: "კედლის დეკორი", description: "გვირგვინები და საკიდი ბოტანიკა." },
    },
    {
      slug: "wedding",
      sortOrder: 4,
      en: { name: "Wedding", description: "Bridal bouquets, boutonnieres, and ceremony pieces." },
      ka: { name: "ქორწილო", description: "საპატარძლო თაიგულები, ბუტონიერები, ცერემონიის დეკორი." },
    },
    {
      slug: "gift-sets",
      sortOrder: 5,
      en: { name: "Gift sets", description: "Ready-to-give boxes that travel well." },
      ka: { name: "საჩუქრის ნაკრებები", description: "მზა ნაკრებები, რომლებიც ადვილად იგზავნება." },
    },
  ];

  const categoryIds: Record<string, string> = {};
  for (const category of categories) {
    const created = await prisma.category.create({
      data: {
        slug: category.slug,
        sortOrder: category.sortOrder,
        translations: {
          create: [
            { locale: "en", ...category.en },
            { locale: "ka", ...category.ka },
          ],
        },
      },
    });
    categoryIds[category.slug] = created.id;
  }

  const products: {
    slug: string;
    sku: string;
    category: string;
    priceGel: number;
    priceUsd: number;
    featured?: boolean;
    status?: ProductStatus;
    en: { name: string; description: string };
    ka: { name: string; description: string };
    images: string[];
    variants: {
      size?: string;
      color?: string;
      colorHex?: string;
      stock: number;
      priceGel?: number;
      priceUsd?: number;
    }[];
  }[] = [
    {
      slug: "amber-meadow-bouquet",
      sku: "BQ-001",
      category: "bouquets",
      priceGel: 12900,
      priceUsd: 4800,
      featured: true,
      en: {
        name: "Amber Meadow bouquet",
        description:
          "A handheld mix of preserved roses, wheat, and dyed ruscus. Built for gifting and long-distance shipping — nothing in this bouquet is fresh-cut.",
      },
      ka: {
        name: "ქარვის მინდვრის თაიგული",
        description:
          "შემონახული ვარდები, ხორბალი და რუსკუსი. საჩუქრად და შორ მანძილზე გასაგზავნად — არცერთი ყვავილი არ არის ახალმოჭრილი.",
      },
      images: [
        img("photo-1487070183336-b863922373d4"),
        img("photo-1468327768560-75b60c6af85a"),
      ],
      variants: [
        { size: "S", color: "Amber", colorHex: "#C48A3A", stock: 8 },
        { size: "M", color: "Amber", colorHex: "#C48A3A", stock: 10, priceGel: 14900, priceUsd: 5500 },
        { size: "L", color: "Blush", colorHex: "#D4A5A0", stock: 6, priceGel: 17900, priceUsd: 6600 },
      ],
    },
    {
      slug: "night-garden-bouquet",
      sku: "BQ-002",
      category: "bouquets",
      priceGel: 15900,
      priceUsd: 5900,
      featured: true,
      en: {
        name: "Night Garden bouquet",
        description:
          "Deep plum preserved blooms with eucalyptus and silk ribbon. A darker palette for evenings and winter interiors.",
      },
      ka: {
        name: "ღამის ბაღის თაიგული",
        description:
          "მუქი ქლიავისფერი შემონახული ყვავილები ევკალიპტითა და აბრეშუმის ლენტით. საღამოს და ზამთრის ინტერიერისთვის.",
      },
      images: [
        img("photo-1490750967868-88aa6483cc83"),
        img("photo-1457089328109-4c1c0c0d0d2b"),
      ],
      variants: [
        { size: "M", color: "Plum", colorHex: "#5C3340", stock: 7 },
        { size: "L", color: "Plum", colorHex: "#5C3340", stock: 4, priceGel: 18900, priceUsd: 7000 },
      ],
    },
    {
      slug: "ceramic-bowl-composition",
      sku: "CM-010",
      category: "compositions",
      priceGel: 18900,
      priceUsd: 7000,
      featured: true,
      en: {
        name: "Ceramic bowl composition",
        description:
          "A low table arrangement in a handmade ceramic bowl. Dried hydrangea, olive, and cotton. No water, no maintenance.",
      },
      ka: {
        name: "კერამიკის თასის კომპოზიცია",
        description:
          "დაბალი მაგიდის კომპოზიცია ხელნაკეთ კერამიკულ თასში. გამხმარი ჰორტენზია, ზეთისხილი და ბამბა. წყალი არ სჭირდება.",
      },
      images: [img("photo-1501004318641-b39e6451bec6")],
      variants: [
        { size: "One size", color: "Ivory", colorHex: "#EFE6D8", stock: 5 },
        { size: "One size", color: "Sage", colorHex: "#8A9A7B", stock: 4 },
      ],
    },
    {
      slug: "olive-wall-wreath",
      sku: "WD-003",
      category: "wall-decor",
      priceGel: 11900,
      priceUsd: 4400,
      featured: true,
      en: {
        name: "Olive wall wreath",
        description:
          "A hanging wreath of preserved olive and flax. Light enough for plaster walls; packed flat for regional delivery.",
      },
      ka: {
        name: "ზეთისხილის კედლის გვირგვინი",
        description:
          "შემონახული ზეთისხილისა და სელის საკიდი გვირგვინი. მსუბუქია თაბაშირის კედლებისთვის; იგზავნება ბრტყლად.",
      },
      images: [img("photo-1519681393784-d120267933ba")],
      variants: [
        { size: "35 cm", stock: 9 },
        { size: "50 cm", stock: 5, priceGel: 14900, priceUsd: 5500 },
      ],
    },
    {
      slug: "bridal-preserved-cascade",
      sku: "WD-021",
      category: "wedding",
      priceGel: 34900,
      priceUsd: 12900,
      en: {
        name: "Bridal preserved cascade",
        description:
          "A cascading bridal bouquet in ivory and dusty rose. Designed so the wedding photographs and the keepsake are the same object.",
      },
      ka: {
        name: "საპატარძლო კასკადი",
        description:
          "კასკადური საპატარძლო თაიგული სპილოს ძვლისა და მტვრიანი ვარდისფერით. ფოტოებიც და შესანახი ნამუშევარიც ერთი და იგივეა.",
      },
      images: [img("photo-1519225421980-715cb0215aed")],
      variants: [
        { size: "Classic", color: "Ivory", colorHex: "#F3EDE4", stock: 3 },
        { size: "Cascade", color: "Blush", colorHex: "#D4A5A0", stock: 2, priceGel: 38900, priceUsd: 14400 },
      ],
    },
    {
      slug: "linen-gift-box",
      sku: "GS-007",
      category: "gift-sets",
      priceGel: 9900,
      priceUsd: 3700,
      en: {
        name: "Linen gift box",
        description:
          "A small preserved posy, beeswax candle, and handwritten card in a linen-lined box. Built for courier bags.",
      },
      ka: {
        name: "სელის საჩუქრის ყუთი",
        description:
          "პატარა შემონახული თაიგული, ცვილის სანთელი და ბარათი სელით მოპირკეთებულ ყუთში. კურიერის ჩანთისთვისაა გათვლილი.",
      },
      images: [img("photo-1513885535751-8b9238bd345a")],
      variants: [
        { size: "Standard", color: "Natural", stock: 12 },
        { size: "Standard", color: "Wine", colorHex: "#6B2D3C", stock: 8 },
      ],
    },
  ];

  for (const product of products) {
    await prisma.product.create({
      data: {
        slug: product.slug,
        sku: product.sku,
        status: product.status ?? "PUBLISHED",
        featured: Boolean(product.featured),
        categoryId: categoryIds[product.category],
        priceGel: product.priceGel,
        priceUsd: product.priceUsd,
        translations: {
          create: [
            { locale: "en", ...product.en },
            { locale: "ka", ...product.ka },
          ],
        },
        images: {
          create: product.images.map((url, index) => ({
            url,
            alt: product.en.name,
            sortOrder: index,
          })),
        },
        variants: {
          create: product.variants.map((variant, index) => ({
            sku: `${product.sku}-${index + 1}`,
            size: variant.size,
            color: variant.color,
            colorHex: variant.colorHex,
            stock: variant.stock,
            priceGel: variant.priceGel,
            priceUsd: variant.priceUsd,
          })),
        },
      },
    });
  }

  console.log(`Seeded catalog and admin ${adminEmail}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
