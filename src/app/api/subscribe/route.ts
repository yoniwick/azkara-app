import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function POST(request: Request) {
  try {
    // Log the start of the request
    console.log("Starting subscription process");

    // Parse the request body
    const { email } = await request.json();
    console.log("Received email:", email);

    // Validate email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      console.log("Invalid email format");
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    console.log("Attempting MongoDB connection...");
    const client = await clientPromise;
    console.log("MongoDB connected successfully");

    const db = client.db("apacfund");
    const collection = db.collection("subscribers");

    // Test the collection access
    console.log("Testing collection access...");
    await collection.countDocuments();
    console.log("Collection access successful");

    // Check for existing subscriber
    const existingSubscriber = await collection.findOne({ email });
    
    if (existingSubscriber) {
      console.log("Email already exists:", email);
      return NextResponse.json(
        { error: "Email already subscribed" },
        { status: 409 }
      );
    }

    // Save new subscriber
    console.log("Saving new subscriber...");
    const result = await collection.insertOne({
      email,
      subscribedAt: new Date(),
      status: "active"
    });

    console.log("Subscriber saved successfully:", result.insertedId);
    return NextResponse.json(
      { message: "Subscription successful" },
      { status: 200 }
    );

  } catch (error) {
    // Detailed error logging
    console.error("Detailed error:", {
      name: error instanceof Error ? error.name : "Unknown",
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : "No stack trace"
    });

    return NextResponse.json(
      { 
        error: "Failed to subscribe",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}