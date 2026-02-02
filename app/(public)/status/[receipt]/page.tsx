"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  FileText,
  Calendar,
  MapPin,
  User,
  Users,
  Package,
  Ship,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react"
import { PageHeader } from "@/components/common/page-header"
import { StatusTimeline } from "@/components/common/status-timeline"
import {
  type Application,
  type ApplicationStatus,
  type ApplicationType,
  APPLICATION_STATUS_LABELS,
  APPLICATION_TYPE_LABELS,
  ACCESS_AREA_LABELS,
} from "@/lib/types"
import { useToast } from "@/hooks/use-toast"

export default function StatusDetailPage() {
  const params = useParams()
  const receipt = params.receipt as string
  const [application, setApplication] = useState<Application | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch(`/api/status?receipt=${encodeURIComponent(receipt)}`)

        if (!response.ok) {
          if (response.status === 404) {
            setError("접수번호를 찾을 수 없습니다")
          } else {
            setError("조회 중 오류가 발생했습니다")
          }
          return
        }

        const data = await response.json()
        setApplication(data)
      } catch (err) {
        setError("네트워크 오류가 발생했습니다")
      } finally {
        setLoading(false)
      }
    }

    if (receipt) {
      fetchStatus()
    }
  }, [receipt])

  const getStatusColor = (status: ApplicationStatus) => {
    switch (status) {
      case "PENDING":
        return "bg-blue-500"
      case "UNDER_REVIEW":
        return "bg-yellow-500"
      case "APPROVED":
        return "bg-green-500"
      case "REJECTED":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusIcon = (status: ApplicationStatus) => {
    switch (status) {
      case "PENDING":
        return <Clock className="h-4 w-4" />
      case "UNDER_REVIEW":
        return <AlertCircle className="h-4 w-4" />
      case "APPROVED":
        return <CheckCircle className="h-4 w-4" />
      case "REJECTED":
        return <XCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getTypeIcon = (type: ApplicationType) => {
    switch (type) {
      case "GROUP_VISIT":
        return <Users className="h-5 w-5" />
      case "PORT_ACCESS":
        return <Ship className="h-5 w-5" />
      case "GOODS_INOUT":
        return <Package className="h-5 w-5" />
      case "VISIT_R3":
        return <User className="h-5 w-5" />
      default:
        return <FileText className="h-5 w-5" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <PageHeader title="신청 현황 조회" showBack />
        <div className="container py-12">
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">조회중...</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  if (error || !application) {
    return (
      <div className="min-h-screen bg-background">
        <PageHeader title="신청 현황 조회" showBack />
        <div className="container py-12">
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">조회 실패</h3>
                  <p className="text-muted-foreground mb-4">{error || "알 수 없는 오류가 발생했습니다"}</p>
                  <Button onClick={() => window.history.back()}>다시 시도</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <PageHeader title="신청 현황 상세" description={`접수번호: ${receipt}`} showBack />

      <div className="container py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Status Overview */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getTypeIcon(application.type)}
                  <div>
                    <CardTitle>{APPLICATION_TYPE_LABELS[application.type]}</CardTitle>
                    <CardDescription>접수번호: {application.receipt}</CardDescription>
                  </div>
                </div>
                <Badge variant="secondary" className={`${getStatusColor(application.status)} text-white`}>
                  <div className="flex items-center gap-1">
                    {getStatusIcon(application.status)}
                    {APPLICATION_STATUS_LABELS[application.status]}
                  </div>
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">신청일</p>
                    <p className="font-medium">{new Date(application.created_at).toLocaleDateString("ko-KR")}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">출입지역</p>
                    <p className="font-medium">{ACCESS_AREA_LABELS[application.access_area]}</p>
                  </div>
                </div>
                {application.contact_name && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">담당자</p>
                      <p className="font-medium">{application.contact_name}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Status Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>처리 현황</CardTitle>
              <CardDescription>신청서의 처리 과정을 확인할 수 있습니다</CardDescription>
            </CardHeader>
            <CardContent>
              <StatusTimeline
                status={application.status}
                createdAt={application.created_at}
                updatedAt={application.updated_at}
                rejectionReason={application.rejection_reason}
              />
            </CardContent>
          </Card>

          {/* Application Details */}
          <Card>
            <CardHeader>
              <CardTitle>신청 내용</CardTitle>
              <CardDescription>제출하신 신청서의 주요 내용입니다</CardDescription>
            </CardHeader>
            <CardContent>
              {application.type === "GROUP_VISIT" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">기관명</p>
                      <p className="font-medium">{(application as any).organization}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">대표자</p>
                      <p className="font-medium">{(application as any).representative}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">방문기간</p>
                      <p className="font-medium">
                        {new Date((application as any).visit_start_date).toLocaleDateString("ko-KR")} ~{" "}
                        {new Date((application as any).visit_end_date).toLocaleDateString("ko-KR")}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">방문자 수</p>
                      <p className="font-medium">{(application as any).visitors?.length || 0}명</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">방문 목적</p>
                    <p className="font-medium">{(application as any).visit_purpose}</p>
                  </div>
                </div>
              )}

              {application.type === "PORT_ACCESS" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">출입 시작</p>
                      <p className="font-medium">
                        {new Date((application as any).access_start_datetime).toLocaleString("ko-KR")}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">출입 종료</p>
                      <p className="font-medium">
                        {new Date((application as any).access_end_datetime).toLocaleString("ko-KR")}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">출입 목적</p>
                      <p className="font-medium">{(application as any).access_purpose}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">출입 인원</p>
                      <p className="font-medium">{(application as any).personnel?.length || 0}명</p>
                    </div>
                  </div>
                </div>
              )}

              {application.type === "GOODS_INOUT" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">구분</p>
                      <p className="font-medium">{(application as any).inout_type === "IN" ? "반입" : "반출"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">품목 수</p>
                      <p className="font-medium">{(application as any).items?.length || 0}개</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">사용 목적</p>
                    <p className="font-medium">{(application as any).usage_purpose}</p>
                  </div>
                </div>
              )}

              {application.type === "VISIT_R3" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">방문자</p>
                      <p className="font-medium">{(application as any).visitor_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">소속</p>
                      <p className="font-medium">{(application as any).visitor_organization}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">방문일시</p>
                      <p className="font-medium">
                        {new Date((application as any).visit_datetime).toLocaleString("ko-KR")}
                      </p>
                    </div>
                    {(application as any).vehicle_number && (
                      <div>
                        <p className="text-sm text-muted-foreground">차량번호</p>
                        <p className="font-medium">{(application as any).vehicle_number}</p>
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">방문 목적</p>
                    <p className="font-medium">{(application as any).visit_purpose}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Rejection Reason */}
          {application.status === "REJECTED" && application.rejection_reason && (
            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="text-destructive flex items-center gap-2">
                  <XCircle className="h-5 w-5" />
                  반려 사유
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{application.rejection_reason}</p>
              </CardContent>
            </Card>
          )}

          {/* Files */}
          {application.files && application.files.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>첨부파일</CardTitle>
                <CardDescription>제출하신 첨부파일 목록입니다</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {application.files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-md">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <span className="text-sm">{file.filename}</span>
                      </div>
                      <Button variant="outline" size="sm">
                        다운로드
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-center pt-4">
            <Button onClick={() => (window.location.href = "/")} className="px-8 py-2">
              확인
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
