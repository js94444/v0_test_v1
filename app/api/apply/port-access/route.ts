import { type NextRequest, NextResponse } from "next/server"
import { portAccessSchema } from "@/lib/validation/port-access"
import { AzureSqlDB } from "@/lib/db/azure-sql"
import { APPLICATION_TYPE_LABELS } from "@/lib/types"
import { sendEmail, getApplicantEmail, getApplicantName } from "@/lib/email/sender"
import { getApplicationSubmittedTemplate } from "@/lib/email/templates"

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("[v0] Received port-access application data:", body)

    const validationResult = portAccessSchema.safeParse(body)
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

    const accessStartDatetime = new Date(data.access_start_datetime)
    const accessEndDatetime = new Date(data.access_end_datetime)
    console.log("[v0] Processed datetimes:", { accessStartDatetime, accessEndDatetime })

    console.log("[v0] Saving to Azure SQL...")
    const application = await AzureSqlDB.createPortAccessApplication({
      contact_name: data.contact_name,
      access_area: data.access_area,
      access_start_datetime: accessStartDatetime,
      access_end_datetime: accessEndDatetime,
      access_purpose: data.access_purpose,
      personnel: data.personnel,
      vehicle_number: data.vehicle_number,
      vehicle_model: data.vehicle_model,
      visit_start_time: data.visit_start_time,
      visit_end_time: data.visit_end_time,
    })

    try {
      const applicantEmail = getApplicantEmail(application)
      if (applicantEmail) {
        const applicantName = getApplicantName(application)
        const applicationType = APPLICATION_TYPE_LABELS[application.type]
        const template = getApplicationSubmittedTemplate(applicantName, applicationType, application.receipt)
        await sendEmail(applicantEmail, template)
      }
    } catch (emailError) {
      console.error("[v0] Failed to send application submitted email:", emailError)
      // Don't fail the application if email fails
    }

    return NextResponse.json({
      receipt: application.receipt,
      message: "신청이 성공적으로 접수되었습니다",
    })
  } catch (error) {
    console.error("Port access application error:", error)
    return NextResponse.json(
      {
        code: "INTERNAL_ERROR",
        message: "서버 오류가 발생했습니다",
      },
      { status: 500 },
    )
  }
}
