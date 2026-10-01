import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/legal-page";

export const metadata: Metadata = { title: "Privacy policy | Foyer" };

export default function PrivacyPage() {
  return <LegalPage label="Privacy policy" title="Your room is not a product." intro="This policy explains what Foyer needs to run live rooms and how that information is used." sections={[
    { heading: "Information we process", paragraphs: ["When you create or use an account, Foyer processes account details supplied through our authentication provider, such as your profile identifier and email address.", "We also process room information, memberships, presence, chat messages, moderation records, and settings you choose to save."] },
    { heading: "Live media", paragraphs: ["Camera, microphone, and screen-share media are used to deliver live calls between participants. Foyer uses signalling needed to establish those calls. We do not intentionally record live media unless a feature clearly tells you otherwise."] },
    { heading: "How we use information", paragraphs: ["We use information to operate rooms, keep accounts secure, provide moderation tools, prevent abuse, and improve reliability.", "We do not sell personal information."] },
    { heading: "Sharing and retention", paragraphs: ["Other participants can see information you choose to share in a room, including your displayed name, messages, and live media. Room owners and moderators can see moderation information needed to manage their room.", "We retain information for as long as needed to operate Foyer, meet legal obligations, resolve disputes, and enforce these rules."] },
    { heading: "Your choices", paragraphs: ["You can control your camera, microphone, screen sharing, and room participation. Do not share information you would not want other room participants to receive.", "Privacy laws may give you rights to request access, correction, deletion, or a copy of personal information. Use the contact method provided in Foyer when available to make a request."] },
  ]} />;
}
