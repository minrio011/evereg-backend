import z from "zod";

export const registerSchema = z.object({
  body: z.object({
    username: z.string().min(3, { message: "Username ต้องมีอย่างน้อย 3 ตัวอักษร" }),
    email: z.string().email({ message: "รูปแบบ Email ไม่ถูกต้อง" }),
    password: z.string().min(8, { message: "Password ต้องมีความยาวอย่างน้อย 8 ตัวอักษร" })
  })
});

export type RegisterInput = z.infer<typeof registerSchema>['body'];

export const loginSchema = z.object({
    body: z.object({
        email: z.string().email({ message: "รูปแบบ Email ไม่ถูกต้อง" }),
        password: z.string().min(1, { message: "กรุณากรอกรหัสผ่าน" })
    })
});

export type LoginInput = z.infer<typeof loginSchema>['body'];