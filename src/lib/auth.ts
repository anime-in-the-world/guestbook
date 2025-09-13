import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { username, emailOTP } from "better-auth/plugins"; // removed captcha
import { Resend } from "resend";
import { db } from "@/db";
import { user } from "@/db/schema";
import { eq } from "drizzle-orm";

const resend = new Resend(process.env.RESEND_API_KEY!);

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // allow auto login after signup
  },
  plugins: [
    username(),
    emailOTP({
      disableSignUp: true,
      sendVerificationOnSignUp: true,
      async sendVerificationOTP({ email, otp }) {
        console.log("Sending OTP email to:", email, "OTP:", otp);

        // check if email is registered
        const existingUser = await db
          .select()
          .from(user)
          .where(eq(user.email, email))
          .limit(1);

        if (existingUser.length === 0) {
          console.error("Email not registered:", email);
          throw new Error("Email not registered. Please sign up first.");
        }

        try {
          const result = await resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
            to: email,
            subject: "Your verification code",
            html: `<p>Your verification code is: <strong>${otp}</strong></p>`,
          });
          console.log("Email sent successfully:", result);
        } catch (error) {
          console.error("Failed to send email:", error);
          throw error;
        }
      },
    }),
  ],
});
