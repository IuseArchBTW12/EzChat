import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/legal-page";

export const metadata: Metadata = { title: "Cookie policy | Foyer" };

export default function CookiesPage() {
  return <LegalPage label="Cookie policy" title="Cookies that keep rooms working." intro="Foyer uses essential browser storage to keep your session secure and remember service preferences." sections={[
    { heading: "Essential cookies", paragraphs: ["Our authentication provider uses cookies and similar storage to sign you in, maintain your session, protect against fraud, and keep the service secure. These are necessary for account features to work."] },
    { heading: "Preferences", paragraphs: ["Foyer may store preferences such as your selected appearance or device choices on your device so the site works consistently when you return."] },
    { heading: "Managing cookies", paragraphs: ["You can clear or block cookies in your browser settings. Blocking essential cookies can stop sign-in and room features from working correctly."] },
    { heading: "Changes", paragraphs: ["We will update this page if the cookies or storage technologies used by Foyer materially change."] },
  ]} />;
}
