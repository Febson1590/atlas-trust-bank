import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// ─── GET -- Fetch single ticket with all messages ────────────────
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    const ticket = await prisma.supportTicket.findFirst({
      where: {
        id,
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

    if (!ticket) {
      return NextResponse.json(
        { success: false, error: "Ticket not found" },
        { status: 404 }
      );
    }

    const serialized = {
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

    return NextResponse.json({ success: true, data: serialized });
  } catch (error) {
    console.error("Fetch ticket error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch ticket" },
      { status: 500 }
    );
  }
}

// ─── POST -- Add message to ticket ───────────────────────────────
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Verify ticket ownership
    const ticket = await prisma.supportTicket.findFirst({
      where: {
        id,
        userId: session.userId,
      },
    });

    if (!ticket) {
      return NextResponse.json(
        { success: false, error: "Ticket not found" },
        { status: 404 }
      );
    }

    // Check ticket is not closed
    if (ticket.status === "CLOSED") {
      return NextResponse.json(
        { success: false, error: "Cannot reply to a closed ticket" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { message } = body;

    if (!message || typeof message !== "string" || message.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: "Message must be at least 2 characters" },
        { status: 400 }
      );
    }

    // Create message and update ticket timestamp
    const newMessage = await prisma.$transaction(async (tx) => {
      const msg = await tx.ticketMessage.create({
        data: {
          ticketId: id,
          senderId: session.userId,
          senderRole: "USER",
          message: message.trim(),
        },
      });

      // Touch the ticket's updatedAt
      await tx.supportTicket.update({
        where: { id },
        data: { updatedAt: new Date() },
      });

      return msg;
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          id: newMessage.id,
          ticketId: newMessage.ticketId,
          senderId: newMessage.senderId,
          senderRole: newMessage.senderRole,
          message: newMessage.message,
          createdAt: newMessage.createdAt.toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Add message error:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
