
import nodemailer from "nodemailer";
import path from "path";

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    tls: {
        rejectUnauthorized: false,
    },
    connectionTimeout: 30000,
    greetingTimeout: 30000,
});

export const sendConfirmationEmail = async (
    email: string,
    firstName: string
) => {
    const imagePath = path.resolve("./public/images/email_notification.png");

    const mailOptions = {
        from: '"Maybelline New York - Boba Boost Square" <noreply@maybelline.com>',
        to: email,
        subject: `ยืนยันการลงทะเบียน - ${firstName}`,
        html: `
            <h1>ลงทะเบียนสำเร็จ!</h1>
            <p>สวัสดีคุณ ${firstName}, ขอบคุณที่ลงทะเบียนร่วมกิจกรรมกับ Maybelline New York - Boba Boost Square</p>
            // <img src="cid:email_notification" style="width: 100%; max-width: 600px; height: auto;" />
        `,
        // attachments: [
        //     {
        //         filename: "email_notification.png",
        //         path: imagePath,
        //         cid: "email_notification",
        //     },
        // ],
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error("--- Nodemailer Error Details:", error);
        throw new Error("Failed to send confirmation email.");
    }
};