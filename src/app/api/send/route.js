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
const fromEmail = process.env.FROM_EMAIL;
const toEmail = process.env.TO_EMAIL;

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
        <div
          style={{
            fontFamily: "Inter, Arial, sans-serif",
            background: "#f7f7fa",
            borderRadius: "12px",
            padding: "32px",
            maxWidth: "480px",
            margin: "0 auto",
            color: "#222",
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "24px",
              gap: "12px",
            }}
          >
            <img
              src="https://akaemir.dev/favicon.ico"
              alt="Logo"
              width="36"
              height="36"
              style={{ borderRadius: "8px" }}
            />
            <h2
              style={{
                margin: 0,
                fontWeight: 700,
                fontSize: "1.5rem",
                color: "#1a1a2e",
              }}
            >
              New Communication Message
            </h2>
          </div>
          <p
            style={{
              fontSize: "1.1rem",
              margin: "0 0 16px 0",
            }}
          >
            Hello,
          </p>
          <p
            style={{
              margin: "0 0 16px 0",
            }}
          >
            You have received a new communication message from your website:
          </p>
          <div
            style={{
              background: "#fff",
              borderRadius: "8px",
              padding: "20px",
              marginBottom: "20px",
              border: "1px solid #ececec",
              fontSize: "1rem",
              color: "#333",
            }}
          >
            <strong>Subject:</strong> {subject}
            <br />
            <strong>Sender:</strong> {email}
            <br />
            <strong>Message:</strong>
            <div
              style={{
                marginTop: "8px",
                whiteSpace: "pre-line",
              }}
            >
              {message}
            </div>
          </div>
          <p
            style={{
              fontSize: "0.95rem",
              color: "#888",
              margin: 0,
            }}
          >
            Bu mesaj{" "}
            <a
              href="https://akaemir.dev"
              style={{
                color: "#4f8cff",
                textDecoration: "none",
              }}
            >
              akaemir.dev
            </a>{" "}
            sent via.
          </p>
        </div>
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