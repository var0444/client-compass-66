export interface Client {
  id: string;
  name: string;
  client360Id: string;
  billingAddress: string;
  state: string;
  city: string;
  zipCode: string;
  status: "active" | "inactive";
  segment: string;
  owner: string;
}

export interface BillingArrangement {
  id: string;
  name: string;
  billingModel: string;
  status: "Active" | "Inactive";
  effectiveFrom: string;
  effectiveTo: string;
  contractIds: string[];
  unitsLinked: number;
}

export interface Contract {
  id: string;
  billingArrangementId: string;
  start: string;
  end: string;
  term: string;
  status: "Active" | "Expired" | "Draft";
  source: string;
  basePricing: string;
  monthlyValue: string;
  unitsLinked: number;
}

export interface ProductPrice {
  name: string;
  model: string;
  basePrice: string;
  adjusted: string;
}

export interface CagAssociation {
  id: string;
  carrier: string;
  account: string;
  group: string;
  effectiveFrom: string;
  effectiveTo: string;
  status: "Active" | "Inactive";
}

export interface OperationalUnit {
  id: string;
  name: string;
  region: string;
  skuCount: number;
  billingArrangementId: string;
  effectiveFrom: string;
  effectiveTo: string;
  status: "Active" | "Inactive";
  pricingOverride: { label: string; tone: "amber" | "emerald" | "neutral" };
  products: ProductPrice[];
  cags: CagAssociation[];
}

export const clients: Client[] = [
  { id: "aramex", name: "Aramex", client360Id: "CRI00203", billingAddress: "731 Main Street, Suite 110", state: "Alaska", city: "Phoenix", zipCode: "85001", status: "active", segment: "Enterprise", owner: "M. Chen" },
  { id: "ashwini", name: "Ashwini Logistics", client360Id: "CRI100", billingAddress: "731 Main Street, Suite 110", state: "AZ", city: "Phoenix", zipCode: "85002", status: "active", segment: "Mid-Market", owner: "R. Patel" },
  { id: "priti", name: "Priti Couriers", client360Id: "CRI200", billingAddress: "731 Main Street, Suite 110", state: "California", city: "Phoenix", zipCode: "94101", status: "active", segment: "SMB", owner: "L. Garcia" },
  { id: "drp2301", name: "DRP2301", client360Id: "CRI2301", billingAddress: "731 Main Street, Suite 110", state: "California", city: "Phoenix", zipCode: "94102", status: "active", segment: "Enterprise", owner: "M. Chen" },
  { id: "drp2302", name: "DRP2302", client360Id: "CRI2302", billingAddress: "731 Main Street, Suite 110", state: "AZ", city: "Phoenix", zipCode: "85003", status: "active", segment: "Mid-Market", owner: "S. Kim" },
  { id: "drp2303", name: "DRP2303", client360Id: "CRI2303", billingAddress: "731 Main Street, Suite 110", state: "AZ", city: "Phoenix", zipCode: "85004", status: "active", segment: "Mid-Market", owner: "S. Kim" },
  { id: "drp2304", name: "DRP2304", client360Id: "CRI2304", billingAddress: "412 Oak Avenue", state: "TX", city: "Austin", zipCode: "73301", status: "inactive", segment: "SMB", owner: "L. Garcia" },
];

export const contractsByClient: Record<string, Contract[]> = {
  aramex: [
    { id: "CONT-2024-0012", billingArrangementId: "BA-ARX-001", start: "Jan 01, 2024", end: "Dec 31, 2024", term: "12 Months", status: "Active", source: "Direct Sales", basePricing: "Premium Global Tier", monthlyValue: "$1,200/mo", unitsLinked: 3 },
    { id: "CONT-2023-0884", billingArrangementId: "BA-ARX-001", start: "Jan 01, 2023", end: "Dec 31, 2023", term: "12 Months", status: "Expired", source: "Partner Referral", basePricing: "Standard Tier", monthlyValue: "$950/mo", unitsLinked: 2 },
    { id: "CONT-2022-0455", billingArrangementId: "BA-ARX-001", start: "Jan 01, 2022", end: "Dec 31, 2022", term: "12 Months", status: "Expired", source: "Direct Sales", basePricing: "Standard Tier", monthlyValue: "$800/mo", unitsLinked: 1 },
    { id: "CONT-2025-0001", billingArrangementId: "BA-ARX-001", start: "Jan 01, 2025", end: "Dec 31, 2025", term: "12 Months", status: "Draft", source: "Renewal", basePricing: "Premium Global Tier", monthlyValue: "$1,350/mo", unitsLinked: 0 },
  ],
};

