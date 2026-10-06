import LegalPage, { legalMetadata } from "@/components/legal/LegalPage";

export const generateMetadata = () => legalMetadata("terms");

export default function TermsPage() {
  return <LegalPage slug="terms" />;
}
