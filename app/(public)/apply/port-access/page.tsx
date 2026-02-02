"use client"

import { useState } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/common/page-header"
import { FormInput } from "@/components/common/form-input"
import { FormSelect } from "@/components/common/form-select"
import { FileUpload } from "@/components/common/file-upload"
import { portAccessSchema, type PortAccessFormData } from "@/lib/validation/port-access"
import { type AccessArea, ACCESS_AREA_LABELS } from "@/lib/types"
import { TIME_OPTIONS } from "@/lib/validation/common"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { Checkbox } from "@/components/ui/checkbox"
import { ApplicationCache } from "@/lib/utils/cache"

export default function PortAccessPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [privacyConsent, setPrivacyConsent] = useState(false)
  const [securityPledge, setSecurityPledge] = useState(false)
  const [safetyPledge, setSafetyPledge] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const form = useForm<PortAccessFormData>({
    resolver: zodResolver(portAccessSchema),
    defaultValues: {
      personnel: [{ organization: "", position: "", name: "", birth_date: "", address: "" }],
      electronic_devices: [],
      files: [],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "personnel",
  })

  const {
    fields: deviceFields,
    append: appendDevice,
    remove: removeDevice,
  } = useFieldArray({
    control: form.control,
    name: "electronic_devices",
  })

  const accessAreaOptions = Object.entries(ACCESS_AREA_LABELS)
    .filter(([key]) => ["PIER_1", "PIER_2", "SUBSTATION", "OTHER"].includes(key))
    .map(([value, label]) => ({
      value,
      label,
    }))

  const timeOptions = TIME_OPTIONS.map((time) => ({
    value: time,
    label: time,
  }))

  const deviceTypeOptions = [
    { value: "laptop", label: "노트북" },
    { value: "tablet", label: "태블릿" },
    { value: "smartphone", label: "스마트폰" },
    { value: "camera", label: "카메라" },
    { value: "recorder", label: "녹음기" },
    { value: "other", label: "기타" },
  ]

  const inOutOptions = [
    { value: "in", label: "반입" },
    { value: "out", label: "반출" },
  ]

  const onSubmit = async (data: PortAccessFormData) => {
    setIsSubmitting(true)
    try {
      const response = await fetch("/api/apply/port-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("신청 처리 중 오류가 발생했습니다")
      }

      const result = await response.json()

      ApplicationCache.saveApplication(result.receipt, "PORT_ACCESS", data)

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

  return (
    <div className="min-h-screen bg-background">
      <PageHeader title="항만출입신청" description="항만지역 출입이 필요한 경우 신청해주세요" showBack />

      <div className="container py-8">
        <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-4xl mx-auto space-y-8">
          <div className="space-y-6">
            {/* Privacy Consent */}
            <Card className="bg-white border-2">
              <CardHeader>
                <CardTitle className="text-lg">개인정보 수집·이용</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm space-y-2 bg-gray-50 p-4 rounded-lg">
                  <p>
                    <strong>1. 수집･이용 목적 :</strong> 보안사고, 테러예방, 안전교육 이수 확인, 사건(사고) 발생 시 경위
                    등 파악
                  </p>
                  <p>
                    <strong>2. 수집･이용 항목 :</strong> 성명, 생년월일, 성별, 주소, 연락처
                  </p>
                  <p>
                    <strong>3. 보유기간 :</strong> 5년 &lt;보유기간 경과 시 파기&gt;
                  </p>
                  <p>
                    <strong>4. 동의하지 않을 권리 및 미동의시 불이익</strong>
                  </p>
                  <p className="ml-2">
                    - 출입증 발급신청자는 개인정보 수집 및 이용에 대한 동의를 거부할 권리가 있으나, 미동의 시
                    『보안업무규정』제34조 제4항의 규정에 따라 보령 LNG 터미널 출입이 제한됨
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg border">
                  <p className="font-medium mb-3">정보 수집･이용에 동의합니까?</p>
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="privacy-consent"
                      checked={privacyConsent}
                      onCheckedChange={(checked) => setPrivacyConsent(checked as boolean)}
                      className="w-5 h-5 border-2 border-gray-400 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                    />
                    <label htmlFor="privacy-consent" className="text-sm font-medium cursor-pointer">
                      동의합니다
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Security Pledge */}
            <Card className="bg-white border-2">
              <CardHeader>
                <CardTitle className="text-lg">보안 서약</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm space-y-2 bg-gray-50 p-4 rounded-lg">
                  <p className="font-medium">본인은 국가보안시설의 방문 신청함에 있어 아래와 같이 서약합니다.</p>
                  <div className="space-y-1 ml-2">
                    <p>1. 귀사의 보안관리규정을 준수하겠습니다.</p>
                    <p>2. 귀사의 기밀사항과 중요사항, 업무상 지득한 비밀을 타인에게 누설하지 않겠습니다.</p>
                    <p>3. 시설내부에서 사진 및 영상촬영은 불가하며 필요시 사전에 허가를 받겠습니다.</p>
                    <p>4. 허가를 받아 촬영한 사진, 영상을 통신망 등에 무단으로 유포,게재하지 않겠습니다.</p>
                    <p>5. 제한구역 및 통제구역내 출입 필요시 허가를 받아 출입하겠습니다.</p>
                  </div>
                  <p className="font-medium">
                    위 사항을 위규시에는 민,형사상 또는 보안상의 책임을 지며 관계법규에 의한 조치를 따를 것을
                    서약합니다.
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg border">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="security-pledge"
                      checked={securityPledge}
                      onCheckedChange={(checked) => setSecurityPledge(checked as boolean)}
                      className="w-5 h-5 border-2 border-gray-400 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                    />
                    <label htmlFor="security-pledge" className="text-sm font-medium cursor-pointer">
                      보안 서약에 동의합니다
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Safety Pledge */}
            <Card className="bg-white border-2">
              <CardHeader>
                <CardTitle className="text-lg">안전준수 서약</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm space-y-2 bg-gray-50 p-4 rounded-lg">
                  <p className="font-medium">
                    본인은 아래의 안전수칙을 반드시 준수하며, 미준수하는 경우 퇴출조치하여도 이의가 없음을 서약합니다.
                  </p>
                  <div className="space-y-1 ml-2">
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
                      4. 경미한 사고라도 BLT에 알려야 하며, 근로자는 산업재해가 발생할 급박한 위험이 있는 경우에는
                      작업을 중지/대피 할 수 있다.
                    </p>
                    <p>5. 지정된 흡연 장소 이외 흡연 금지한다.</p>
                    <p>6. 공정지역 출입시 담당자 인솔 또는 허가 후 출입 가능하며 지역내에서 휴대폰 통화를 금지한다.</p>
                    <p>7. 안전보건환경 안내서(SHE Flyer)를 숙지한다.</p>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg border">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="safety-pledge"
                      checked={safetyPledge}
                      onCheckedChange={(checked) => setSafetyPledge(checked as boolean)}
                      className="w-5 h-5 border-2 border-gray-400 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                    />
                    <label htmlFor="safety-pledge" className="text-sm font-medium cursor-pointer">
                      안전준수 서약에 동의합니다
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">🚢 기본 정보</CardTitle>
              <CardDescription>출입 신청 기본 정보를 입력해주세요</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                  label="담당자명"
                  {...form.register("contact_name")}
                  error={form.formState.errors.contact_name?.message}
                  description="선택사항 (2자 이상)"
                />
                <FormSelect
                  label="출입지역"
                  required
                  options={accessAreaOptions}
                  value={form.watch("access_area")}
                  onValueChange={(value) => form.setValue("access_area", value as AccessArea)}
                  error={form.formState.errors.access_area?.message}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                  label="차량번호"
                  required
                  {...form.register("vehicle_number")}
                  error={form.formState.errors.vehicle_number?.message}
                />
                <FormInput
                  label="차종"
                  required
                  {...form.register("vehicle_model")}
                  error={form.formState.errors.vehicle_model?.message}
                  placeholder="예: 쏘렌토, 싼타페, 그랜저 등"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormSelect
                  label="방문 시작시간"
                  required
                  options={timeOptions}
                  value={form.watch("visit_start_time")}
                  onValueChange={(value) => form.setValue("visit_start_time", value)}
                  error={form.formState.errors.visit_start_time?.message}
                />
                <FormSelect
                  label="방문 종료시간"
                  required
                  options={timeOptions}
                  value={form.watch("visit_end_time")}
                  onValueChange={(value) => form.setValue("visit_end_time", value)}
                  error={form.formState.errors.visit_end_time?.message}
                />
              </div>
            </CardContent>
          </Card>

          {/* Access Schedule */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">🕐 출입 일정</CardTitle>
              <CardDescription>출입 시작 및 종료 일시를 입력해주세요</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                  label="출입 시작일시"
                  required
                  type="datetime-local"
                  {...form.register("access_start_datetime")}
                  error={form.formState.errors.access_start_datetime?.message}
                />
                <FormInput
                  label="출입 종료일시"
                  required
                  type="datetime-local"
                  {...form.register("access_end_datetime")}
                  error={form.formState.errors.access_end_datetime?.message}
                />
              </div>
              <FormInput
                label="출입 목적"
                required
                {...form.register("access_purpose")}
                error={form.formState.errors.access_purpose?.message}
              />
            </CardContent>
          </Card>

          {/* Personnel List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">👥 출입 인원 목록</CardTitle>
              <CardDescription>출입할 모든 인원의 상세 정보를 입력해주세요</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="p-4 border rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">출입자 {index + 1}</h4>
                    {fields.length > 1 && (
                      <Button type="button" variant="outline" size="sm" onClick={() => remove(index)}>
                        🗑️
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <FormInput
                      label="소속"
                      required
                      {...form.register(`personnel.${index}.organization`)}
                      error={form.formState.errors.personnel?.[index]?.organization?.message}
                    />
                    <FormInput
                      label="직책"
                      required
                      {...form.register(`personnel.${index}.position`)}
                      error={form.formState.errors.personnel?.[index]?.position?.message}
                    />
                    <FormInput
                      label="성명"
                      required
                      {...form.register(`personnel.${index}.name`)}
                      error={form.formState.errors.personnel?.[index]?.name?.message}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput
                      label="생년월일"
                      required
                      type="date"
                      {...form.register(`personnel.${index}.birth_date`)}
                      error={form.formState.errors.personnel?.[index]?.birth_date?.message}
                    />
                    <FormInput
                      label="주소"
                      required
                      {...form.register(`personnel.${index}.address`)}
                      error={form.formState.errors.personnel?.[index]?.address?.message}
                    />
                  </div>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={() => append({ organization: "", position: "", name: "", birth_date: "", address: "" })}
                className="w-full"
              >
                ➕ 출입자 추가
              </Button>

              {form.formState.errors.personnel?.root && (
                <p className="text-sm text-destructive">{form.formState.errors.personnel.root.message}</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">📱 전자기기 반입/반출</CardTitle>
              <CardDescription>반입 또는 반출할 전자기기가 있는 경우 입력해주세요</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {deviceFields.map((field, index) => (
                <div key={field.id} className="p-4 border rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">전자기기 {index + 1}</h4>
                    <Button type="button" variant="outline" size="sm" onClick={() => removeDevice(index)}>
                      🗑️
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <FormSelect
                      label="전자기기 구분"
                      required
                      options={deviceTypeOptions}
                      value={form.watch(`electronic_devices.${index}.device_type`)}
                      onValueChange={(value) => form.setValue(`electronic_devices.${index}.device_type`, value)}
                      error={form.formState.errors.electronic_devices?.[index]?.device_type?.message}
                    />
                    <FormInput
                      label="모델명"
                      required
                      {...form.register(`electronic_devices.${index}.model_name`)}
                      error={form.formState.errors.electronic_devices?.[index]?.model_name?.message}
                    />
                    <FormInput
                      label="시리얼넘버"
                      required
                      {...form.register(`electronic_devices.${index}.serial_number`)}
                      error={form.formState.errors.electronic_devices?.[index]?.serial_number?.message}
                    />
                    <FormSelect
                      label="반입/반출"
                      required
                      options={inOutOptions}
                      value={form.watch(`electronic_devices.${index}.in_out_type`)}
                      onValueChange={(value) => form.setValue(`electronic_devices.${index}.in_out_type`, value)}
                      error={form.formState.errors.electronic_devices?.[index]?.in_out_type?.message}
                    />
                  </div>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={() => appendDevice({ device_type: "", model_name: "", serial_number: "", in_out_type: "" })}
                className="w-full"
              >
                ➕ 전자기기 추가
              </Button>
            </CardContent>
          </Card>

          {/* File Upload */}
          <Card>
            <CardHeader>
              <CardTitle>첨부파일</CardTitle>
              <CardDescription>항만교육이수증을 업로드해주세요</CardDescription>
            </CardHeader>
            <CardContent>
              <FileUpload
                label="파일 업로드"
                description="이미지 파일(PNG, JPG) 또는 PDF 파일을 업로드할 수 있습니다"
                onFilesChange={(files) => {
                  const fileData = files.map((file) => ({
                    filename: file.name,
                    fileKey: `temp-${Date.now()}-${file.name}`,
                    fileType: file.type,
                  }))
                  form.setValue("files", fileData)
                }}
              />
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              취소
            </Button>
            <Button type="submit" disabled={isSubmitting || !privacyConsent || !securityPledge || !safetyPledge}>
              {isSubmitting ? "처리중..." : "신청하기"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
