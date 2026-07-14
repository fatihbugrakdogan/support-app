import { TicketDetailView } from "./TicketDetailView";

export default async function TicketPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <TicketDetailView id={id} />;
}