export const billingArrangementsByClient: Record<string, BillingArrangement[]> = {
  aramex: [
    { id: "BA-ARX-001", name: "Aramex Enterprise Billing", billingModel: "Consolidated monthly", status: "Active", effectiveFrom: "Jan 01, 2022", effectiveTo: "Dec 31, 2025", contractIds: ["CONT-2024-0012", "CONT-2023-0884", "CONT-2022-0455", "CONT-2025-0001"], unitsLinked: 3 },
    { id: "BA-ARX-002", name: "Aramex Pilot Services", billingModel: "Usage-based", status: "Inactive", effectiveFrom: "Jan 01, 2023", effectiveTo: "Dec 31, 2023", contractIds: [], unitsLinked: 0 },
  ],
};

const sampleCags: CagAssociation[] = [
  { id: "CAG-001", carrier: "FedEx", account: "ACC-77821", group: "Domestic Ground", effectiveFrom: "Jan 01, 2024", effectiveTo: "Dec 31, 2024", status: "Active" },
  { id: "CAG-002", carrier: "UPS", account: "ACC-43219", group: "International Air", effectiveFrom: "Mar 15, 2024", effectiveTo: "Dec 31, 2025", status: "Active" },
];

export const operationalUnitsByClient: Record<string, OperationalUnit[]> = {
  aramex: [
    {
      id: "OU-7721",
      name: "West Coast Fulfillment",
      region: "Pacific (CA, WA)",
      skuCount: 12,
      billingArrangementId: "BA-ARX-001",
      effectiveFrom: "Jan 01, 2024",
      effectiveTo: "Dec 31, 2024",
      status: "Active",
      pricingOverride: { label: "Tier 2 Override", tone: "amber" },
      products: [
        { name: "Last-Mile Delivery Pro", model: "Per Transaction", basePrice: "$4.50", adjusted: "$4.25" },
        { name: "Warehouse Management", model: "Monthly Seat", basePrice: "$120.00", adjusted: "$110.00" },
        { name: "Real-time Tracking API", model: "Per 1K Calls", basePrice: "$0.80", adjusted: "$0.72" },
      ],
      cags: sampleCags,
    },
    {
      id: "OU-8842",
      name: "Texas Distribution Hub",
      region: "Central (TX)",
      skuCount: 8,
      billingArrangementId: "BA-ARX-001",
      effectiveFrom: "Feb 01, 2024",
      effectiveTo: "Dec 31, 2024",
      status: "Active",
      pricingOverride: { label: "Standard Base", tone: "neutral" },
      products: [
        { name: "Freight Core SaaS", model: "Monthly", basePrice: "$2,400.00", adjusted: "$2,400.00" },
        { name: "Custom Labeling Module", model: "Per Label", basePrice: "$0.05", adjusted: "$0.05" },
      ],
      cags: [sampleCags[0]],
    },
    {
      id: "OU-9902",
      name: "Tri-State Courier Net",
      region: "Northeast (NY, NJ)",
      skuCount: 22,
      billingArrangementId: "BA-ARX-001",
      effectiveFrom: "Apr 01, 2024",
      effectiveTo: "Dec 31, 2024",
      status: "Active",
      pricingOverride: { label: "Volume Discount", tone: "emerald" },
      products: [
        { name: "Last-Mile Delivery Pro", model: "Per Transaction", basePrice: "$4.50", adjusted: "$3.80" },
        { name: "Real-time Tracking API", model: "Per 1K Calls", basePrice: "$0.80", adjusted: "$0.55" },
      ],
      cags: sampleCags,
    },
  ],
};

export const getClient = (id: string) => clients.find((c) => c.id === id);

export const dashboardMetrics = {
  monthlyRevenue: [
    { month: "Jul", value: 42000 },
    { month: "Aug", value: 47500 },
    { month: "Sep", value: 51200 },
    { month: "Oct", value: 48900 },
    { month: "Nov", value: 56400 },
    { month: "Dec", value: 61200 },
  ],
  jobOps: [
    { day: "Mon", completed: 320, failed: 12 },
    { day: "Tue", completed: 410, failed: 8 },
    { day: "Wed", completed: 380, failed: 15 },
    { day: "Thu", completed: 460, failed: 6 },
    { day: "Fri", completed: 520, failed: 11 },
    { day: "Sat", completed: 290, failed: 4 },
    { day: "Sun", completed: 180, failed: 2 },
  ],
};
