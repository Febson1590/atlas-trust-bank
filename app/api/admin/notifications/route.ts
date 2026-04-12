import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, getClientIP } from "@/lib/auth";

// ─── POST — Send notification to user(s) ────────────────────────
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
    const { userId, userIds, title, message, type } = body;

    if (!title || !message) {
      return NextResponse.json(
        { success: false, error: "title and message are required" },
        { status: 400 }
      );
    }

    const notificationType = type || "SYSTEM";
    const ipAddress = getClientIP(request);

    // Broadcast to all users
    if (userIds === "all") {
      const allUsers = await prisma.user.findMany({
        where: { role: "USER" },
        select: { id: true },
      });

      const notifications = allUsers.map((u) => ({
        userId: u.id,
        title,
        message,
        type: notificationType as "TRANSFER" | "SECURITY" | "KYC" | "SYSTEM" | "ACCOUNT",
        read: false,
      }));

      const result = await prisma.notification.createMany({
        data: notifications,
      });

      // Audit log
      await prisma.auditLog.create({
        data: {
          adminId: session.userId,
          action: "BROADCAST_NOTIFICATION",
          targetType: "Notification",
          targetId: "broadcast",
          details: {
            title,
            message,
            type: notificationType,
            recipientCount: result.count,
          },
          ipAddress,
        },
      });

      return NextResponse.json({
        success: true,
        data: { sent: result.count, broadcast: true },
      });
    }

    // Send to specific user
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "userId or userIds='all' is required" },
        { status: 400 }
      );
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, firstName: true, lastName: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    const notification = await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type: notificationType as "TRANSFER" | "SECURITY" | "KYC" | "SYSTEM" | "ACCOUNT",
        read: false,
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        adminId: session.userId,
        action: "SEND_NOTIFICATION",
        targetType: "Notification",
        targetId: notification.id,
        details: {
          title,
          message,
          type: notificationType,
          recipientId: userId,
          recipientName: `${user.firstName} ${user.lastName}`,
        },
        ipAddress,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          id: notification.id,
          sent: 1,
          broadcast: false,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Admin send notification error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to send notification" },
      { status: 500 }
    );
  }
}
