const express = require('express');
const serverless = require('serverless-http');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const router = express.Router();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../../views'));

router.get('/contact', (req, res) => {
    res.render('contact');
});

router.get('/recrutons', (req, res) => {
    res.render('recrutons');
});

router.post('/send', async (req, res) => {
    const { nom, email, sujet, message } = req.body;

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'site.internet.otech@gmail.com',
            pass: 'urrdqredafdosdep'
        }
    });

    const mailOptions = {
        from: email,
        to: 'contact@otechenvironnement.fr', 
        subject: sujet || 'Nouveau message de contact',
        text: `Nom: ${nom}\nEmail: ${email}\n\nMessage:\n${message}`
    };

    try {
        await transporter.sendMail(mailOptions);
        res.render('success', { message: 'Email envoyé avec succès' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Erreur lors de l\'envoi de l\'email.');
    }
});

app.use('/.netlify/functions/server', router);

module.exports.handler = serverless(app);
