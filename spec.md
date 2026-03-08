# Regent Shop

## Current State
Full e-commerce site with Motoko backend and React frontend. Admin panel at `/admin` has:
- Products tab: add/edit/delete products
- Orders tab: view and update order status
- Stripe Config tab: set Stripe secret key

The homepage (ShopPage) has a hardcoded hero section with title "Timeless Style, Effortlessly Yours", subtitle "New Collection", and a "Shop Now" CTA.

## Requested Changes (Diff)

### Add
- Backend: `SiteSettings` type with fields: `heroTitle`, `heroSubtitle`, `heroTagline`, `shopSectionTitle`, `footerTagline`, `siteName`
- Backend: `getSiteSettings` (public query, no auth required) and `updateSiteSettings` (admin-only update)
- Admin panel: new "Site Settings" tab with editable fields for all site content listed above
- ShopPage: reads site settings from backend and uses them for hero text; falls back to defaults if not set
- Footer: reads `footerTagline` from site settings
- Navbar: reads `siteName` from site settings

### Modify
- `main.mo`: add `SiteSettings` storage, `getSiteSettings`, and `updateSiteSettings` functions
- `AdminPage.tsx`: add `SiteSettings` tab as fourth tab
- `ShopPage.tsx`: use dynamic hero text from backend
- `Footer.tsx`: use dynamic footer tagline
- `Navbar.tsx`: use dynamic site name
- `useQueries.ts`: add `useSiteSettings` and `useUpdateSiteSettings` hooks
- `backend.d.ts`: updated automatically from backend generation

### Remove
- Nothing removed

## Implementation Plan
1. Regenerate backend with `SiteSettings` model and admin-editable settings
2. Add `SiteSettingsTab` component in `AdminPage.tsx` with form fields for all settings
3. Add `useSiteSettings` query hook and `useUpdateSiteSettings` mutation to `useQueries.ts`
4. Update `ShopPage.tsx` hero section to use dynamic text from `useSiteSettings`
5. Update `Footer.tsx` and `Navbar.tsx` to consume site name and tagline from settings
6. Validate and deploy
