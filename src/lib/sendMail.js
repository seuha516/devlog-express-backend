import nodemailer from 'nodemailer';

const sendMail = async (type, page, title, nickname, content) => {
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.MAIL_ID,
      pass: process.env.MAIL_PASSWORD,
    },
  });
  await transporter.sendMail({
    from: `Devlog - Jeon Seungha`,
    to: process.env.MAIL_ADMIN,
    subject: `Devlog: ${type} 알림`,
    text: `\'${title}\' ${page}에 ${nickname}님의 ${type}.\n \"${content}\"`,
  });
};

export default sendMail;
