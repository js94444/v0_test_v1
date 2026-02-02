import { z } from "zod"
import { baseApplicationSchema, goodsItemSchema, fileUploadSchema } from "./common"

export const goodsInOutSchema = baseApplicationSchema.extend({
  inout_type: z.enum(["IN", "OUT"], {
    errorMap: () => ({ message: "반입/반출 구분을 선택해주세요" }),
  }),
  usage_purpose: z.string().min(1, "사용 목적을 입력해주세요"),
  items: z.array(goodsItemSchema).min(1, "최소 1개의 품목을 추가해주세요"),
  files: z.array(fileUploadSchema).optional(),
})

export type GoodsInOutFormData = z.infer<typeof goodsInOutSchema>
