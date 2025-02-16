import { NextResponse } from "next/server"
import clientPromise from "../../../lib/db"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../../lib/auth"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const client = await clientPromise
    const db = client.db("taskboard")
    const tasks = await db.collection("tasks").find({ userId: session.user.email }).toArray()

    return NextResponse.json(tasks)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { title, details, date } = await request.json()
    const client = await clientPromise
    const db = client.db("taskboard")

    const task = {
      userId: session.user.email,
      title,
      details,
      date,
      completed: false,
      createdAt: new Date(),
    }

    const result = await db.collection("tasks").insertOne(task)
    return NextResponse.json({ id: result.insertedId, ...task })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 })
  }
}

