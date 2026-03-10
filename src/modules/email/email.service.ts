export const sendConfirmationEmail = async (email: string, firstName: string) => {
    const url = 'https://api.brevo.com/v3/smtp/email';
    
    const data = {
        sender: { 
            name: "Maybelline New York", 
            email: "phatthaphon.pl@gmail.com"
        },
        to: [{ email: email, name: firstName }],
        subject: `ยืนยันการลงทะเบียน - ${firstName}`,
        htmlContent: `
            <div style="font-family: sans-serif; text-align: center; max-width: 600px; margin: auto;">
                <h1 style="color: #e91e63;">ลงทะเบียนสำเร็จ!</h1>
                <p>สวัสดีคุณ <b>${firstName}</b>, ขอบคุณที่ร่วมกิจกรรมกับเรา</p>
                <img src="https://gasixulcmsspcnwhxwcv.supabase.co/storage/v1/object/public/images/email_notification.png" 
                     style="width: 100%; border-radius: 10px;" />
            </div>
        `
    };

    try {
        console.log("--- Sending via Pure Fetch API ---");
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'api-key': process.env.BREVO_API_KEY as string,
                'content-type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.ok) {
            console.log("--- Success! Message ID:", result.messageId);
        } else {
            console.error("--- Brevo API Error:", result);
            throw new Error("Failed to send email");
        }
    } catch (error: any) {
        console.error("--- Fetch Error:", error.message);
        throw error;
    }
};