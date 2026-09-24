# Pricing model update

## Goal
Replace the contract-oriented pricing summary with a product-first view that shows global prices and every OU or CAG override.

## Changes
- Remove the **Contract Base** and **Net Savings** cards from Pricing Models.
- Rename the view around **Global Pricing** rather than contract pricing.
- Show a complete product catalog, including products that are not currently assigned to every OU.
- Keep each product’s global price visible as the reference price.
- Show OU overrides and CAG overrides in the same pricing matrix, clearly distinguishing inherited prices from overridden prices.
- Add compact summary counts for global products, OU overrides, and CAG overrides.
- Add example CAG-level override data to the existing demo dataset so those override states are visible.
- Update related wording in the OU pricing area from “contract base” to “global price.”

## Interaction and layout
- Preserve the existing Optum theme, navigation, tabs, and overall page structure.
- Use a horizontally scrollable comparison table for all products and override scopes.
- Display override amount and percentage difference where a scope differs from global pricing.
- Show inherited or unavailable states explicitly to avoid blank or ambiguous cells.

## Technical details
- Extend CAG data with optional per-product pricing overrides.
- Build the global product list from master product data, then join OU and CAG override data by product name.
- Keep this as frontend demo data; no persistence or backend changes.
- Add complete route metadata for the Client Configuration page.

## Verification
- Confirm both global and override prices render for all products.
- Confirm Contract Base and Net Savings no longer appear.
- Check the Pricing Models tab at desktop and the current compact viewport.
- Confirm the project preview builds without errors.
