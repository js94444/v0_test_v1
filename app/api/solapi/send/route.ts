import { SolapiMessageService } from "solapi";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { to, text } = await req.json();

    // 1. 솔라피 서비스 연결 (환경 변수 확인)
    const messageService = new SolapiMessageService(
      process.env.SOLAPI_API_KEY!,
      process.env.SOLAPI_API_SECRET!
    );

    // 2. 메시지 전송 (send 대신 sendOne 권장)
    const result = await messageService.sendOne({
      to: to,
      from: process.env.SOLAPI_FROM!, // .env.local에 등록된 발신번호가 있어야 합니다.
      text: text,
      type: "LMS", // 내용이 길 경우 자동으로 전환되도록 LMS 설정
      subject: "B-LINK 알림",
    });

    console.log("발송 결과:", result); // 터미널에 결과를 찍어줍니다.

    // 3. UI와 약속한 대로 success: true로 응답
    return NextResponse.json({ success: true, result });

  } catch (error: any) {
    // 에러 발생 시 터미널에 상세 내용을 찍어줍니다.
    console.error("❌ 서버 에러 발생:", error);
    
    return NextResponse.json({ 
      success: false, 
      error: error.message || "서버 내부 오류가 발생했습니다." 
    }, { status: 500 });
  }
}