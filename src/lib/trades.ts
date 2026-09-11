// CSI MasterFormat-based trade taxonomy used to guide extraction and to
// order/group results consistently in the UI. This is not exhaustive —
// it's a practical set of trades that cover typical commercial/residential
// specs and drawings, roughly in construction sequence order.

export interface TradeDefinition {
  name: string;
  csiDivision: string;
  /** Lower = earlier in the typical build sequence. Used for sorting. */
  sequence: number;
  /** Short hint used in the extraction prompt about what this trade covers. */
  scopeHint: string;
}

export const TRADE_TAXONOMY: TradeDefinition[] = [
  { name: "General Conditions / Project Management", csiDivision: "01", sequence: 0, scopeHint: "mobilization, permits, temporary facilities, supervision" },
  { name: "Sitework / Earthwork / Utilities", csiDivision: "31-33", sequence: 1, scopeHint: "demolition, excavation, grading, site utilities, paving" },
  { name: "Concrete", csiDivision: "03", sequence: 2, scopeHint: "footings, foundations, slabs, structural concrete" },
  { name: "Masonry", csiDivision: "04", sequence: 3, scopeHint: "brick, block, stone veneer" },
  { name: "Structural Steel / Metals", csiDivision: "05", sequence: 4, scopeHint: "structural steel, metal framing, misc. metals" },
  { name: "Wood Framing / Carpentry", csiDivision: "06", sequence: 5, scopeHint: "rough carpentry, framing, sheathing, finish carpentry, millwork" },
  { name: "Roofing / Waterproofing", csiDivision: "07", sequence: 6, scopeHint: "roofing, flashing, waterproofing, insulation, air/vapor barriers" },
  { name: "Doors, Windows & Glazing", csiDivision: "08", sequence: 7, scopeHint: "doors, frames, hardware, windows, storefront, glazing" },
  { name: "Fire Suppression", csiDivision: "21", sequence: 8, scopeHint: "fire sprinklers, standpipes" },
  { name: "Plumbing", csiDivision: "22", sequence: 8, scopeHint: "domestic water, waste/vent, fixtures, gas piping" },
  { name: "HVAC / Mechanical", csiDivision: "23", sequence: 8, scopeHint: "ductwork, equipment, controls, ventilation" },
  { name: "Electrical", csiDivision: "26", sequence: 8, scopeHint: "power distribution, wiring, panels, lighting, devices" },
  { name: "Communications / Low Voltage", csiDivision: "27", sequence: 9, scopeHint: "data/voice cabling, AV" },
  { name: "Electronic Safety & Security", csiDivision: "28", sequence: 9, scopeHint: "fire alarm, security, access control, cameras" },
  { name: "Insulation / Drywall / Finishes", csiDivision: "09", sequence: 10, scopeHint: "insulation, drywall, ceilings, flooring, paint, tile" },
  { name: "Specialties / Equipment / Furnishings", csiDivision: "10-12", sequence: 11, scopeHint: "toilet accessories, signage, appliances, casework, furnishings" },
];

export const TAXONOMY_PROMPT_LIST = TRADE_TAXONOMY.map(
  (t) => `- ${t.name} (Div ${t.csiDivision}): ${t.scopeHint}`
).join("\n");

export function sequenceForTrade(tradeName: string): number {
  const exact = TRADE_TAXONOMY.find(
    (t) => t.name.toLowerCase() === tradeName.toLowerCase()
  );
  if (exact) return exact.sequence;

  // Fall back to a loose substring match since the model may return a
  // close-but-not-identical trade name.
  const fuzzy = TRADE_TAXONOMY.find(
    (t) =>
      tradeName.toLowerCase().includes(t.name.toLowerCase().split(" ")[0].toLowerCase()) ||
      t.name.toLowerCase().includes(tradeName.toLowerCase())
  );
  return fuzzy ? fuzzy.sequence : 99;
}
