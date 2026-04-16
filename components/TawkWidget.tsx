"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Tawk.to live chat widget.
 *
 * Loads Tawk.to's embed script once on first mount. On every subsequent
 * route change it toggles the widget's visibility based on pathname:
 *
 *   Visible  — landing page, marketing pages, auth pages
 *              (i.e. anyone not yet signed in — the people a livechat
 *              bubble is actually designed to help)
 *
 *   Hidden   — /dashboard/** and /admin/**
 *              (logged-in users have /dashboard/support for real tickets
 *              and admins work through /admin/support. A chat bubble on
 *              top of those would be redundant and visually noisy.)
 *
 * The widget itself renders outside React's DOM tree (Tawk.to injects
 * its own fixed-position element), so this component returns null.
 */
const PROPERTY_ID = process.env.NEXT_PUBLIC_TAWK_PROPERTY_ID;
const WIDGET_ID = process.env.NEXT_PUBLIC_TAWK_WIDGET_ID;

declare global {
  interface Window {
    Tawk_API?: {
      hideWidget?: () => void;
      showWidget?: () => void;
      onLoad?: () => void;
      [key: string]: unknown;
    };
    Tawk_LoadStart?: Date;
  }
}

export default function TawkWidget() {
  const pathname = usePathname();

  // Hide on logged-in surfaces (users have in-app support there already).
  const shouldHide =
    pathname?.startsWith("/dashboard") || pathname?.startsWith("/admin");

  // ── Load the Tawk.to embed script once per page lifetime ──
  // De-duped via a DOM check so a Fast Refresh or re-mount doesn't
  // inject the script twice.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!PROPERTY_ID || !WIDGET_ID) return;
    if (document.getElementById("tawk-script")) return;

    window.Tawk_API = window.Tawk_API || {};
    window.Tawk_LoadStart = new Date();

    const script = document.createElement("script");
    script.id = "tawk-script";
    script.async = true;
    script.src = `https://embed.tawk.to/${PROPERTY_ID}/${WIDGET_ID}`;
    script.charset = "UTF-8";
    script.setAttribute("crossorigin", "*");
    document.body.appendChild(script);
  }, []);

  // ── Toggle visibility when pathname changes ──
  // The widget's hide/show methods may not exist yet on first render
  // (the embed script is still loading), so we register an onLoad
  // callback as a fallback.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!window.Tawk_API) return;

    const apply = () => {
      if (shouldHide) {
        window.Tawk_API?.hideWidget?.();
      } else {
        window.Tawk_API?.showWidget?.();
      }
    };

    if (typeof window.Tawk_API.hideWidget === "function") {
      apply();
    } else {
      window.Tawk_API.onLoad = apply;
    }
  }, [shouldHide]);

  return null;
}
