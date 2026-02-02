import type { ApplicationStatus } from "@/lib/types"

interface StatusTimelineProps {
  status: ApplicationStatus
  createdAt: Date
  updatedAt: Date
  rejectionReason?: string
}

export function StatusTimeline({ status, createdAt, updatedAt, rejectionReason }: StatusTimelineProps) {
  const steps = [
    {
      id: "PENDING",
      title: "접수완료",
      description: "신청서가 접수되었습니다",
      icon: "✓",
      date: createdAt,
    },
    {
      id: "UNDER_REVIEW",
      title: "검토중",
      description: "담당자가 신청서를 검토하고 있습니다",
      icon: "⚠",
      date: status === "UNDER_REVIEW" || status === "APPROVED" || status === "REJECTED" ? updatedAt : null,
    },
    {
      id: status === "REJECTED" ? "REJECTED" : "APPROVED",
      title: status === "REJECTED" ? "반려" : "승인완료",
      description: status === "REJECTED" ? rejectionReason || "신청이 반려되었습니다" : "출입이 승인되었습니다",
      icon: status === "REJECTED" ? "✗" : "✓",
      date: status === "APPROVED" || status === "REJECTED" ? updatedAt : null,
    },
  ]

  const getStepStatus = (stepId: string) => {
    const statusOrder = ["PENDING", "UNDER_REVIEW", "APPROVED", "REJECTED"]
    const currentIndex = statusOrder.indexOf(status)
    const stepIndex = statusOrder.indexOf(stepId)

    if (stepId === status) return "current"
    if (stepId === "REJECTED" && status === "REJECTED") return "current"
    if (stepId === "APPROVED" && status === "APPROVED") return "current"
    if (stepIndex < currentIndex) return "completed"
    if (stepId === "REJECTED" && status !== "REJECTED") return "hidden"
    if (stepId === "APPROVED" && status === "REJECTED") return "hidden"
    return "pending"
  }

  const getStepColor = (stepStatus: string, stepId: string) => {
    switch (stepStatus) {
      case "completed":
        return "text-green-600 bg-green-100"
      case "current":
        if (stepId === "REJECTED") return "text-red-600 bg-red-100"
        if (stepId === "UNDER_REVIEW") return "text-yellow-600 bg-yellow-100"
        return "text-green-600 bg-green-100"
      case "pending":
        return "text-gray-400 bg-gray-100"
      default:
        return "text-gray-400 bg-gray-100"
    }
  }

  const visibleSteps = steps.filter((step) => getStepStatus(step.id) !== "hidden")

  return (
    <div className="space-y-4">
      {visibleSteps.map((step, index) => {
        const stepStatus = getStepStatus(step.id)
        const isLast = index === visibleSteps.length - 1

        return (
          <div key={step.id} className="flex items-start gap-4">
            <div className="flex flex-col items-center">
              <div
                className={`p-2 rounded-full ${getStepColor(stepStatus, step.id)} flex items-center justify-center w-8 h-8`}
              >
                <span className="text-sm font-bold">{step.icon}</span>
              </div>
              {!isLast && (
                <div className={`w-px h-8 mt-2 ${stepStatus === "completed" ? "bg-green-300" : "bg-gray-200"}`} />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4
                  className={`font-medium ${
                    stepStatus === "current"
                      ? "text-foreground"
                      : stepStatus === "completed"
                        ? "text-foreground"
                        : "text-muted-foreground"
                  }`}
                >
                  {step.title}
                </h4>
                {step.date && (
                  <span className="text-xs text-muted-foreground">{new Date(step.date).toLocaleString("ko-KR")}</span>
                )}
              </div>
              <p
                className={`text-sm mt-1 ${
                  stepStatus === "current"
                    ? "text-muted-foreground"
                    : stepStatus === "completed"
                      ? "text-muted-foreground"
                      : "text-muted-foreground/60"
                }`}
              >
                {step.description}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
