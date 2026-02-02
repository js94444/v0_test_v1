import { type NextRequest, NextResponse } from "next/server"
import { groupVisitSchema } from "@/lib/validation/group-visit"
import { MemoryDB } from "@/lib/db/memory-db"
import { ApplicationType } from "@/lib/types"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate request data
    const validationResult = groupVisitSchema.safeParse(body)
    if (!validationResult.success) {
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

    // Create application
    const application = await MemoryDB.createApplication({
      type: ApplicationType.GROUP_VISIT,
      contact_name: data.contact_name,
      access_area: data.access_area,
      files: data.files || [],
      // Group visit specific fields
      organization: data.organization,
      representative: data.representative,
      contact_phone: data.contact_phone,
      visit_start_date: new Date(data.visit_start_date),
      visit_end_date: new Date(data.visit_end_date),
      visit_purpose: data.visit_purpose,
      visit_location: data.visit_location,
      escort_name: data.escort_name,
      escort_phone: data.escort_phone,
      escort_department: data.escort_department,
      visitors: data.visitors,
      contact_email: data.contact_email,
    } as any)

    console.log("[v0] Email sending skipped (disabled)")

    return NextResponse.json({
      receipt: application.receipt,
      message: "신청이 성공적으로 접수되었습니다",
    })
  } catch (error) {
    console.error("Group visit application error:", error)
    return NextResponse.json(
      {
        code: "INTERNAL_ERROR",
        message: "서버 오류가 발생했습니다",
      },
      { status: 500 },
    )
  }
}
