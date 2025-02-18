import 'dotenv/config';
import { MailtrapClient } from "mailtrap";

const TOKEN = process.env.MAILTRAP_TOKEN;

export const mailTrapClient = new MailtrapClient({
  token: TOKEN,
});

export const sender = {
  email: "hello@demomailtrap.com",
  name: "Pratham Auth Test",
};
