import { type NextRequest, NextResponse } from "next/server"
import { visitR3Schema } from "@/lib/validation/visit-r3"
import { AzureSqlDB } from "@/lib/db/azure-sql"

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("[v0] Received visit-r3 application data:", body)

    const validationResult = visitR3Schema.safeParse(body)
    if (!validationResult.success) {
      console.log("[v0] Validation failed:", validationResult.error.errors)
      return NextResponse.json(
        {
          code: "VALIDATION_ERROR",
          message: "입력 데이터가 올바르지 않습니다",
          details: validationResult.error.errors,
        },
        { status: 400 },
      )
    }

    const data = validationResult.data
    console.log("[v0] Validated data:", data)

    const visitDateTime = data.visit_datetime ? new Date(data.visit_datetime) : new Date()
    console.log("[v0] Processed visit datetime:", visitDateTime)

    console.log("[v0] Saving to Azure SQL...")
    const application = await AzureSqlDB.createVisitR3Application({
      visitor_name: data.visitor_name,
      visitor_phone: data.visitor_phone,
      visitor_organization: data.visitor_organization,
      visitor_position: data.visitor_position,
      visit_datetime: visitDateTime,
      visit_purpose: data.visit_purpose,
      contact_name: data.contact_name,
      contact_email: data.contact_email,
      access_area: data.access_area,
      vehicle_number: data.vehicle_number,
      vehicle_model: data.vehicle_model,
      visit_start_time: data.visit_start_time,
      visit_end_time: data.visit_end_time,
    })
    console.log("[v0] Successfully saved to Azure SQL")

    console.log("[v0] Email sending skipped (disabled)")

    return NextResponse.json({
      receipt: application.receipt,
      message: "신청이 성공적으로 접수되었습니다",
    })
  } catch (error) {
    console.error("[v0] Visit R3 application error:", error)
    console.error("[v0] Error details:", error instanceof Error ? error.message : String(error))
    console.error("[v0] Error stack:", error instanceof Error ? error.stack : "No stack trace")
    return NextResponse.json(
      {
        code: "INTERNAL_ERROR",
        message: "서버 오류가 발생했습니다",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
