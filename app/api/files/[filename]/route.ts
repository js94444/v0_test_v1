import { type NextRequest, NextResponse } from "next/server"
import { getDownloadUrl, fileExists } from "@/lib/storage/azure-blob"

export const runtime = "nodejs"

export async function GET(request: NextRequest, { params }: { params: { filename: string } }) {
  try {
    const { filename } = params

    if (!filename) {
      return NextResponse.json(
        {
          code: "NO_FILENAME",
          message: "파일명이 제공되지 않았습니다",
        },
        { status: 400 },
      )
    }

    // Check if file exists
    const exists = await fileExists(filename)
    if (!exists) {
      return NextResponse.json(
        {
          code: "FILE_NOT_FOUND",
          message: "파일을 찾을 수 없습니다",
        },
        { status: 404 },
      )
    }

    // Get download URL
    const downloadUrl = await getDownloadUrl(filename)

    // Redirect to the blob URL
    return NextResponse.redirect(downloadUrl)
  } catch (error) {
    console.error("[v0] Download error:", error)
    return NextResponse.json(
      {
        code: "DOWNLOAD_ERROR",
        message: "파일 다운로드 중 오류가 발생했습니다",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
