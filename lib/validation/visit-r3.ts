import { z } from "zod"
import { baseApplicationSchema, fileUploadSchema } from "./common"

export const visitR3Schema = baseApplicationSchema.extend({
  visitor_name: z.string().min(1, "방문자명을 입력해주세요"),
  visitor_phone: z.string().min(1, "연락처를 입력해주세요"),
  visitor_organization: z.string().min(1, "소속을 입력해주세요"),
  visitor_position: z.string().min(1, "직책을 입력해주세요"),
  visit_datetime: z.string().min(1, "방문일시를 선택해주세요"),
  visit_purpose: z.string().min(1, "방문 목적을 입력해주세요"),
  vehicle_number: z.string().optional(),
  files: z.array(fileUploadSchema).optional(),
})

export type VisitR3FormData = z.infer<typeof visitR3Schema>
