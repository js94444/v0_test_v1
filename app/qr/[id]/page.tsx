'use client'

import { useParams } from 'next/navigation'
import { QRCodeSVG } from 'qrcode.react'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

export default function VisitorPassPage() {
  const params = useParams();
  const visitorId = params.id as string;

  // DB 대신 사용하는 더미 데이터
  const dummyData = {
    id: visitorId || 'V2026-TEMP',
    name: '테스트 방문자',
    company: '(주)보령파트너스',
    date: '2026.02.04',
    purpose: '시스템 연동 테스트',
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md">
        <Card className="overflow-hidden shadow-2xl border-0">
          <div className="bg-blue-600 p-6 text-white text-center">
            <h1 className="text-xl font-bold">B-LINK 디지털 출입증</h1>
          </div>

          <div className="p-10 bg-white flex justify-center">
            <QRCodeSVG
              value={`https://v0testv1js02.vercel.app/verify/${visitorId}`}
              size={200}
              level="H"
            />
          </div>

          <Separator />

          <div className="p-6 space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">신청번호</span>
              <span className="font-bold">{dummyData.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">방문자명</span>
              <span className="font-bold">{dummyData.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">방문목적</span>
              <span className="font-bold">{dummyData.purpose}</span>
            </div>
          </div>
        </Card>
      </div>
    </main>
  )
}
