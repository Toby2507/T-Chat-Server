import Email from 'email-templates';
import nodemailer from 'nodemailer';
import log from './logger';

interface emailPayloadInterface {
    template: string;
    to: string;
    locals: object;
}

const transport = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_PASS }
});

const email = new Email({
    views: { root: 'src/emails/', options: { extension: 'ejs' } },
    message: {
        from: process.env.GMAIL_USER
    },
    preview: false,
    send: true,
    transport
});

const sendEmail = async (payload: emailPayloadInterface) => {
    try {
        email.send({
            template: payload.template,
            message: {
                to: payload.to
            },
            locals: { ...payload.locals }
        });
    } catch (err) { log.error(err, "Error sending email"); }
};

export default sendEmail;