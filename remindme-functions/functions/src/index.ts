import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as express from 'express';
import * as dayjs from 'dayjs';
import { isEmpty, isMail } from './utils/validators';
import * as nodemailer from 'nodemailer';
import * as cors from 'cors';

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//

admin.initializeApp();
const app = express();
app.use(cors({origin:true}));
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

const gmailEmail = functions.config().gmail.email;
const gmailPassword = functions.config().gmail.password;
const mailTransport = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: gmailEmail,
      pass: gmailPassword
    },
  });

export const sendMail = functions.pubsub.topic('sendMail').onPublish((message) => {

    const promise = (admin
        .firestore()
        .collection('jobs')
        .orderBy('date', 'asc')
        .where("sent", "==", false)
        .where("date", "<", dayjs(Date.now()).toISOString())
        .get())
        .then(data => {
            data.forEach((doc) => {
                const mail = doc.data();
                console.log('Sending mail to '+mail.mail);
                const mailOptions = {
                    from: 'remindme@gmail.com',
                    to: mail.mail,
                    subject: mail.content,
                    text: "",
                };
                mailTransport.sendMail(mailOptions)
                    .then(() => {
                        admin.firestore().doc(doc.ref.path).update({sent:true}).catch(err => console.error(err));
                    })
                    .catch(err => console.error(err));
            })
        })
    return promise;
});
        