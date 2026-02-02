"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/common/page-header"
import { FormInput } from "@/components/common/form-input"
import { FormSelect } from "@/components/common/form-select"
import { GENERAL_ACCESS_AREA_LABELS, type GeneralAccessArea } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { Checkbox } from "@/components/ui/checkbox"
import { ApplicationCache } from "@/lib/utils/cache"

interface FormData {
  visitor_name: string
  visitor_phone: string
  visitor_organization: string
  visitor_position: string
  contact_name: string
  contact_email: string
  access_area: GeneralAccessArea | ""
  visit_date: string
  visit_start_time: string
  visit_end_time: string
  visit_purpose: string
  vehicle_number: string
  vehicle_model: string
}

interface FormErrors {
  [key: string]: string
}

export default function VisitR3Page() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [privacyConsent, setPrivacyConsent] = useState(false)
  const [securityPledge, setSecurityPledge] = useState(false)
  const [safetyPledge, setSafetyPledge] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    visitor_name: "",
    visitor_phone: "",
    visitor_organization: "",
    visitor_position: "",
    contact_name: "",
    contact_email: "",
    access_area: "",
    visit_date: "",
    visit_start_time: "",
    visit_end_time: "",
    visit_purpose: "",
    vehicle_number: "",
    vehicle_model: "",
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const { toast } = useToast()
  const router = useRouter()

  const accessAreaOptions = Object.entries(GENERAL_ACCESS_AREA_LABELS).map(([value, label]) => ({
    value,
    label,
  }))

  const generateTimeOptions = () => {
    const options = []
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`
        options.push({ value: timeString, label: timeString })
      }
    }
    return options
  }

  const timeOptions = generateTimeOptions()

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.visitor_name.trim()) newErrors.visitor_name = "방문자명을 입력해주세요"
    if (!formData.visitor_phone.trim()) newErrors.visitor_phone = "연락처를 입력해주세요"
    if (!formData.visitor_organization.trim()) newErrors.visitor_organization = "소속을 입력해주세요"
    if (!formData.visitor_position.trim()) newErrors.visitor_position = "직책을 입력해주세요"
    if (!formData.contact_email.trim()) newErrors.contact_email = "이메일을 입력해주세요"
    if (!formData.access_area) newErrors.access_area = "출입지역을 선택해주세요"
    if (!formData.visit_date) newErrors.visit_date = "방문일을 선택해주세요"
    if (!formData.visit_start_time) newErrors.visit_start_time = "방문 시작 시간을 선택해주세요"
    if (!formData.visit_end_time) newErrors.visit_end_time = "방문 종료 시간을 선택해주세요"
    if (!formData.visit_purpose.trim()) newErrors.visit_purpose = "방문 목적을 입력해주세요"
    if (!formData.vehicle_number.trim()) newErrors.vehicle_number = "차량번호를 입력해주세요"
    if (!formData.vehicle_model.trim()) newErrors.vehicle_model = "차종을 입력해주세요"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast({
        title: "입력 오류",
        description: "필수 항목을 모두 입력해주세요",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      const submitData = {
        ...formData,
        visit_datetime: `${formData.visit_date}T${formData.visit_start_time}:00`,
        visit_start_time: formData.visit_start_time,
        visit_end_time: formData.visit_end_time,
      }

      console.log("[v0] Submitting data:", submitData)

      const response = await fetch("/api/apply/visit-r3", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      })

      console.log("[v0] Response status:", response.status, response.statusText)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("[v0] Server error response:", errorData)
        throw new Error(errorData.details || errorData.message || "신청 처리 중 오류가 발생했습니다")
      }

      const result = await response.json()
      console.log("[v0] Success result:", result)

      ApplicationCache.saveApplication(result.receipt, "VISIT_R3", {
        ...formData,
        visit_datetime: submitData.visit_datetime,
      })

      toast({
        title: "신청이 완료되었습니다",
        description: `접수번호: ${result.receipt}`,
      })

      router.push(`/status/${result.receipt}`)
    } catch (error) {
      toast({
        title: "오류가 발생했습니다",
        description: error instanceof Error ? error.message : "다시 시도해주세요",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const updateField = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const allConsentsGiven = privacyConsent && securityPledge && safetyPledge

  return (
    <div className="min-h-screen bg-background">
      <PageHeader title="개인방문신청" description="개인이 시설을 방문하는 경우 신청해주세요" showBack />

      <div className="container py-8">
        <form onSubmit={onSubmit} className="max-w-2xl mx-auto space-y-8">
          {/* Privacy Consent */}
          <Card className="border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-700">개인정보 수집·이용 동의</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg text-sm space-y-2">
                <p>
                  <strong>1. 수집･이용 목적:</strong> 보안사고, 테러예방, 안전교육 이수 확인, 사건(사고) 발생 시 경위 등
                  파악
                </p>
                <p>
                  <strong>2. 수집･이용 항목:</strong> 성명, 생년월일, 성별, 주소, 연락처
                </p>
                <p>
                  <strong>3. 보유기간:</strong> 5년 &lt;보유기간 경과 시 파기&gt;
                </p>
                <p>
                  <strong>4. 동의하지 않을 권리 및 미동의시 불이익</strong>
                </p>
                <p className="ml-4">
                  - 출입증 발급신청자는 개인정보 수집 및 이용에 대한 동의를 거부할 권리가 있으나, 미동의 시
                  『보안업무규정』제34조 제4항의 규정에 따라 보령 LNG 터미널 출입이 제한됨
                </p>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-white border-2 border-blue-300 rounded-lg">
                <Checkbox
                  id="privacy-consent"
                  checked={privacyConsent}
                  onCheckedChange={(checked) => setPrivacyConsent(checked as boolean)}
                  className="w-5 h-5 border-2 border-blue-600 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                />
                <label htmlFor="privacy-consent" className="text-sm font-semibold text-blue-800 cursor-pointer">
                  정보 수집･이용에 동의합니다 (필수)
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Security Pledge */}
          <Card className="border-orange-200">
            <CardHeader>
              <CardTitle className="text-orange-700">보안 서약</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-orange-50 rounded-lg text-sm space-y-2">
                <p className="font-medium">본인은 국가보안시설의 방문 신청함에 있어 아래와 같이 서약합니다.</p>
                <div className="space-y-1 ml-4">
                  <p>1. 귀사의 보안관리규정을 준수하겠습니다.</p>
                  <p>2. 귀사의 기밀사항과 중요사항, 업무상 지득한 비밀을 타인에게 누설하지 않겠습니다.</p>
                  <p>3. 시설내부에서 사진 및 영상촬영은 불가하며 필요시 사전에 허가를 받겠습니다.</p>
                  <p>4. 허가를 받아 촬영한 사진, 영상을 통신망 등에 무단으로 유포, 게재하지 않겠습니다.</p>
                  <p>5. 제한구역 및 통제구역내 출입 필요시 허가를 받아 출입하겠습니다.</p>
                </div>
                <p className="font-medium">
                  위 사항을 위반시에는 민,형사상 또는 보안상의 책임을 지며 관계법규에 의한 조치를 따를 것을 서약합니다.
                </p>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-white border-2 border-orange-300 rounded-lg">
                <Checkbox
                  id="security-pledge"
                  checked={securityPledge}
                  onCheckedChange={(checked) => setSecurityPledge(checked as boolean)}
                  className="w-5 h-5 border-2 border-orange-600 data-[state=checked]:bg-orange-600 data-[state=checked]:border-orange-600"
                />
                <label htmlFor="security-pledge" className="text-sm font-semibold text-orange-800 cursor-pointer">
                  보안 서약에 동의합니다 (필수)
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Safety Pledge */}
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-red-700">안전준수 서약</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-red-50 rounded-lg text-sm space-y-2">
                <p className="font-medium">
                  본인은 아래의 안전수칙을 반드시 준수하며, 미준수하는 경우 퇴출조치하여도 이의가 없음을 서약합니다.
                </p>
                <div className="space-y-1 ml-4">
                  <p>
                    1. 제조소내 작업은 사전 작업허가를 승인 후 실시하며, 규정된 복장, 보호구를 정확하게 착용하고
                    작업한다.
                  </p>
                  <p>
                    2. 2M 이상 추락 위험장소에서는 안전대를 착용하고 화기취급 작업시 불티비산방지 조치를 하여야 하고,
                    인화성 물질은 격리한다.
                  </p>
                  <p>3. 작업장 주위를 항상 정리정돈하고 불안전한 행동을 금한다.</p>
                  <p>
                    4. 경미한 사고라도 BLT에 알려야 하며, 근로자는 산업재해가 발생할 급박한 위험이 있는 경우에는 작업을
                    중지/대피 할 수 있다.
                  </p>
                  <p>5. 지정된 흡연 장소 이외 흡연 금지한다.</p>
                  <p>6. 공정지역 출입시 담당자 인솔 또는 허가 후 출입 가능하며 지역내에서 휴대폰 통화를 금지한다.</p>
                  <p>7. 안전보건환경 안내서(SHE Flyer)를 숙지한다.</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-white border-2 border-red-300 rounded-lg">
                <Checkbox
                  id="safety-pledge"
                  checked={safetyPledge}
                  onCheckedChange={(checked) => setSafetyPledge(checked as boolean)}
                  className="w-5 h-5 border-2 border-red-600 data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600"
                />
                <label htmlFor="safety-pledge" className="text-sm font-semibold text-red-800 cursor-pointer">
                  안전준수 서약에 동의합니다 (필수)
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Visitor Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">👤 방문자 정보</CardTitle>
              <CardDescription>방문자의 기본 정보를 입력해주세요</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                  label="방문자명"
                  required
                  value={formData.visitor_name}
                  onChange={(e) => updateField("visitor_name", e.target.value)}
                  error={errors.visitor_name}
                />
                <FormInput
                  label="연락처"
                  required
                  type="tel"
                  value={formData.visitor_phone}
                  onChange={(e) => updateField("visitor_phone", e.target.value)}
                  error={errors.visitor_phone}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                  label="소속"
                  required
                  value={formData.visitor_organization}
                  onChange={(e) => updateField("visitor_organization", e.target.value)}
                  error={errors.visitor_organization}
                />
                <FormInput
                  label="직책"
                  required
                  value={formData.visitor_position}
                  onChange={(e) => updateField("visitor_position", e.target.value)}
                  error={errors.visitor_position}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                  label="담당자명"
                  value={formData.contact_name}
                  onChange={(e) => updateField("contact_name", e.target.value)}
                  error={errors.contact_name}
                  description="선택사항 (2자 이상)"
                />
                <FormInput
                  label="이메일"
                  required
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => updateField("contact_email", e.target.value)}
                  error={errors.contact_email}
                />
              </div>
              <FormSelect
                label="출입지역"
                required
                options={accessAreaOptions}
                value={formData.access_area}
                onValueChange={(value) => updateField("access_area", value)}
                error={errors.access_area}
              />
            </CardContent>
          </Card>

          {/* Visit Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">📅 방문 정보</CardTitle>
              <CardDescription>방문 일정 및 목적을 입력해주세요</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormInput
                  label="방문일"
                  required
                  type="date"
                  value={formData.visit_date}
                  onChange={(e) => updateField("visit_date", e.target.value)}
                  error={errors.visit_date}
                />
                <FormSelect
                  label="방문 시작 시간"
                  required
                  options={timeOptions}
                  value={formData.visit_start_time}
                  onValueChange={(value) => updateField("visit_start_time", value)}
                  error={errors.visit_start_time}
                />
                <FormSelect
                  label="방문 종료 시간"
                  required
                  options={timeOptions}
                  value={formData.visit_end_time}
                  onValueChange={(value) => updateField("visit_end_time", value)}
                  error={errors.visit_end_time}
                />
              </div>
              <FormInput
                label="방문 목적"
                required
                value={formData.visit_purpose}
                onChange={(e) => updateField("visit_purpose", e.target.value)}
                error={errors.visit_purpose}
                description="방문 목적을 상세히 입력해주세요"
              />
            </CardContent>
          </Card>

          {/* Vehicle Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">🚗 차량 정보</CardTitle>
              <CardDescription>차량 정보를 입력해주세요</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                  label="차량번호"
                  required
                  value={formData.vehicle_number}
                  onChange={(e) => updateField("vehicle_number", e.target.value)}
                  error={errors.vehicle_number}
                  placeholder="예: 12가3456"
                />
                <FormInput
                  label="차종"
                  required
                  value={formData.vehicle_model}
                  onChange={(e) => updateField("vehicle_model", e.target.value)}
                  error={errors.vehicle_model}
                  placeholder="예: 쏘렌토, 싼타페, 그랜저 등"
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              취소
            </Button>
            <Button type="submit" disabled={isSubmitting || !allConsentsGiven}>
              {isSubmitting ? "처리중..." : allConsentsGiven ? "신청하기" : "모든 동의 항목을 체크해주세요"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
