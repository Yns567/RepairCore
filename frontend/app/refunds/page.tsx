import LegalPage, { legalMetadata } from "@/components/legal/LegalPage";

export const generateMetadata = () => legalMetadata("refunds");

export default function RefundsPage() {
  return <LegalPage slug="refunds" />;
}
