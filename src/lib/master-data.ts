export interface Carrier {
  id: string;
  name: string;
  claimBillStartDate: string;
  suppressRejectedClaims: boolean;
  suppressNet: boolean;
  claimIndicator: "Y" | "N";
  suppressHistoricClaims: boolean;
  claimPricingType: "Contract" | "Standard" | "Custom";
  internalBillingIndicator: "Y" | "N";
  migrationIndicator: "Migrated" | "Pending" | "N/A";
  sourceSystem: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  uom: string;
  basePrice: string;
  status: "Active" | "Inactive";
  lastUpdated: string;
  description: string;
}

export interface PricingModel {
  id: string;
  name: string;
  type: "Per Transaction" | "Subscription" | "Tiered" | "Per Unit";
  basis: string;
  rate: string;
  effectiveFrom: string;
  status: "Active" | "Draft" | "Inactive";
  appliesTo: string;
}

export const carriers: Carrier[] = [
  { id: "CARR-001", name: "FedEx", claimBillStartDate: "Jan 01, 2023", suppressRejectedClaims: true, suppressNet: false, claimIndicator: "Y", suppressHistoricClaims: false, claimPricingType: "Contract", internalBillingIndicator: "Y", migrationIndicator: "Migrated", sourceSystem: "Legacy-CRM" },
  { id: "CARR-002", name: "UPS", claimBillStartDate: "Mar 12, 2022", suppressRejectedClaims: false, suppressNet: true, claimIndicator: "Y", suppressHistoricClaims: true, claimPricingType: "Standard", internalBillingIndicator: "N", migrationIndicator: "Migrated", sourceSystem: "SAP-Bill" },
  { id: "CARR-003", name: "DHL Express", claimBillStartDate: "Jun 01, 2024", suppressRejectedClaims: true, suppressNet: true, claimIndicator: "N", suppressHistoricClaims: false, claimPricingType: "Custom", internalBillingIndicator: "Y", migrationIndicator: "Pending", sourceSystem: "Oracle-Fin" },
  { id: "CARR-004", name: "USPS", claimBillStartDate: "Sep 01, 2021", suppressRejectedClaims: false, suppressNet: false, claimIndicator: "Y", suppressHistoricClaims: false, claimPricingType: "Standard", internalBillingIndicator: "Y", migrationIndicator: "Migrated", sourceSystem: "Legacy-CRM" },
  { id: "CARR-005", name: "OnTrac", claimBillStartDate: "Feb 14, 2025", suppressRejectedClaims: true, suppressNet: false, claimIndicator: "Y", suppressHistoricClaims: true, claimPricingType: "Contract", internalBillingIndicator: "N", migrationIndicator: "N/A", sourceSystem: "Native" },
  { id: "CARR-006", name: "LaserShip", claimBillStartDate: "Nov 21, 2023", suppressRejectedClaims: false, suppressNet: true, claimIndicator: "Y", suppressHistoricClaims: false, claimPricingType: "Custom", internalBillingIndicator: "Y", migrationIndicator: "Migrated", sourceSystem: "SAP-Bill" },
];

export const products: Product[] = [
  { id: "PRD-101", name: "Last-Mile Delivery Pro", category: "Logistics", uom: "Transaction", basePrice: "$4.50", status: "Active", lastUpdated: "May 22, 2025", description: "Per-transaction last-mile delivery routing and tracking." },
  { id: "PRD-102", name: "Warehouse Management", category: "Software", uom: "Seat / Month", basePrice: "$120.00", status: "Active", lastUpdated: "Apr 04, 2025", description: "Cloud WMS with bin-level inventory and labor optimization." },
  { id: "PRD-103", name: "Real-time Tracking API", category: "API", uom: "1K Calls", basePrice: "$0.80", status: "Active", lastUpdated: "May 30, 2025", description: "Geolocation + status webhook stream for parcels." },
  { id: "PRD-104", name: "Freight Core SaaS", category: "Software", uom: "Month", basePrice: "$2,400.00", status: "Active", lastUpdated: "Mar 18, 2025", description: "Freight orchestration platform for LTL and FTL flows." },
  { id: "PRD-105", name: "Custom Labeling Module", category: "Add-on", uom: "Label", basePrice: "$0.05", status: "Active", lastUpdated: "Feb 10, 2025", description: "Brandable label generation with carrier compliance." },
  { id: "PRD-106", name: "Claims Reconciliation", category: "Finance", uom: "Claim", basePrice: "$1.20", status: "Inactive", lastUpdated: "Jan 05, 2025", description: "Automated claims matching against carrier invoices." },
];

export const pricingModels: PricingModel[] = [
  { id: "PM-2001", name: "Premium Global Tier", type: "Subscription", basis: "Monthly Fixed", rate: "$1,200/mo", effectiveFrom: "Jan 01, 2024", status: "Active", appliesTo: "Enterprise" },
  { id: "PM-2002", name: "Standard Tier", type: "Subscription", basis: "Monthly Fixed", rate: "$950/mo", effectiveFrom: "Jan 01, 2023", status: "Active", appliesTo: "Mid-Market" },
  { id: "PM-2003", name: "Volume Discount A", type: "Tiered", basis: "Volume Brackets", rate: "$3.80 / txn ≥10K", effectiveFrom: "Apr 01, 2024", status: "Active", appliesTo: "Last-Mile Delivery Pro" },
  { id: "PM-2004", name: "Per-Call Tracking", type: "Per Transaction", basis: "Per 1K Calls", rate: "$0.55–$0.80", effectiveFrom: "May 01, 2024", status: "Active", appliesTo: "Tracking API" },
  { id: "PM-2005", name: "Pilot SMB Promo", type: "Subscription", basis: "Monthly Fixed", rate: "$299/mo", effectiveFrom: "Jul 01, 2025", status: "Draft", appliesTo: "SMB segment" },
  { id: "PM-2006", name: "Legacy Per-Unit", type: "Per Unit", basis: "Per Label", rate: "$0.05", effectiveFrom: "Jan 01, 2022", status: "Inactive", appliesTo: "Custom Labeling Module" },
];
