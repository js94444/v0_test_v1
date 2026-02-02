import { z } from "zod"
import { baseApplicationSchema, personnelSchema, fileUploadSchema } from "./common"

export const electronicDeviceSchema = z.object({
  device_type: z.string().min(1, "전자기기 구분을 선택해주세요"),
  model_name: z.string().min(1, "모델명을 입력해주세요"),
  serial_number: z.string().min(1, "시리얼넘버를 입력해주세요"),
  in_out_type: z.enum(["in", "out"], {
    errorMap: () => ({ message: "반입/반출을 선택해주세요" }),
  }),
})

export const portAccessSchema = baseApplicationSchema.extend({
  access_start_datetime: z.string().min(1, "출입 시작일시를 선택해주세요"),
  access_end_datetime: z.string().min(1, "출입 종료일시를 선택해주세요"),
  access_purpose: z.string().min(1, "출입 목적을 입력해주세요"),
  personnel: z.array(personnelSchema).min(1, "최소 1명의 인원을 추가해주세요"),
  electronic_devices: z.array(electronicDeviceSchema).optional(),
  files: z.array(fileUploadSchema).optional(),
  vehicle_number: z.string().optional(),
  vehicle_model: z.string().optional(),
  visit_start_time: z.string().optional(),
  visit_end_time: z.string().optional(),
})

export type PortAccessFormData = z.infer<typeof portAccessSchema>
