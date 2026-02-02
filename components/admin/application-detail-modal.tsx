import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { type Application, APPLICATION_STATUS_LABELS, APPLICATION_TYPE_LABELS, ACCESS_AREA_LABELS } from "@/lib/types"

interface ApplicationDetailModalProps {
  application: Application
  open: boolean
  onClose: () => void
}

export function ApplicationDetailModal({ application, open, onClose }: ApplicationDetailModalProps) {
  const getStatusColor = (status: string) => {
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

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center justify-between">
            <span>{APPLICATION_TYPE_LABELS[application.type]} 상세</span>
            <Badge variant="secondary" className={`${getStatusColor(application.status)} text-white`}>
              {APPLICATION_STATUS_LABELS[application.status]}
            </Badge>
          </DialogTitle>
          <DialogDescription>접수번호: {application.receipt}</DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-2">
          <div className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">기본 정보</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">📅</span>
                    <div>
                      <p className="text-sm text-muted-foreground">신청일</p>
                      <p className="font-medium">{new Date(application.created_at).toLocaleDateString("ko-KR")}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">📍</span>
                    <div>
                      <p className="text-sm text-muted-foreground">출입지역</p>
                      <p className="font-medium">{ACCESS_AREA_LABELS[application.access_area]}</p>
                    </div>
                  </div>
                  {application.contact_name && (
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">👤</span>
                      <div>
                        <p className="text-sm text-muted-foreground">담당자</p>
                        <p className="font-medium">{application.contact_name}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Applicant Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">신청자 정보</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {application.type === "GROUP_VISIT" && (
                    <>
                      <div>
                        <p className="text-sm text-muted-foreground">기관명</p>
                        <p className="font-medium break-words">{(application as any).organization}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">대표자</p>
                        <p className="font-medium break-words">{(application as any).representative}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">연락처</p>
                        <p className="font-medium">{(application as any).contact_phone}</p>
                      </div>
                    </>
                  )}
                  {application.type === "PORT_ACCESS" && (
                    <>
                      <div>
                        <p className="text-sm text-muted-foreground">신청자명</p>
                        <p className="font-medium">{application.contact_name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">연락처</p>
                        <p className="font-medium">{(application as any).contact_phone}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">소속</p>
                        <p className="font-medium">{(application as any).organization || "-"}</p>
                      </div>
                    </>
                  )}
                  {application.type === "VISIT_R3" && (
                    <>
                      <div>
                        <p className="text-sm text-muted-foreground">방문자명</p>
                        <p className="font-medium">{(application as any).visitor_name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">소속</p>
                        <p className="font-medium">{(application as any).visitor_organization}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">연락처</p>
                        <p className="font-medium">{(application as any).visitor_phone || "-"}</p>
                      </div>
                    </>
                  )}
                  {application.type === "GOODS_INOUT" && (
                    <>
                      <div>
                        <p className="text-sm text-muted-foreground">신청자명</p>
                        <p className="font-medium">{application.contact_name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">연락처</p>
                        <p className="font-medium">{(application as any).contact_phone}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">소속</p>
                        <p className="font-medium">{(application as any).organization || "-"}</p>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Type-specific Details */}
            {application.type === "GROUP_VISIT" && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">단체방문 정보</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">방문기간</p>
                      <p className="font-medium">
                        {new Date((application as any).visit_start_date).toLocaleDateString("ko-KR")} ~{" "}
                        {new Date((application as any).visit_end_date).toLocaleDateString("ko-KR")}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">방문 장소</p>
                      <p className="font-medium break-words">{(application as any).visit_location}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">방문 목적</p>
                      <p className="font-medium break-words whitespace-pre-wrap">
                        {(application as any).visit_purpose}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">인솔자명</p>
                      <p className="font-medium break-words">{(application as any).escort_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">인솔자 연락처</p>
                      <p className="font-medium">{(application as any).escort_phone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">인솔자 소속</p>
                      <p className="font-medium break-words">{(application as any).escort_department}</p>
                    </div>
                  </div>

                  {/* Visitors Table */}
                  {(application as any).visitors && (application as any).visitors.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">방문자 명단 ({(application as any).visitors.length}명)</h4>
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="min-w-[100px]">성명</TableHead>
                              <TableHead className="min-w-[120px]">생년월일</TableHead>
                              <TableHead className="min-w-[120px]">연락처</TableHead>
                              <TableHead className="min-w-[150px]">소속</TableHead>
                              <TableHead className="min-w-[100px]">직책</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {(application as any).visitors.map((visitor: any, index: number) => (
                              <TableRow key={index}>
                                <TableCell className="break-words">{visitor.name}</TableCell>
                                <TableCell>{visitor.birth_date}</TableCell>
                                <TableCell>{visitor.phone}</TableCell>
                                <TableCell className="break-words">{visitor.organization}</TableCell>
                                <TableCell className="break-words">{visitor.position}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Port Access Information */}
            {application.type === "PORT_ACCESS" && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">항만지역출입 정보</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
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
                      <p className="font-medium break-words">{(application as any).access_purpose}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">출입 인원</p>
                      <p className="font-medium">{(application as any).personnel?.length || 0}명</p>
                    </div>
                  </div>

                  {/* Port Access Certificate Attachment */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">항만교육이수증 첨부</p>
                      <div className="flex items-center gap-2">
                        {application.files &&
                        application.files.some(
                          (file) =>
                            file.filename.toLowerCase().includes("교육") ||
                            file.filename.toLowerCase().includes("이수증") ||
                            file.filename.toLowerCase().includes("certificate"),
                        ) ? (
                          <>
                            <span className="text-green-600">✓</span>
                            <span className="font-medium text-green-600">첨부됨</span>
                          </>
                        ) : (
                          <>
                            <span className="text-red-600">✗</span>
                            <span className="font-medium text-red-600">미첨부</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Personnel Table */}
                  {(application as any).personnel && (application as any).personnel.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">출입 인원 ({(application as any).personnel.length}명)</h4>
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="min-w-[100px]">성명</TableHead>
                              <TableHead className="min-w-[120px]">생년월일</TableHead>
                              <TableHead className="min-w-[120px]">연락처</TableHead>
                              <TableHead className="min-w-[150px]">소속</TableHead>
                              <TableHead className="min-w-[100px]">직책</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {(application as any).personnel.map((person: any, index: number) => (
                              <TableRow key={index}>
                                <TableCell className="break-words">{person.name}</TableCell>
                                <TableCell>{person.birth_date}</TableCell>
                                <TableCell>{person.phone}</TableCell>
                                <TableCell className="break-words">{person.organization}</TableCell>
                                <TableCell className="break-words">{person.position}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Visit R3 Information */}
            {application.type === "VISIT_R3" && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">개인방문 정보</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
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
                    <p className="font-medium break-words whitespace-pre-wrap">{(application as any).visit_purpose}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Goods Inout Information */}
            {application.type === "GOODS_INOUT" && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">물품반입반출 정보</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
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
                    <p className="font-medium break-words whitespace-pre-wrap">{(application as any).usage_purpose}</p>
                  </div>

                  {/* Items Table */}
                  {(application as any).items && (application as any).items.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">품목 목록 ({(application as any).items.length}개)</h4>
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="min-w-[150px]">품목명</TableHead>
                              <TableHead className="min-w-[100px]">수량</TableHead>
                              <TableHead className="min-w-[100px]">단위</TableHead>
                              <TableHead className="min-w-[200px]">비고</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {(application as any).items.map((item: any, index: number) => (
                              <TableRow key={index}>
                                <TableCell className="break-words">{item.name}</TableCell>
                                <TableCell>{item.quantity}</TableCell>
                                <TableCell>{item.unit}</TableCell>
                                <TableCell className="break-words">{item.remarks || "-"}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Files */}
            {application.files && application.files.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">첨부파일</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {application.files.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <span>📄</span>
                          <span className="text-sm truncate">{file.filename}</span>
                        </div>
                        <Button variant="outline" size="sm" className="flex-shrink-0 bg-transparent">
                          <span className="mr-2">⬇️</span>
                          다운로드
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Rejection Reason */}
            {application.status === "REJECTED" && application.rejection_reason && (
              <Card className="border-destructive">
                <CardHeader>
                  <CardTitle className="text-lg text-destructive">반려 사유</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm break-words whitespace-pre-wrap">{application.rejection_reason}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
