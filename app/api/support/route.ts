import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { supportTicketSchema } from "@/lib/validations";

// ─── GET -- Fetch user's support tickets ─────────────────────────
export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const tickets = await prisma.supportTicket.findMany({
      where: { userId: session.userId },
      orderBy: { updatedAt: "desc" },
      include: {
        _count: {
          select: { messages: true },
        },
      },
    });

    const serialized = tickets.map((t) => ({
      id: t.id,
      subject: t.subject,
      message: t.message,
      status: t.status,
      priority: t.priority,
      messageCount: t._count.messages,
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
    }));

    return NextResponse.json({ success: true, data: serialized });
  } catch (error) {
    console.error("Fetch tickets error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch support tickets" },
      { status: 500 }
    );
  }
}

// ─── POST -- Create a new support ticket ─────────────────────────
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const result = supportTicketSchema.safeParse(body);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      return NextResponse.json(
        { success: false, error: "Validation failed", details: errors },
        { status: 400 }
      );
    }

    const { subject, message, priority } = result.data;

    // Create ticket and first message in a transaction
    const ticket = await prisma.$transaction(async (tx) => {
      const newTicket = await tx.supportTicket.create({
        data: {
          userId: session.userId,
          subject,
          message,
          priority,
          status: "OPEN",
        },
      });

      // Create the initial message in the conversation
      await tx.ticketMessage.create({
        data: {
          ticketId: newTicket.id,
          senderId: session.userId,
          senderRole: "USER",
          message,
        },
      });

      return newTicket;
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          id: ticket.id,
          subject: ticket.subject,
          message: ticket.message,
          status: ticket.status,
          priority: ticket.priority,
          createdAt: ticket.createdAt.toISOString(),
          updatedAt: ticket.updatedAt.toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create ticket error:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
