import { type NextRequest, NextResponse } from "next/server"
import { goodsInOutSchema } from "@/lib/validation/goods-inout"
import { MemoryDB } from "@/lib/db/memory-db"
import { ApplicationType } from "@/lib/types"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const validationResult = goodsInOutSchema.safeParse(body)
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

    const application = await MemoryDB.createApplication({
      type: ApplicationType.GOODS_INOUT,
      contact_name: data.contact_name,
      access_area: data.access_area,
      files: data.files || [],
      inout_type: data.inout_type,
      usage_purpose: data.usage_purpose,
      items: data.items,
    } as any)

    return NextResponse.json({
      receipt: application.receipt,
      message: "신청이 성공적으로 접수되었습니다",
    })
  } catch (error) {
    console.error("Goods in/out application error:", error)
    return NextResponse.json(
      {
        code: "INTERNAL_ERROR",
        message: "서버 오류가 발생했습니다",
      },
      { status: 500 },
    )
  }
}
