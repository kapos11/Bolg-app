const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  //Create transporter (service that will send email)
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  //Difine email option
  const emailOption = {
    from: "NotFace-Book App",
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  //Send email
  await transporter.sendMail(emailOption);
};

module.exports = sendEmail;
