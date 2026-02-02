import { type NextRequest, NextResponse } from "next/server"
import { AzureSqlDB } from "@/lib/db/azure-sql"
import { ApplicationStatus } from "@/lib/types"
import { sendEmail } from "@/lib/email/sender"
import { getApprovalEmailTemplate, getRejectionEmailTemplate } from "@/lib/email/templates"

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    // TODO: Add proper admin authentication check
    const { id, action, reason } = await request.json()

    if (!id || !action) {
      return NextResponse.json(
        {
          code: "MISSING_PARAMETERS",
          message: "필수 매개변수가 누락되었습니다",
        },
        { status: 400 },
      )
    }

    if (action === "reject" && !reason) {
      return NextResponse.json(
        {
          code: "MISSING_REASON",
          message: "반려 사유를 입력해주세요",
        },
        { status: 400 },
      )
    }

    const status = action === "approve" ? ApplicationStatus.APPROVED : ApplicationStatus.REJECTED
    const updatedApplication = await AzureSqlDB.updateApplicationStatus(id, status, reason)

    if (!updatedApplication) {
      return NextResponse.json(
        {
          code: "NOT_FOUND",
          message: "해당 신청을 찾을 수 없습니다",
        },
        { status: 404 },
      )
    }

    try {
      const emailTemplate =
        action === "approve"
          ? getApprovalEmailTemplate(updatedApplication)
          : getRejectionEmailTemplate(updatedApplication, reason || "")

      await sendEmail({
        to: updatedApplication.contactEmail,
        subject: emailTemplate.subject,
        html: emailTemplate.html,
      })
    } catch (emailError) {
      console.error("Failed to send approval/rejection email:", emailError)
      // Continue with the response even if email fails
    }

    return NextResponse.json({
      message: `신청이 ${action === "approve" ? "승인" : "반려"}되었습니다`,
      application: updatedApplication,
    })
  } catch (error) {
    console.error("Admin approval error:", error)
    return NextResponse.json(
      {
        code: "INTERNAL_ERROR",
        message: "서버 오류가 발생했습니다",
      },
      { status: 500 },
    )
  }
}
