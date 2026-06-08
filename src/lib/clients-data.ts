export interface Client {
  id: string;
  name: string;
  client360Id: string;
  billingAddress: string;
  state: string;
  city: string;
  status: "active" | "inactive";
}

export interface Contract {
  id: string;
  start: string;
  end: string;
  term: string;
  status: "Active" | "Expired" | "Draft";
  source: string;
  basePricing: string;
  monthlyValue: string;
}

export interface OperationalUnit {
  id: string;
  name: string;
  region: string;
  skuCount: number;
  pricingOverride: { label: string; tone: "amber" | "emerald" | "neutral" };
  products: { name: string; model: string; basePrice: string; adjusted: string }[];
}

export const clients: Client[] = [
  { id: "aramex", name: "Aramex", client360Id: "CRI00203", billingAddress: "731 Main Street, Suite 110", state: "Alaska", city: "Phoenix", status: "active" },
  { id: "ashwini", name: "ashwini", client360Id: "CRI100", billingAddress: "731 Main Street, Suite 110", state: "AZ", city: "Phoenix", status: "active" },
  { id: "priti", name: "priti", client360Id: "CRI200", billingAddress: "731 Main Street, Suite 110", state: "California", city: "Phoenix", status: "active" },
  { id: "drp2301", name: "DRP2301", client360Id: "CRI2301", billingAddress: "731 Main Street, Suite 110", state: "California", city: "Phoenix", status: "active" },
  { id: "drp2302", name: "DRP2302", client360Id: "CRI2302", billingAddress: "731 Main Street, Suite 110", state: "AZ", city: "Phoenix", status: "active" },
  { id: "drp2303", name: "DRP2303", client360Id: "CRI2303", billingAddress: "731 Main Street, Suite 110", state: "AZ", city: "Phoenix", status: "active" },
  { id: "drp2304", name: "DRP2304", client360Id: "CRI2304", billingAddress: "412 Oak Avenue", state: "TX", city: "Austin", status: "inactive" },
];

export const contractsByClient: Record<string, Contract[]> = {
  aramex: [
    { id: "CONT-2024-0012", start: "Jan 01, 2024", end: "Dec 31, 2024", term: "12 Months", status: "Active", source: "Direct Sales", basePricing: "Premium Global Tier", monthlyValue: "$1,200/mo" },
    { id: "CONT-2023-0884", start: "Jan 01, 2023", end: "Dec 31, 2023", term: "12 Months", status: "Expired", source: "Partner Referral", basePricing: "Standard Tier", monthlyValue: "$950/mo" },
    { id: "CONT-2022-0455", start: "Jan 01, 2022", end: "Dec 31, 2022", term: "12 Months", status: "Expired", source: "Direct Sales", basePricing: "Standard Tier", monthlyValue: "$800/mo" },
    { id: "CONT-2025-0001", start: "Jan 01, 2025", end: "Dec 31, 2025", term: "12 Months", status: "Draft", source: "Renewal", basePricing: "Premium Global Tier", monthlyValue: "$1,350/mo" },
  ],
};

export const operationalUnitsByClient: Record<string, OperationalUnit[]> = {
  aramex: [
    {
      id: "OU-7721",
      name: "West Coast Fulfillment",
      region: "Pacific (CA, WA)",
      skuCount: 12,
      pricingOverride: { label: "Tier 2 Applied", tone: "amber" },
      products: [
        { name: "Last-Mile Delivery Pro", model: "Per Transaction", basePrice: "$4.50", adjusted: "$4.25" },
        { name: "Warehouse Management", model: "Monthly Seat", basePrice: "$120.00", adjusted: "$110.00" },
        { name: "Real-time Tracking API", model: "Per 1K Calls", basePrice: "$0.80", adjusted: "$0.72" },
      ],
    },
    {
      id: "OU-8842",
      name: "Texas Distribution Hub",
      region: "Central (TX)",
      skuCount: 8,
      pricingOverride: { label: "Standard Base", tone: "neutral" },
      products: [
        { name: "Freight Core SaaS", model: "Monthly", basePrice: "$2,400.00", adjusted: "$2,400.00" },
        { name: "Custom Labeling Module", model: "Per Label", basePrice: "$0.05", adjusted: "$0.05" },
      ],
    },
    {
      id: "OU-9902",
      name: "Tri-State Courier Net",
      region: "Northeast (NY, NJ)",
      skuCount: 22,
      pricingOverride: { label: "Volume Discount", tone: "emerald" },
      products: [
        { name: "Last-Mile Delivery Pro", model: "Per Transaction", basePrice: "$4.50", adjusted: "$3.80" },
        { name: "Real-time Tracking API", model: "Per 1K Calls", basePrice: "$0.80", adjusted: "$0.55" },
      ],
    },
  ],
};

export const getClient = (id: string) => clients.find((c) => c.id === id);
