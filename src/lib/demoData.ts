// Canned example output, shaped like a real submit_takeoff response, so the
// UI can be reviewed without calling the Anthropic API. Based on a sample
// "Maple Street Office Build-Out" tenant improvement spec.
import type { AnalysisResult } from "@/types/analysis";

export const DEMO_RESULT: AnalysisResult = {
  project_summary:
    "2,400 SF interior tenant improvement (Suite 200) inside an existing single-story building on a concrete slab-on-grade. Scope covers new partition walls, finishes, a break room, minor plumbing/HVAC rework, and electrical/lighting upgrades — no structural or building-shell work.",
  trades: [
    {
      trade_name: "Wood Framing / Carpentry",
      csi_division: "06",
      subcontractor_needed: true,
      scope_items: [
        {
          description: "New interior partition walls, 2x4 wood stud @ 16\" O.C., 9'-0\" AFF, gypsum board both sides",
          location: "Throughout suite",
          quantity: 180,
          unit: "LF",
          materials: ["2x4 wood stud", "5/8\" Type X gypsum board"],
          spec_reference: "Div 06 narrative",
        },
      ],
      notes: "Wall height and stud spacing are explicit; verify with structural/ceiling grid before ordering.",
    },
    {
      trade_name: "Doors, Windows & Glazing",
      csi_division: "08",
      subcontractor_needed: true,
      scope_items: [
        {
          description: "Solid core wood door, single, lever hardware, keyed",
          location: "Various — per schedule",
          quantity: 6,
          unit: "EA",
          materials: ["Solid core wood door", "3'-0\" x 7'-0\"", "Lever hardware, keyed"],
          spec_reference: "Sheet A-2 door schedule, mark D1",
        },
        {
          description: "Glass storefront door, single, push/pull with closer",
          location: "Suite entry",
          quantity: 1,
          unit: "EA",
          materials: ["Glass storefront door", "3'-0\" x 7'-0\"", "Push/pull, door closer"],
          spec_reference: "Sheet A-2 door schedule, mark D2",
        },
      ],
      notes: null,
    },
    {
      trade_name: "Plumbing",
      csi_division: "22",
      subcontractor_needed: true,
      scope_items: [
        {
          description: "New break room sink, tie into existing waste/vent stack in adjacent wall",
          location: "Break room",
          quantity: 1,
          unit: "EA",
          materials: ["Break room sink"],
          spec_reference: "Div 22 narrative",
        },
        {
          description: "Relocate existing restroom toilet 3 feet per plan",
          location: "Restroom — Sheet P-1, Detail 3",
          quantity: 1,
          unit: "EA",
          materials: [],
          spec_reference: "Sheet P-1, Detail 3",
        },
      ],
      notes: "Confirm existing stack location and capacity can support the added fixture before bidding.",
    },
    {
      trade_name: "HVAC / Mechanical",
      csi_division: "23",
      subcontractor_needed: true,
      scope_items: [
        {
          description: "Extend existing ductwork to serve 3 new offices",
          location: "New offices",
          quantity: null,
          unit: null,
          materials: [],
          spec_reference: "Div 23 narrative",
        },
        {
          description: "New VAV box with thermostat",
          location: "New offices",
          quantity: 4,
          unit: "EA",
          materials: ["VAV box", "Thermostat"],
          spec_reference: "Sheet M-1",
        },
      ],
      notes: "Duct extension length/routing not dimensioned in narrative — needs Sheet M-1 takeoff for an accurate linear footage.",
    },
    {
      trade_name: "Electrical",
      csi_division: "26",
      subcontractor_needed: true,
      scope_items: [
        {
          description: "New 20A circuit for break room appliance",
          location: "Break room",
          quantity: 2,
          unit: "EA",
          materials: ["20A circuit"],
          spec_reference: "Div 26 narrative",
        },
        {
          description: "New/relocated duplex receptacle",
          location: "Throughout suite, per plan",
          quantity: 12,
          unit: "EA",
          materials: ["Duplex receptacle"],
          spec_reference: "Div 26 narrative",
        },
        {
          description: "LED 2x4 troffer light fixture on occupancy sensor",
          location: "Open office area",
          quantity: 18,
          unit: "EA",
          materials: ["LED 2x4 troffer", "Occupancy sensor"],
          spec_reference: "Div 26 narrative",
        },
        {
          description: "Empty conduit and J-boxes for data/comm rough-in only (cabling by Owner's vendor, not this scope)",
          location: "Throughout suite",
          quantity: null,
          unit: null,
          materials: ["Conduit", "J-boxes"],
          spec_reference: "Div 26 narrative",
        },
      ],
      notes: "Data/comm cabling explicitly excluded — GC provides empty conduit/boxes only; Owner's vendor pulls cable (Div 27).",
    },
    {
      trade_name: "Insulation / Drywall / Finishes",
      csi_division: "09",
      subcontractor_needed: true,
      scope_items: [
        {
          description: "Paint new gypsum board walls, 2 coats eggshell",
          location: "All new partition walls",
          quantity: null,
          unit: null,
          materials: ["Eggshell paint"],
          spec_reference: "Div 09 narrative",
        },
        {
          description: "Carpet tile flooring",
          location: "Open office area",
          quantity: 1600,
          unit: "SF",
          materials: ["Carpet tile"],
          spec_reference: "Div 09 narrative",
        },
        {
          description: "LVT flooring",
          location: "Break room and corridor",
          quantity: 400,
          unit: "SF",
          materials: ["LVT"],
          spec_reference: "Div 09 narrative",
        },
      ],
      notes: "See flag: Room 104 finish conflicts between the narrative and the room finish schedule — confirm before ordering flooring.",
    },
  ],
  coordination: [
    { trade: "Wood Framing / Carpentry", depends_on: [], provides_to: ["Plumbing", "HVAC / Mechanical", "Electrical"], notes: "Partition framing must be up before trades can rough-in through/along the new walls." },
    { trade: "Plumbing", depends_on: ["Wood Framing / Carpentry"], provides_to: ["Insulation / Drywall / Finishes"], notes: "Rough-in and relocated fixture must be roughed in and inspected before walls are closed." },
    { trade: "HVAC / Mechanical", depends_on: ["Wood Framing / Carpentry"], provides_to: ["Insulation / Drywall / Finishes"], notes: "Duct extension and VAV box rough-in must be complete before ceiling/wall finishes close it in." },
    { trade: "Electrical", depends_on: ["Wood Framing / Carpentry"], provides_to: ["Insulation / Drywall / Finishes"], notes: "Device and fixture rough-in, plus low-voltage conduit/boxes, must be inspected before drywall closes walls." },
    { trade: "Insulation / Drywall / Finishes", depends_on: ["Plumbing", "HVAC / Mechanical", "Electrical"], provides_to: ["Doors, Windows & Glazing"], notes: "Paint and flooring should follow drywall to avoid rework; door/frame install typically follows finish walls." },
    { trade: "Doors, Windows & Glazing", depends_on: ["Insulation / Drywall / Finishes"], provides_to: [], notes: null },
  ],
  flags: [
    {
      severity: "missing_info",
      message: "Duct extension routing/length for the 3 new offices isn't dimensioned in the narrative — needs a takeoff from Sheet M-1 for an accurate linear footage.",
      related_trade: "HVAC / Mechanical",
    },
    {
      severity: "warning",
      message: "Room 104 finish conflict: the room finish schedule on Sheet A-1 lists carpet tile, but the finish narrative describes the corridor (which may or may not include Room 104) as LVT. Confirm which applies before ordering material.",
      related_trade: "Insulation / Drywall / Finishes",
    },
    {
      severity: "info",
      message: "Fire alarm scope is not shown on these sheets and must be coordinated separately with the base building fire alarm contractor.",
      related_trade: null,
    },
  ],
};
