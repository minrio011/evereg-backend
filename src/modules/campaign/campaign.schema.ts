import { z } from "zod";

export const registerCampaignSchema = z.object({
    body: z.object({
        first_name: z.string()
            .min(1, { message: "กรุณากรอกชื่อ" })
            .regex(/^[a-zA-Z\s]+$/, { message: "ชื่อต้องเป็นภาษาอังกฤษเท่านั้น" }),
        last_name: z.string()
            .min(1, { message: "กรุณากรอกนามสกุล" })
            .regex(/^[a-zA-Z\s]+$/, { message: "นามสกุลต้องเป็นภาษาอังกฤษเท่านั้น" }),
        email: z.string().email({ message: "รูปแบบ Email ไม่ถูกต้อง" }),
        phone_number: z.string()
            .length(10, { message: "หมายเลขโทรศัพท์ต้องมี 10 หลัก" })
            .regex(/^[0-9]+$/, { message: "เบอร์โทรศัพท์ต้องเป็นตัวเลขเท่านั้น" }),
        event_id: z.coerce.number().int({ message: "รูปแบบ Event ID ไม่ถูกต้อง" }),
    }),
});

export type RegisterCampaignSchema = z.infer<typeof registerCampaignSchema>['body'];

export const getRegistrationQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).default(10),
    event_id: z.coerce.number().int().optional(),
    search: z.string().optional(),
    email: z.string().optional(),
    start_date: z.string().optional(),
    end_date: z.string().optional(),
});

export type GetRegistrationQuerySchema = z.infer<typeof getRegistrationQuerySchema>;

export const updateStatusSchema = z.object({
    body: z.object({
        id: z.coerce.number().int({ message: "รูปแบบ ID ไม่ถูกต้อง" }),
    }),
});

export const updateEligibilitySchema = z.object({
    body: z.object({
        id: z.coerce.number().int({ message: "รูปแบบ ID ไม่ถูกต้อง" }),
    }),
});

export type UpdateStatusSchema = z.infer<typeof updateStatusSchema>['body'];
export type UpdateEligibilitySchema = z.infer<typeof updateEligibilitySchema>['body'];
