import "server-only";
import { pharmacyRepo, productRepo } from "@/repositories";
import { cepToCoords, haversineKm } from "@/lib/cep-data";
import { DELIVERY_TIPOS, DC_PHARMACY_ID } from "@/lib/constants";

export type PharmacyOffering = {
  pharmacyId: string;
  nomeFantasia: string;
  distanciaKm: number;
  quantidade: number;
  precoCents: number;
  tempoEstimadoMin: number;
  freteCents: number;
  tiposEntrega: Array<"retirada" | "moto" | "distribuicao">;
};

const DC_TEMP_BY_DISTANCE: Array<{ maxKm: number; min: number }> = [
  { maxKm: 5, min: 360 },
  { maxKm: 15, min: 480 },
  { maxKm: 30, min: 720 },
  { maxKm: Infinity, min: 1440 },
];

export const searchService = {
  /**
   * Locates pharmacies whose settings + stock can fulfill a given EAN for a CEP.
   * Always appends a distribution-center option (spec: always available).
   */
  findByEanAndCep(ean: string, cep: string): PharmacyOffering[] {
    const clientCoords = cepToCoords(cep);
    // The DC virtual pharmacy is presented via the synthetic block below only;
    // exclude it here so it never appears twice or with the wrong tempo/distance.
    const allPharmacies = pharmacyRepo.allWithSettings().filter((r) => r.pharmacy.id !== DC_PHARMACY_ID);
    const allProducts = productRepo.getByEanGlobal(ean);

    const offerings: PharmacyOffering[] = [];

    for (const p of allProducts) {
      if (p.quantidade <= 0) continue;
      const row = allPharmacies.find((r) => r.pharmacy.id === p.pharmacyId);
      if (!row) continue;
      const distance = haversineKm(clientCoords, { lat: row.pharmacy.lat, lng: row.pharmacy.lng });
      if (distance > row.settings.raioKm) continue;

      const tipos: Array<"retirada" | "moto" | "distribuicao"> = [];
      let tempo: number = DELIVERY_TIPOS.distribuicao.tempoMin;
      let frete = 0;

      if (row.settings.aceitaRetirada) {
        tipos.push("retirada");
        tempo = Math.min(tempo, DELIVERY_TIPOS.retirada.tempoMin);
      }
      if (row.settings.aceitaMoto) {
        tipos.push("moto");
        const motoTempo = Math.min(
          DELIVERY_TIPOS.moto.tempoMin,
          30 + Math.round(distance * 6)
        );
        tempo = Math.min(tempo, motoTempo);
        frete = row.settings.freteMotoCents;
      }
      tipos.push("distribuicao");

      offerings.push({
        pharmacyId: p.pharmacyId,
        nomeFantasia: row.pharmacy.nomeFantasia,
        distanciaKm: Math.round(distance * 10) / 10,
        quantidade: p.quantidade,
        precoCents: p.precoCents,
        tempoEstimadoMin: tempo,
        freteCents: frete,
        tiposEntrega: tipos,
      });
    }

    offerings.sort((a, b) => a.distanciaKm - b.distanciaKm);

    if (!offerings.some((o) => o.pharmacyId === DC_PHARMACY_ID)) {
      const dcRow = pharmacyRepo.get(DC_PHARMACY_ID);
      const dcDistance = dcRow ? haversineKm(clientCoords, { lat: dcRow.lat, lng: dcRow.lng }) : 0;
      const dcTemp = DC_TEMP_BY_DISTANCE.find((b) => dcDistance <= b.maxKm) ?? DC_TEMP_BY_DISTANCE[DC_TEMP_BY_DISTANCE.length - 1];
      offerings.push({
        pharmacyId: DC_PHARMACY_ID,
        nomeFantasia: "Centro de Distribuição",
        distanciaKm: Math.round(dcDistance * 10) / 10,
        quantidade: 999,
        precoCents: offerings[0]?.precoCents ?? 3990,
        tempoEstimadoMin: dcTemp.min,
        freteCents: 0,
        tiposEntrega: ["distribuicao"],
      });
    }

    return offerings;
  },

  estimateDelivery(
    tipo: "retirada" | "moto" | "distribuicao",
    distance: number
  ): { tempoMin: number; freteCents: number; freteMotoCents: number } {
    if (tipo === "retirada") return { tempoMin: DELIVERY_TIPOS.retirada.tempoMin, freteCents: 0, freteMotoCents: 0 };
    if (tipo === "moto") {
      const t = Math.min(DELIVERY_TIPOS.moto.tempoMin, 30 + Math.round(distance * 6));
      return { tempoMin: t, freteCents: 599, freteMotoCents: 599 };
    }
    const band = DC_TEMP_BY_DISTANCE.find((b) => distance <= b.maxKm)!;
    return { tempoMin: band.min, freteCents: 0, freteMotoCents: 0 };
  },
};