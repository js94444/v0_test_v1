"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PageHeader } from "@/components/common/page-header"
import { useToast } from "@/hooks/use-toast"

export default function StatusPage() {
  const [receiptNumber, setReceiptNumber] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSearch = async () => {
    if (!receiptNumber.trim()) {
      toast({
        title: "접수번호를 입력해주세요",
        description: "조회할 접수번호를 입력해주세요",
        variant: "destructive",
      })
      return
    }

    setIsSearching(true)
    try {
      // Check if receipt exists before navigating
      const response = await fetch(`/api/status?receipt=${encodeURIComponent(receiptNumber.trim())}`)

      if (response.ok) {
        router.push(`/status/${encodeURIComponent(receiptNumber.trim())}`)
      } else if (response.status === 404) {
        toast({
          title: "접수번호를 찾을 수 없습니다",
          description: "입력하신 접수번호가 존재하지 않습니다. 다시 확인해주세요.",
          variant: "destructive",
        })
      } else {
        throw new Error("조회 중 오류가 발생했습니다")
      }
    } catch (error) {
      toast({
        title: "오류가 발생했습니다",
        description: error instanceof Error ? error.message : "다시 시도해주세요",
        variant: "destructive",
      })
    } finally {
      setIsSearching(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <PageHeader title="신청 현황 조회" description="접수번호로 신청 현황을 확인하세요" showBack />

      <div className="container py-12">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-2xl">
                <span>🔍</span>
                접수번호 조회
              </CardTitle>
              <CardDescription>
                신청 시 발급받은 접수번호를 입력하여 현재 처리 상태를 확인할 수 있습니다
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="receipt" className="text-sm font-medium">
                  접수번호 <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="receipt"
                  placeholder="예: GV-20251208-0001"
                  value={receiptNumber}
                  onChange={(e) => setReceiptNumber(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="text-center text-lg"
                />
                <p className="text-xs text-muted-foreground">
                  접수번호는 신청 완료 시 발급되는 고유번호입니다 (예: GV-20251208-0001)
                </p>
              </div>

              <Button onClick={handleSearch} disabled={isSearching} className="w-full" size="lg">
                {isSearching ? "조회중..." : "현황 조회"}
              </Button>
            </CardContent>
          </Card>

          {/* Help Information */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <span>📄</span>
                  접수번호 형식
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>단체방문신청:</span>
                  <code className="bg-muted px-2 py-1 rounded">GV-YYYYMMDD-####</code>
                </div>
                <div className="flex justify-between">
                  <span>항만출입신청:</span>
                  <code className="bg-muted px-2 py-1 rounded">PA-YYYYMMDD-####</code>
                </div>
                <div className="flex justify-between">
                  <span>물품반입반출:</span>
                  <code className="bg-muted px-2 py-1 rounded">GI-YYYYMMDD-####</code>
                </div>
                <div className="flex justify-between">
                  <span>개인방문신청:</span>
                  <code className="bg-muted px-2 py-1 rounded">VR-YYYYMMDD-####</code>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <span>🕐</span>
                  처리 상태 안내
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span>접수완료: 신청이 접수되었습니다</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span>검토중: 담당자가 검토하고 있습니다</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>승인완료: 출입이 승인되었습니다</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span>반려: 신청이 반려되었습니다</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
