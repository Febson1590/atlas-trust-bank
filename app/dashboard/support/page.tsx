import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import SupportClient from "./SupportClient";

export const metadata: Metadata = {
  title: "Support",
};

export default async function SupportPage({
  searchParams,
}: {
  searchParams: Promise<{ ticket?: string }>;
}) {
  // ── Session ────────────────────────────────────────────────
  const session = await getSession();
  if (!session) redirect("/login");

  const params = await searchParams;
  const selectedTicketId = params.ticket || null;

  // ── Fetch tickets ──────────────────────────────────────────
  const tickets = await prisma.supportTicket.findMany({
    where: { userId: session.userId },
    orderBy: { updatedAt: "desc" },
    include: {
      _count: {
        select: { messages: true },
      },
    },
  });

  const serializedTickets = tickets.map((t) => ({
    id: t.id,
    subject: t.subject,
    message: t.message,
    status: t.status,
    priority: t.priority,
    messageCount: t._count.messages,
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
  }));

  // ── Fetch selected ticket with messages if applicable ──────
  let selectedTicket: any = null;
  if (selectedTicketId) {
    const ticket = await prisma.supportTicket.findFirst({
      where: {
        id: selectedTicketId,
        userId: session.userId,
      },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
          include: {
            sender: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                role: true,
              },
            },
          },
        },
      },
    });

    if (ticket) {
      selectedTicket = {
        id: ticket.id,
        subject: ticket.subject,
        message: ticket.message,
        status: ticket.status,
        priority: ticket.priority,
        createdAt: ticket.createdAt.toISOString(),
        updatedAt: ticket.updatedAt.toISOString(),
        messages: ticket.messages.map((m) => ({
          id: m.id,
          senderId: m.senderId,
          senderRole: m.senderRole,
          senderName: `${m.sender.firstName} ${m.sender.lastName}`,
          message: m.message,
          createdAt: m.createdAt.toISOString(),
        })),
      };
    }
  }

  // Get user info for chat display
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { firstName: true, lastName: true },
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Header ──────────────────────────────────────────── */}
      <div>
        <h2 className="text-2xl font-bold text-text-primary">Support</h2>
        <p className="text-sm text-text-muted mt-1">
          Get help from our support team
        </p>
      </div>

      <SupportClient
        tickets={serializedTickets}
        selectedTicket={selectedTicket}
        userName={user ? `${user.firstName} ${user.lastName}` : "You"}
      />
    </div>
  );
}
