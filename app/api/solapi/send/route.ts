import { SolapiMessageService } from "solapi";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { to } = await req.json();
    const testId = "TEST-" + Math.floor(Math.random() * 10000); // 랜덤 ID 생성

    const messageService = new SolapiMessageService(
      process.env.SOLAPI_API_KEY!,
      process.env.SOLAPI_API_SECRET!
    );

    const qrLink = `https://v0testv1js02.vercel.app/qr/${testId}`;

    const result = await messageService.sendOne({
      to: to,
      from: process.env.SOLAPI_FROM!,
      text: `[B-LINK] 출입 신청이 승인되었습니다.\n\n아래 링크를 눌러 QR코드를 제시해 주세요.\n${qrLink}`,
      type: "LMS",
      subject: "B-LINK 테스트"
    });

    return NextResponse.json({ success: true, visitorId: testId });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}