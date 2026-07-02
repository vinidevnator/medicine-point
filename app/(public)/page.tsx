import type { Metadata } from "next";
import { DC_PHARMACY_ID } from "@/lib/constants";
import { productRepo, pharmacyRepo } from "@/repositories";
import { HomeClient, type FeaturedProduct } from "./home-client";

// Reads live DB state (featured products, active-pharmacy count); must not be
// frozen at build time.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Medicamentos perto de você",
};

export default async function HomePage() {
  const distinct = await productRepo.listDistinctEans();
  const featured: FeaturedProduct[] = await Promise.all(
    distinct.slice(0, 6).map(async (d) => {
      const rows = await productRepo.getByEanGlobal(d.ean);
      const lowestPrice = rows.length > 0 ? Math.min(...rows.map((r) => r.priceCents)) : 0;
      const totalStock = rows.reduce((sum, r) => sum + r.quantity, 0);
      return {
        ean: d.ean,
        name: d.name,
        description: d.description,
        priceCents: lowestPrice,
        imagePath: defaultMedicineImage(),
        quantity: totalStock,
        pharmaciesWithStock: rows.filter((r) => r.quantity > 0).length,
      };
    })
  );
  const pharmacies = (await pharmacyRepo.allWithSettings()).filter((p) => p.pharmacy.id !== DC_PHARMACY_ID);

  return <HomeClient featured={featured} pharmacyCount={pharmacies.length} />;
}

function defaultMedicineImage(): string {
  return "/img/med-default.png";
}
