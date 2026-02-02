import { z } from "zod"
import { baseApplicationSchema, visitorSchema } from "./common"

export const groupVisitSchema = baseApplicationSchema.extend({
  organization: z.string().min(1, "기관명을 입력해주세요"),
  representative: z.string().min(1, "대표자명을 입력해주세요"),
  contact_phone: z.string().min(1, "연락처를 입력해주세요"),
  visit_start_date: z.string().min(1, "방문 시작일을 선택해주세요"),
  visit_end_date: z.string().min(1, "방문 종료일을 선택해주세요"),
  visit_purpose: z.string().min(1, "방문 목적을 입력해주세요"),
  visit_location: z.string().min(1, "방문 장소를 입력해주세요"),
  escort_name: z.string().min(1, "인솔자명을 입력해주세요"),
  escort_phone: z.string().min(1, "인솔자 연락처를 입력해주세요"),
  escort_department: z.string().min(1, "인솔자 소속을 입력해주세요"),
  visitors: z.array(visitorSchema).min(1, "최소 1명의 방문자를 추가해주세요"),
})

export type GroupVisitFormData = z.infer<typeof groupVisitSchema>
