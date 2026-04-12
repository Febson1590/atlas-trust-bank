import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// ─── GET -- Fetch user's notifications ───────────────────────────
export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get("unread") === "true";

    const where: Record<string, unknown> = {
      userId: session.userId,
    };

    if (unreadOnly) {
      where.read = false;
    }

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    const serialized = notifications.map((n) => ({
      id: n.id,
      title: n.title,
      message: n.message,
      type: n.type,
      read: n.read,
      createdAt: n.createdAt.toISOString(),
    }));

    return NextResponse.json({ success: true, data: serialized });
  } catch (error) {
    console.error("Fetch notifications error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

// ─── PUT -- Mark notification(s) as read ─────────────────────────
export async function PUT(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Mark all notifications as read
    if (body.all === true) {
      await prisma.notification.updateMany({
        where: {
          userId: session.userId,
          read: false,
        },
        data: { read: true },
      });

      return NextResponse.json({
        success: true,
        data: { message: "All notifications marked as read" },
      });
    }

    // Mark single notification as read
    if (body.id) {
      const notification = await prisma.notification.findFirst({
        where: {
          id: body.id,
          userId: session.userId,
        },
      });

      if (!notification) {
        return NextResponse.json(
          { success: false, error: "Notification not found" },
          { status: 404 }
        );
      }

      await prisma.notification.update({
        where: { id: body.id },
        data: { read: true },
      });

      return NextResponse.json({
        success: true,
        data: { message: "Notification marked as read" },
      });
    }

    return NextResponse.json(
      { success: false, error: "Provide an id or { all: true }" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Mark notification read error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update notification" },
      { status: 500 }
    );
  }
}
