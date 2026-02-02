"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { APPLICATION_TYPE_LABELS, APPLICATION_STATUS_LABELS } from "@/lib/types"

interface DashboardStats {
  totalApplications: number
  monthlyStats: {
    month: string
    count: number
    byType: Record<string, number>
    byStatus: Record<string, number>
  }[]
  typeStats: Record<string, number>
  statusStats: Record<string, number>
  organizationStats: { organization: string; count: number }[]
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [selectedMonth, setSelectedMonth] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/admin/stats")
      if (response.ok) {
        const data = await response.json()
        setStats(data)
        if (data.monthlyStats.length > 0) {
          setSelectedMonth(data.monthlyStats[0].month)
        }
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <p className="text-muted-foreground">통계 데이터를 불러올 수 없습니다.</p>
        </div>
      </div>
    )
  }

  const selectedMonthData = stats.monthlyStats.find((m) => m.month === selectedMonth)

  return (
    <div className="container py-8">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">대시보드</h1>
            <p className="text-muted-foreground">출입 신청 현황 및 통계</p>
          </div>
          <Button onClick={fetchStats} variant="outline">
            <span className="mr-2">🔄</span>
            새로고침
          </Button>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">전체 신청</CardTitle>
              <span className="text-2xl">📊</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalApplications}</div>
              <p className="text-xs text-muted-foreground">총 신청 건수</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">승인 대기</CardTitle>
              <span className="text-2xl">⏳</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.statusStats.PENDING || 0}</div>
              <p className="text-xs text-muted-foreground">처리 대기 중</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">승인 완료</CardTitle>
              <span className="text-2xl">✅</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.statusStats.APPROVED || 0}</div>
              <p className="text-xs text-muted-foreground">승인된 신청</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">반려</CardTitle>
              <span className="text-2xl">❌</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.statusStats.REJECTED || 0}</div>
              <p className="text-xs text-muted-foreground">반려된 신청</p>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Statistics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>📈</span>
                월별 신청 현황
              </CardTitle>
              <CardDescription>최근 6개월간 신청 건수</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.monthlyStats.slice(0, 6).map((month) => (
                  <div key={month.month} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{month.month}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{
                            width: `${Math.min((month.count / Math.max(...stats.monthlyStats.map((m) => m.count))) * 100, 100)}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground w-8 text-right">{month.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>📋</span>
                신청 유형별 현황
              </CardTitle>
              <CardDescription>전체 신청 유형 분포</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(stats.typeStats).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {APPLICATION_TYPE_LABELS[type as keyof typeof APPLICATION_TYPE_LABELS]}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-muted rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{
                            width: `${Math.min((count / stats.totalApplications) * 100, 100)}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground w-8 text-right">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Detail */}
        {stats.monthlyStats.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>📅</span>
                월별 상세 현황
              </CardTitle>
              <CardDescription>특정 월의 상세 통계</CardDescription>
              <div className="pt-2">
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="월 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {stats.monthlyStats.map((month) => (
                      <SelectItem key={month.month} value={month.month}>
                        {month.month}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {selectedMonthData && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">신청 유형별</h4>
                    <div className="space-y-2">
                      {Object.entries(selectedMonthData.byType).map(([type, count]) => (
                        <div key={type} className="flex justify-between text-sm">
                          <span>{APPLICATION_TYPE_LABELS[type as keyof typeof APPLICATION_TYPE_LABELS]}</span>
                          <span className="font-medium">{count}건</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-3">처리 상태별</h4>
                    <div className="space-y-2">
                      {Object.entries(selectedMonthData.byStatus).map(([status, count]) => (
                        <div key={status} className="flex justify-between text-sm">
                          <span>{APPLICATION_STATUS_LABELS[status as keyof typeof APPLICATION_STATUS_LABELS]}</span>
                          <span className="font-medium">{count}건</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Top Organizations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>🏢</span>
              주요 방문 기관
            </CardTitle>
            <CardDescription>방문 신청이 많은 기관 순위</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.organizationStats.slice(0, 10).map((org, index) => (
                <div key={org.organization} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-muted-foreground w-6">#{index + 1}</span>
                    <span className="text-sm font-medium">{org.organization}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-muted rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{
                          width: `${Math.min((org.count / Math.max(...stats.organizationStats.map((o) => o.count))) * 100, 100)}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground w-8 text-right">{org.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
