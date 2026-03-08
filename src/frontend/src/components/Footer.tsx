import { useSiteSettings } from "../hooks/useQueries";

export function Footer() {
  const year = new Date().getFullYear();
  const { data: siteSettings } = useSiteSettings();

  const siteName = siteSettings?.siteName ?? "Regent Shop";
  const tagline =
    siteSettings?.footerTagline ?? "Timeless Style, Effortlessly Yours";

  return (
    <footer className="border-t border-border bg-background mt-auto">
      <div className="container mx-auto px-4 md:px-8 py-10 md:py-14">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <p className="font-display text-lg tracking-[0.1em] uppercase text-foreground">
              {siteName}
            </p>
            <p className="font-sans text-xs tracking-widest text-muted-foreground mt-1 uppercase">
              {tagline}
            </p>
          </div>
          <div className="flex flex-col items-start md:items-end gap-1">
            <p className="font-sans text-xs text-muted-foreground">
              © {year} {siteName}. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
