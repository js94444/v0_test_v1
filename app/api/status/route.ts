export const dynamic = 'force-dynamic'; // 이 줄을 최상단에 추가하세요.
import { type NextRequest, NextResponse } from "next/server"
import { AzureSqlDB } from "@/lib/db/azure-sql"

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const receipt = searchParams.get("receipt")

    if (!receipt) {
      return NextResponse.json(
        {
          code: "MISSING_RECEIPT",
          message: "접수번호가 필요합니다",
        },
        { status: 400 },
      )
    }

    const application = await AzureSqlDB.getApplicationByReceipt(receipt)

    if (!application) {
      return NextResponse.json(
        {
          code: "NOT_FOUND",
          message: "해당 접수번호를 찾을 수 없습니다",
        },
        { status: 404 },
      )
    }

    return NextResponse.json(application)
  } catch (error) {
    console.error("Status check error:", error)
    return NextResponse.json(
      {
        code: "INTERNAL_ERROR",
        message: "서버 오류가 발생했습니다",
      },
      { status: 500 },
    )
  }
}
