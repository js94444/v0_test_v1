"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ApplicationDetailModal } from "@/components/admin/application-detail-modal"
import { ApprovalDialog } from "@/components/admin/approval-dialog"
import {
  type Application,
  type ApplicationStatus,
  type ApplicationType,
  type AccessArea,
  APPLICATION_STATUS_LABELS,
  APPLICATION_TYPE_LABELS,
  ACCESS_AREA_LABELS,
} from "@/lib/types"
import { useToast } from "@/hooks/use-toast"

export default function AdminRequestsPage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)
  const [approvalDialog, setApprovalDialog] = useState<{
    application: Application
    action: "approve" | "reject"
  } | null>(null)

  // Filters
  const [activeTab, setActiveTab] = useState<ApplicationType | "ALL">("ALL")
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "ALL">("ALL")
  const [areaFilter, setAreaFilter] = useState<AccessArea | "ALL">("ALL")
  const [searchQuery, setSearchQuery] = useState("")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")

  const { toast } = useToast()

  useEffect(() => {
    fetchApplications()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [applications, activeTab, statusFilter, areaFilter, searchQuery, dateFrom, dateTo])

  const fetchApplications = async () => {
    try {
      const response = await fetch("/api/admin/requests")
      if (response.ok) {
        const data = await response.json()
        setApplications(data)
      }
    } catch (error) {
      toast({
        title: "데이터 로드 실패",
        description: "신청 목록을 불러오는 중 오류가 발생했습니다",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = applications

    // Type filter
    if (activeTab !== "ALL") {
      filtered = filtered.filter((app) => app.type === activeTab)
    }

    // Status filter
    if (statusFilter !== "ALL") {
      filtered = filtered.filter((app) => app.status === statusFilter)
    }

    // Area filter
    if (areaFilter !== "ALL") {
      filtered = filtered.filter((app) => app.access_area === areaFilter)
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (app) =>
          app.receipt.toLowerCase().includes(query) ||
          app.contact_name?.toLowerCase().includes(query) ||
          (app as any).organization?.toLowerCase().includes(query) ||
          (app as any).representative?.toLowerCase().includes(query) ||
          (app as any).visitor_name?.toLowerCase().includes(query),
      )
    }

    // Date filter
    if (dateFrom) {
      filtered = filtered.filter((app) => new Date(app.created_at) >= new Date(dateFrom))
    }
    if (dateTo) {
      filtered = filtered.filter((app) => new Date(app.created_at) <= new Date(dateTo + "T23:59:59"))
    }

    setFilteredApplications(filtered)
  }

  const handleApproval = async (application: Application, action: "approve" | "reject", reason?: string) => {
    try {
      const response = await fetch("/api/admin/requests/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: application.id,
          action,
          reason,
        }),
      })

      if (response.ok) {
        toast({
          title: action === "approve" ? "승인 완료" : "반려 완료",
          description: `신청이 ${action === "approve" ? "승인" : "반려"}되었습니다`,
        })
        fetchApplications()
      } else {
        throw new Error("처리 실패")
      }
    } catch (error) {
      toast({
        title: "처리 실패",
        description: "요청 처리 중 오류가 발생했습니다",
        variant: "destructive",
      })
    }
    setApprovalDialog(null)
  }

  const getStatusBadgeVariant = (status: ApplicationStatus) => {
    switch (status) {
      case "PENDING":
        return "secondary"
      case "UNDER_REVIEW":
        return "default"
      case "APPROVED":
        return "default"
      case "REJECTED":
        return "destructive"
      default:
        return "secondary"
    }
  }

  const getTypeIcon = (type: ApplicationType) => {
    switch (type) {
      case "GROUP_VISIT":
        return <span className="text-sm">👥</span>
      case "PORT_ACCESS":
        return <span className="text-sm">🚢</span>
      case "GOODS_INOUT":
        return <span className="text-sm">📦</span>
      case "VISIT_R3":
        return <span className="text-sm">👤</span>
      default:
        return null
    }
  }

  const tabCounts = {
    ALL: applications.length,
    GROUP_VISIT: applications.filter((app) => app.type === "GROUP_VISIT").length,
    PORT_ACCESS: applications.filter((app) => app.type === "PORT_ACCESS").length,
    GOODS_INOUT: applications.filter((app) => app.type === "GOODS_INOUT").length,
    VISIT_R3: applications.filter((app) => app.type === "VISIT_R3").length,
  }

  if (loading) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">데이터를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">신청 관리</h1>
          <p className="text-muted-foreground">출입 신청서를 검토하고 승인/반려 처리하세요</p>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>🔍</span>
              필터 및 검색
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">상태</label>
                <Select
                  value={statusFilter}
                  onValueChange={(value) => setStatusFilter(value as ApplicationStatus | "ALL")}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">전체</SelectItem>
                    {Object.entries(APPLICATION_STATUS_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">출입지역</label>
                <Select value={areaFilter} onValueChange={(value) => setAreaFilter(value as AccessArea | "ALL")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">전체</SelectItem>
                    {Object.entries(ACCESS_AREA_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">시작일</label>
                <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">종료일</label>
                <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">검색</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">🔍</span>
                  <Input
                    placeholder="접수번호, 담당자명 등"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Applications Table */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as ApplicationType | "ALL")}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="ALL">전체 ({tabCounts.ALL})</TabsTrigger>
            <TabsTrigger value="GROUP_VISIT">단체방문 ({tabCounts.GROUP_VISIT})</TabsTrigger>
            <TabsTrigger value="PORT_ACCESS">항만출입 ({tabCounts.PORT_ACCESS})</TabsTrigger>
            <TabsTrigger value="VISIT_R3">개인방문 ({tabCounts.VISIT_R3})</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>신청 목록 ({filteredApplications.length}건)</CardTitle>
                <CardDescription>
                  {filteredApplications.length > 0
                    ? `총 ${filteredApplications.length}건의 신청이 있습니다`
                    : "조건에 맞는 신청이 없습니다"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {filteredApplications.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="min-w-[100px]">유형</TableHead>
                          <TableHead className="min-w-[120px]">접수번호</TableHead>
                          <TableHead className="min-w-[100px]">신청일</TableHead>
                          <TableHead className="min-w-[100px]">방문일</TableHead>
                          <TableHead className="min-w-[120px]">신청자 소속</TableHead>
                          <TableHead className="min-w-[100px]">담당자명</TableHead>
                          <TableHead className="min-w-[80px]">상태</TableHead>
                          <TableHead className="min-w-[120px]">작업</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredApplications.map((application) => {
                          const getVisitDate = (app: Application) => {
                            if (app.type === "GROUP_VISIT") {
                              return new Date((app as any).visit_start_date).toLocaleDateString("ko-KR")
                            } else if (app.type === "PORT_ACCESS") {
                              return new Date((app as any).access_start_datetime).toLocaleDateString("ko-KR")
                            } else if (app.type === "VISIT_R3") {
                              return new Date((app as any).visit_datetime).toLocaleDateString("ko-KR")
                            }
                            return "-"
                          }

                          const getApplicantOrganization = (app: Application) => {
                            if (app.type === "GROUP_VISIT") {
                              return (app as any).organization || "-"
                            } else if (app.type === "PORT_ACCESS") {
                              return (app as any).company || "-"
                            } else if (app.type === "VISIT_R3") {
                              return (app as any).organization || "-"
                            } else if (app.type === "GOODS_INOUT") {
                              return (app as any).company || "-"
                            }
                            return "-"
                          }

                          const getContactName = (app: Application) => {
                            if (app.type === "GROUP_VISIT") {
                              return (app as any).representative || "-"
                            } else if (app.type === "PORT_ACCESS") {
                              return app.contact_name || "-"
                            } else if (app.type === "VISIT_R3") {
                              return (app as any).visitor_name || "-"
                            } else if (app.type === "GOODS_INOUT") {
                              return app.contact_name || "-"
                            }
                            return "-"
                          }

                          return (
                            <TableRow key={application.id}>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  {getTypeIcon(application.type)}
                                  <span className="text-sm">{APPLICATION_TYPE_LABELS[application.type]}</span>
                                </div>
                              </TableCell>
                              <TableCell className="font-mono text-sm">{application.receipt}</TableCell>
                              <TableCell>{new Date(application.created_at).toLocaleDateString("ko-KR")}</TableCell>
                              <TableCell>{getVisitDate(application)}</TableCell>
                              <TableCell className="max-w-[120px] truncate">
                                {getApplicantOrganization(application)}
                              </TableCell>
                              <TableCell className="max-w-[100px] truncate">{getContactName(application)}</TableCell>
                              <TableCell>
                                <Badge variant={getStatusBadgeVariant(application.status)}>
                                  {APPLICATION_STATUS_LABELS[application.status]}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setSelectedApplication(application)}
                                  >
                                    👁️
                                  </Button>
                                  {application.status === "PENDING" || application.status === "UNDER_REVIEW" ? (
                                    <>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setApprovalDialog({ application, action: "approve" })}
                                        className="text-green-600 hover:text-green-700"
                                      >
                                        ✓
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setApprovalDialog({ application, action: "reject" })}
                                        className="text-red-600 hover:text-red-700"
                                      >
                                        ✕
                                      </Button>
                                    </>
                                  ) : null}
                                </div>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">조건에 맞는 신청이 없습니다</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Application Detail Modal */}
      {selectedApplication && (
        <ApplicationDetailModal
          application={selectedApplication}
          open={!!selectedApplication}
          onClose={() => setSelectedApplication(null)}
        />
      )}

      {/* Approval Dialog */}
      {approvalDialog && (
        <ApprovalDialog
          application={approvalDialog.application}
          action={approvalDialog.action}
          open={!!approvalDialog}
          onClose={() => setApprovalDialog(null)}
          onConfirm={handleApproval}
        />
      )}
    </div>
  )
}
