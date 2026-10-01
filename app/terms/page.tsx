import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/legal-page";

export const metadata: Metadata = { title: "Terms of service | Foyer" };

export default function TermsPage() {
  return <LegalPage label="Terms of service" title="Use Foyer with care." intro="These terms set the basic rules for using Foyer, creating rooms, and taking part in live conversation." sections={[
    { heading: "Using Foyer", paragraphs: ["You must use Foyer lawfully and provide accurate account information. Keep your account secure and do not share access with anyone else.", "Foyer is for live conversation. You are responsible for what you post, say, stream, or share in a room."] },
    { heading: "Room rules and moderation", paragraphs: ["Room owners and moderators may set rules, remove messages, mute, remove, or ban participants. Their rules apply in addition to these terms.", "We may restrict or remove content, rooms, or accounts that breach these terms or put people at risk."], items: ["Do not harass, threaten, impersonate, or exploit others.", "Do not share private information without clear permission.", "Do not use Foyer for unlawful, harmful, or deceptive activity.", "Do not record or redistribute a conversation without permission from everyone required by law."] },
    { heading: "Your content", paragraphs: ["You keep ownership of content you create. You give Foyer permission to host, process, and display it only as needed to operate the service.", "Do not upload or share content you do not have the right to use."] },
    { heading: "Service availability", paragraphs: ["Foyer may change, pause, or discontinue features. We work to keep rooms available, but cannot guarantee uninterrupted or error-free service.", "To the extent allowed by law, Foyer is provided as is and our liability is limited to the amount you paid us for the service in the 12 months before a claim."] },
    { heading: "Changes", paragraphs: ["We may update these terms when the service or legal requirements change. Continued use after an update means you accept the revised terms."] },
  ]} />;
}
