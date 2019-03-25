import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as express from 'express';
import * as dayjs from 'dayjs';
import { isEmpty, isMail } from './utils/validators';
import * as nodemailer from 'nodemailer';

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//

admin.initializeApp();
const app = express();
app.get('/jobs', (request, response) => {
    admin
        .firestore()
        .collection('jobs')
        .orderBy('date', 'desc')
        .get()
        .then(data => {
            const jobs: any[] = [];
            data.forEach((doc) => {
                jobs.push(doc.data());
            })
            return response.json(jobs);
        })
        .catch(err => console.error(err));
});

app.get('/jobsToSend', (request, response) => {
    admin
        .firestore()
        .collection('jobs')
        .orderBy('date', 'asc')
        .where("sent", "==", false)
        .where("date", "<", dayjs(Date.now()).toISOString())
        .get()
        .then(data => {
            const jobs: any[] = [];
            data.forEach((doc) => {
                jobs.push(doc.data());
            })
            return response.json(jobs);
        })
        .catch(err => console.error(err));
});

app.post('/jobs', (request, response) => {

    const errors: any = {};
    if (isEmpty(request.body.mail)) {
        errors.mail = 'Mail must not be empty';
    }
    else if (!isMail(request.body.mail)) {
        errors.mail = 'Mail must be valid';
    }
    if (isEmpty(request.body.content)) {
        errors.content = 'Content must not be empty'
    }
    if (isEmpty(request.body.date)) {
        errors.date = 'Date must not be empty'
    }

    if (Object.keys(errors).length > 0) {
        response.status(400).json(errors);
    }
    else {
        const newJob = {
            mail: request.body.mail,
            content: request.body.content,
            date: request.body.date,
            sent: false
        }

        admin
            .firestore()
            .collection('jobs')
            .add(newJob)
            .then((doc) => {
                response.json({ message: `document ${doc.id} created successfully` });
            })
            .catch((err) => {
                console.error(err);
                response.status(500).json({ error: 'something went wrong' });
            })
    }

});

export const api = functions.https.onRequest(app);

export const sendMail = functions.pubsub.topic('sendMail').onPublish((message) => {

    const mails: any[] = [];

    admin
        .firestore()
        .collection('jobs')
        .orderBy('date', 'asc')
        .where("sent", "==", false)
        .where("date", "<", dayjs(Date.now()).toISOString())
        .get()
        .then(data => {
            data.forEach((doc) => {
                mails.push(doc.data());
            })
        })
        .catch(err => console.error(err));


    const transportPromise = nodemailer.createTestAccount()
        .then((account) => {
            return nodemailer.createTransport({
                host: "smtp.ethereal.email",
                port: 587,
                secure: false, // true for 465, false for other ports
                auth: {
                    user: account.user, // generated ethereal user
                    pass: account.pass // generated ethereal password
                }
            });
        });

    transportPromise
        .then((transporter) => {
            mails.forEach((mail) => {
                const mailOptions = {
                    from: 'remindme@gmail.com', // sender address
                    to: mail.mail, // list of receivers
                    subject: mail.content, // Subject line
                    text: "yes", // plain text body
                };
                transporter.sendMail(mailOptions)
                    .then((info) => {
                        console.info(nodemailer.getTestMessageUrl(info));
                    })
                    .catch(err => console.error(err));
            });

        })
        .catch(err => console.error(err));
    return 0;
});