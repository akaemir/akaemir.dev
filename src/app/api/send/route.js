import { NextResponse } from "next/server";
import { Resend } from "resend";

// Rate limit store (In memory for development, ideally use KV or other persistent store in production)
const ipRequests = new Map();
const DAILY_LIMIT = 3; // Maximum emails per IP per day
const COOLDOWN_PERIOD = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

function getRateLimitInfo(ip) {
  const now = Date.now();
  const userRequests = ipRequests.get(ip) || { count: 0, timestamp: now };

  // Reset counter if 24 hours have passed
  if (now - userRequests.timestamp >= COOLDOWN_PERIOD) {
    userRequests.count = 0;
    userRequests.timestamp = now;
  }

  return userRequests;
}

const resend = new Resend(process.env.RESEND_API_KEY);
const fromEmail = getEnvVariable("FROM_EMAIL");
const toEmail = getEnvVariable("TO_EMAIL");

export async function POST(req, res) {
  const ip = req.headers.get("x-forwarded-for") || "unknown";
  const userRequests = getRateLimitInfo(ip);

  // Check rate limit
  if (userRequests.count >= DAILY_LIMIT) {
    return NextResponse.json(
      { error: `Daily email limit reached. Please try again in 24 hours.` },
      { status: 429 }
    );
  }

  const { email, subject, message } = await req.json();
  try {
    const data = await resend.emails.send({
      from: fromEmail,
      to: [toEmail],
      subject: subject,
      react: (
        <>
          <h1>{subject}</h1>
          <p>Thank you for contacting us!</p>
          <p>New message submitted:</p>
          <p>{message}</p>
        </>
      ),
    });

    // Increment request count after successful send
    userRequests.count++;
    ipRequests.set(ip, userRequests);

    return NextResponse.json({
      data,
      remainingEmails: DAILY_LIMIT - userRequests.count,
    });
  } catch (error) {
    return NextResponse.json({ error });
  }
}