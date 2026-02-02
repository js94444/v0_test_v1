"use client";
import { useState } from "react"; // 2. 상태(로딩 등)를 관리하기 위해 추가

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"


export default function HomePage() {

  // 3. 문자 발송 중인지 확인하는 '상태' 변수
  const [isSending, setIsSending] = useState(false);

  // 4. 문자 발송 함수 (지난 대화에서 만든 핵심 로직)
  const handleTestSms = async () => {
    const phoneNumber = "01073321939"; // 테스트용 본인 번호로 수정하세요!
    
    if (!confirm(`${phoneNumber} 번호로 테스트 문자를 보낼까요?`)) return;

    setIsSending(true);
    try {
      const response = await fetch("/api/solapi/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: phoneNumber,
          text: "[B-LINK] 서버 연동 테스트 메시지입니다.",
        }),
      });

      const result = await response.json();
      if (result.success) {
        alert("✅ 발송 성공! 휴대폰을 확인하세요.");
      } else {
        alert("❌ 발송 실패: " + result.error);
      }
    } catch (error) {
      alert("에러가 발생했습니다. 콘솔 창을 확인하세요.");
    } finally {
      setIsSending(false);
    }
  };


  const applicationTypes = [
    {
      title: "개인방문신청",
      description: "개인이 시설을 방문하는 경우",
      icon: "👤",
      href: "/apply/visit-r3",
      gradient: "from-[#02856f] to-[#02856f]/80",
    },
    {
      title: "단체방문신청",
      description: "단체로 시설을 방문하는 경우",
      icon: "👥",
      href: "/apply/group-visit",
      gradient: "from-[#0298c2] to-[#0298c2]/80",
    },
    {
      title: "항만출입신청",
      description: "항만지역 출입이 필요한 경우",
      icon: "🏢",
      href: "/apply/port-access",
      gradient: "from-[#69b336] to-[#69b336]/80",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card backdrop-blur-sm shadow-sm sticky top-0 z-50">
        <div className="container flex h-20 items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">

              <Image
                src="/images/boryeong-lng-logo.png"
                alt="보령LNG터미널 로고"
                width={48}
                height={48}
                className="object-contain"
              />
              <div>
                <h1 className="text-2xl font-bold text-foreground">보령LNG 통합 출입 관리 시스템</h1>
                <p className="text-sm font-medium text-primary">B-LINK</p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
          <Button 
              variant="outline" 
              size="lg" 
              onClick={handleTestSms}
              disabled={isSending}
              className="border-orange-500 text-orange-600 hover:bg-orange-50"
          >
              {isSending ? "발송 중..." : "📲 연동 테스트"}
          </Button>

            <Button variant="outline" size="lg" asChild className="hover:bg-primary/10 bg-background border-border">
              <Link href="/status">
                <span className="mr-2">🕐</span>
                신청 현황 조회
              </Link>
            </Button>
            <Button
              variant="default"
              size="lg"
              asChild
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Link href="/admin/login">관리자</Link>
            </Button>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/25" />
        <div className="container relative py-10">
          <div className="text-center max-w-4xl mx-auto">
            <div
              className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium mb-6 border-2"
              style={{
                backgroundColor: "#ffffff",
                color: "#1f2937",
                borderColor: "#1f2937",
                boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
              }}
            >
              <span className="mr-2" style={{ color: "#1f2937" }}>
                ✓
              </span>
              <span style={{ color: "#1f2937" }}>안전하고 효율적인 출입 관리 시스템</span>
            </div>
            <h2 className="text-5xl font-bold mb-4 text-foreground leading-tight">
              보령LNG터미널 출입을 위한
              <br />
              <span className="text-primary">스마트 신청 서비스</span>
            </h2>
          </div>
        </div>
      </section>

      <section className="container py-12" id="application-types">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold mb-4 text-foreground">신청 유형 선택</h3>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            목적에 맞는 신청 유형을 선택하여 빠르고 정확한 출입 승인을 받으세요
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {applicationTypes.map((type) => (
            <Card
              key={type.href}
              className="group hover:shadow-2xl transition-all duration-300 border-0 bg-card backdrop-blur-sm hover:-translate-y-1"
            >
              <CardHeader className="pb-4">
                <div className="flex items-start space-x-4">
                  <div
                    className={`p-4 rounded-2xl bg-gradient-to-br ${type.gradient} shadow-lg flex items-center justify-center`}
                  >
                    <span className="text-2xl">{type.icon}</span>
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2 group-hover:text-primary transition-colors">
                      {type.title}
                    </CardTitle>
                    <p className="text-muted-foreground leading-relaxed">{type.description}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <Button asChild className="w-full bg-primary hover:bg-primary/90 text-lg py-6">
                  <Link href={type.href}>
                    신청하기
                    <span className="ml-2 group-hover:translate-x-1 transition-transform inline-block">→</span>
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <footer className="border-t bg-card/50 backdrop-blur-sm mt-20">
        <div className="container py-12">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <Image
                src="/images/boryeong-lng-logo.png"
                alt="보령LNG터미널 로고"
                width={32}
                height={32}
                className="object-contain"
              />
              <span className="text-lg font-bold text-foreground">B-LINK</span>
            </div>
            <p className="text-muted-foreground mb-2">© 2025 보령LNG 통합 출입 관리 시스템. All rights reserved.</p>
            <p className="text-sm text-muted-foreground">문의사항이 있으시면 관리자에게 연락해주세요.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
