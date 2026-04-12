import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, getClientIP } from "@/lib/auth";

// ─── GET — Fetch all support tickets with user info ─────────────
export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const status = searchParams.get("status") || "";
    const skip = (page - 1) * limit;

    const where = status
      ? { status: status as "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED" }
      : {};

    const [tickets, total] = await Promise.all([
      prisma.supportTicket.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: "desc" },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          _count: {
            select: { messages: true },
          },
        },
      }),
      prisma.supportTicket.count({ where }),
    ]);

    const serialized = tickets.map((t) => ({
      id: t.id,
      subject: t.subject,
      message: t.message,
      status: t.status,
      priority: t.priority,
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
      user: t.user,
      messageCount: t._count.messages,
    }));

    return NextResponse.json({
      success: true,
      data: serialized,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Admin fetch tickets error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch tickets" },
      { status: 500 }
    );
  }
}

// ─── PUT — Update ticket status ─────────────────────────────────
export async function PUT(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { ticketId, status } = body;

    if (!ticketId || !status) {
      return NextResponse.json(
        { success: false, error: "ticketId and status are required" },
        { status: 400 }
      );
    }

    const validStatuses = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` },
        { status: 400 }
      );
    }

    const ticket = await prisma.supportTicket.update({
      where: { id: ticketId },
      data: { status: status as "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED" },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        adminId: session.userId,
        action: "UPDATE_TICKET_STATUS",
        targetType: "SupportTicket",
        targetId: ticketId,
        details: { newStatus: status, subject: ticket.subject },
        ipAddress: getClientIP(request),
      },
    });

    return NextResponse.json({
      success: true,
      data: { id: ticket.id, status: ticket.status },
    });
  } catch (error) {
    console.error("Admin update ticket error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update ticket" },
      { status: 500 }
    );
  }
}

// ─── POST — Admin reply to ticket ───────────────────────────────
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { ticketId, message } = body;

    if (!ticketId || !message || message.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: "ticketId and message (min 2 chars) are required" },
        { status: 400 }
      );
    }

    const ticket = await prisma.supportTicket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      return NextResponse.json(
        { success: false, error: "Ticket not found" },
        { status: 404 }
      );
    }

    // Create message and update ticket
    const newMessage = await prisma.$transaction(async (tx) => {
      const msg = await tx.ticketMessage.create({
        data: {
          ticketId,
          senderId: session.userId,
          senderRole: "ADMIN",
          message: message.trim(),
        },
      });

      // Set to IN_PROGRESS if currently OPEN
      if (ticket.status === "OPEN") {
        await tx.supportTicket.update({
          where: { id: ticketId },
          data: { status: "IN_PROGRESS", updatedAt: new Date() },
        });
      } else {
        await tx.supportTicket.update({
          where: { id: ticketId },
          data: { updatedAt: new Date() },
        });
      }

      return msg;
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        adminId: session.userId,
        action: "REPLY_TICKET",
        targetType: "SupportTicket",
        targetId: ticketId,
        details: {
          messageId: newMessage.id,
          subject: ticket.subject,
        },
        ipAddress: getClientIP(request),
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          id: newMessage.id,
          ticketId: newMessage.ticketId,
          message: newMessage.message,
          senderRole: newMessage.senderRole,
          createdAt: newMessage.createdAt.toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Admin reply ticket error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to send reply" },
      { status: 500 }
    );
  }
}
