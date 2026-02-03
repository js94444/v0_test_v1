'use client'

import { useParams } from 'next/navigation'
import { QRCodeSVG } from 'qrcode.react'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

export default function VisitorPassPage() {
  const params = useParams();
  const visitorId = params.id as string; // 주소창의 [id] 값을 가져옵니다.

  // 현재는 샘플 데이터입니다. 나중에 DB(Azure SQL)에서 ID로 검색하는 기능을 넣을 수 있습니다.
  const visitorData = {
    id: visitorId || 'V2026-TEMP',
    name: '방문자', // 실제 운영 시에는 DB 데이터로 교체
    company: '확인 중',
    date: new Date().toLocaleDateString(),
    time: '시간 예약됨',
    purpose: '항만 출입',
    host: '보령LNG터미널',
  }

  // QR 코드에는 검증용 URL을 담습니다.
  const qrValue = `https://v0testv1js02.vercel.app/verify/${visitorId}`;

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 p-4">
      <div className="w-full max-w-md">
        <Card className="overflow-hidden shadow-xl border-2 border-primary/10">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white text-center space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">보령엘엔지터미널</h1>
            <p className="text-sm text-blue-100">Boryeong LNG Terminal</p>
          </div>

          <div className="bg-blue-600 text-white text-center py-2 text-sm font-semibold tracking-wide">
            방문자용 디지털 출입증
          </div>

          <div className="p-8 bg-white flex justify-center">
            <div className="p-6 bg-gray-50 rounded-xl border-2 border-blue-100">
              <QRCodeSVG
                value={qrValue}
                size={220}
                level="H"
                includeMargin={true}
                fgColor="#1e40af"
                bgColor="#ffffff"
              />
            </div>
          </div>

          <Separator className="bg-blue-100" />

          <div className="p-6 space-y-4 bg-white text-sm">
            <div className="grid grid-cols-[100px_1fr] gap-3">
              <div className="text-muted-foreground font-medium">출입증 번호</div>
              <div className="font-semibold text-foreground">{visitorData.id}</div>
              <div className="text-muted-foreground font-medium">방문자명</div>
              <div className="font-semibold text-foreground">{visitorData.name}</div>
              <div className="text-muted-foreground font-medium">방문 일시</div>
              <div className="text-foreground">{visitorData.date}</div>
            </div>
          </div>

          <div className="bg-blue-50 p-4 border-t-2 border-blue-100">
            <p className="text-xs text-center text-blue-700">
              출입 시 본 QR 코드를 스캐너에 제시해 주세요
            </p>
          </div>
        </Card>
      </div>
    </main>
  )
}