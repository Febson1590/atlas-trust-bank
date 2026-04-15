import { NextResponse } from "next/server";
import { checkRateLimit, getClientIP } from "@/lib/auth";
import { contactSchema } from "@/lib/validations";
import { sendContactEmail } from "@/lib/email";

// ─── POST — Public contact form submission ─────────────────────
// Unauthenticated on purpose — this is the "Send Us a Message" form on the
// marketing site. Rate-limited per-IP to stop spam.
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const result = contactSchema.safeParse(body);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      return NextResponse.json(
        { success: false, error: "Validation failed", details: errors },
        { status: 400 }
      );
    }

    const ip = getClientIP(request);
    const rateLimit = await checkRateLimit("contact", ip);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `Too many messages. Please try again in ${rateLimit.retryAfter} seconds.`,
        },
        { status: 429 }
      );
    }

    const sent = await sendContactEmail(result.data);
    if (!sent) {
      return NextResponse.json(
        {
          success: false,
          error: "We couldn't send your message right now. Please try again in a moment.",
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        message: "Thanks — your message is on its way. We'll get back to you within one business day.",
      },
    });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { success: false, error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
