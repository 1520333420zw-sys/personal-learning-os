"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { navigationItems, type NavigationItem } from "@/config/navigation";
import type { Dictionary } from "@/i18n";
import type { Locale } from "@/i18n/config";
import { cn } from "@/lib/cn";

import { NavigationIcon } from "./navigation-icon";

interface AppNavigationProps {
  locale: Locale;
  dictionary: Dictionary;
}

function localizedHref(locale: Locale, href: string) {
  return "/" + locale + href;
}

function isCurrentPath(pathname: string, locale: Locale, item: NavigationItem) {
  const href = localizedHref(locale, item.href);
  return item.href === "" ? pathname === href || pathname === href + "/" : pathname.startsWith(href);
}

export function AppNavigation({ locale, dictionary }: AppNavigationProps) {
  const pathname = usePathname();
  const mainItems = navigationItems.filter((item) => item.group === "main");
  const lifeItems = navigationItems.filter((item) => item.group === "life");
  const mobileItems = navigationItems.filter((item) => item.mobilePrimary);
  const moreItems = navigationItems.filter((item) => !item.mobilePrimary);
  const nextLocale = locale === "zh-CN" ? "en" : "zh-CN";
  const localeHref = pathname.replace(/^\/(zh-CN|en)(?=\/|$)/, "/" + nextLocale);

  const renderSidebarLink = (item: NavigationItem) => {
    const active = isCurrentPath(pathname, locale, item);
    return (
      <Link
        key={item.id}
        href={localizedHref(locale, item.href)}
        aria-current={active ? "page" : undefined}
        title={dictionary.navigation[item.labelKey]}
        className={cn(
          "group flex min-h-11 items-center gap-3 rounded-md px-3 text-sm font-medium text-secondary transition-colors duration-[var(--duration-fast)] hover:bg-surface-muted hover:text-primary",
          "tablet:justify-center desktop:justify-start",
          active && "bg-accent-soft text-primary",
        )}
      >
        <NavigationIcon name={item.icon} className="shrink-0" />
        <span className="tablet:sr-only desktop:not-sr-only">
          {dictionary.navigation[item.labelKey]}
        </span>
      </Link>
    );
  };

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[5.5rem] flex-col border-r border-border bg-surface/95 px-3 py-6 tablet:flex desktop:w-64 desktop:px-5">
        <Link
          href={"/" + locale}
          className="flex min-h-12 items-center rounded-md px-2 text-primary tablet:justify-center desktop:justify-start"
        >
          <span className="type-h3 tablet:hidden desktop:inline">{dictionary.brand.name}</span>
          <span className="type-label hidden tablet:inline desktop:hidden">{dictionary.brand.shortName}</span>
        </Link>

        <nav aria-label={dictionary.common.primaryNavigation} className="mt-8 grid gap-1">
          {mainItems.map(renderSidebarLink)}
        </nav>

        <div className="mt-auto">
          <p className="type-caption mb-2 hidden px-3 uppercase tracking-[0.12em] text-muted desktop:block">
            Life
          </p>
          <nav aria-label={dictionary.common.lifeNavigation} className="grid gap-1">
            {lifeItems.map(renderSidebarLink)}
          </nav>
          <Link
            href={localeHref}
            hrefLang={nextLocale}
            className="mt-4 flex min-h-11 items-center justify-center rounded-md border border-border text-xs font-medium text-secondary hover:bg-surface-muted desktop:px-3"
          >
            <span className="desktop:hidden">{nextLocale === "en" ? "EN" : "中"}</span>
            <span className="hidden desktop:inline">{dictionary.common.switchLanguage}</span>
          </Link>
        </div>
      </aside>

      <header className="sticky top-0 z-20 flex min-h-16 items-center justify-between border-b border-border bg-canvas/95 px-4 backdrop-blur-sm tablet:hidden">
        <Link href={"/" + locale} className="type-label rounded-sm text-primary">
          {dictionary.brand.name}
        </Link>
        <Link
          href={localeHref}
          hrefLang={nextLocale}
          className="flex min-h-11 min-w-11 items-center justify-center rounded-md text-sm font-medium text-secondary hover:bg-surface-muted"
        >
          {nextLocale === "en" ? "EN" : "中"}
          <span className="sr-only">{dictionary.common.switchLanguage}</span>
        </Link>
      </header>

      <nav
        aria-label={dictionary.common.mobileNavigation}
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/98 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-8px_30px_rgb(45_40_32/0.05)] tablet:hidden"
      >
        <div className="mx-auto grid max-w-lg grid-cols-5 gap-1">
          {mobileItems.map((item) => {
            const active = isCurrentPath(pathname, locale, item);
            return (
              <Link
                key={item.id}
                href={localizedHref(locale, item.href)}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-12 flex-col items-center justify-center gap-1 rounded-md px-1 text-[0.6875rem] font-medium text-muted hover:bg-surface-muted hover:text-primary",
                  active && "bg-accent-soft text-primary",
                )}
              >
                <NavigationIcon name={item.icon} />
                <span className="max-w-full truncate">{dictionary.navigation[item.labelKey]}</span>
              </Link>
            );
          })}

          <details className="group relative">
            <summary className="flex min-h-12 cursor-pointer list-none flex-col items-center justify-center gap-1 rounded-md px-1 text-[0.6875rem] font-medium text-muted hover:bg-surface-muted hover:text-primary">
              <NavigationIcon name="more" />
              <span>{dictionary.common.more}</span>
            </summary>
            <div className="fixed inset-x-3 bottom-[5.25rem] max-h-[65vh] overflow-y-auto rounded-xl border border-border bg-surface p-3 shadow-card">
              <div className="mb-2 flex items-center justify-between px-2">
                <p className="type-label text-primary">{dictionary.common.more}</p>
                <span className="type-caption text-muted">{dictionary.common.close}</span>
              </div>
              <div className="grid grid-cols-2 gap-1">
                {moreItems.map((item) => {
                  const active = isCurrentPath(pathname, locale, item);
                  return (
                    <Link
                      key={item.id}
                      href={localizedHref(locale, item.href)}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex min-h-12 items-center gap-3 rounded-md px-3 text-sm font-medium text-secondary hover:bg-surface-muted",
                        active && "bg-accent-soft text-primary",
                      )}
                    >
                      <NavigationIcon name={item.icon} />
                      {dictionary.navigation[item.labelKey]}
                    </Link>
                  );
                })}
              </div>
            </div>
          </details>
        </div>
      </nav>
    </>
  );
}
