const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

app.use(express.static('public'));


app.use(bodyParser.urlencoded({ extended: false }));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


app.get('/contact', (req, res) => {
    res.render('contact');
});

app.get('/recrutons', (req, res) => {
    res.render('recrutons');
});

app.post('/send', async (req, res) => {
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
        res.send('Erreur lors de l’envoi de l’email.');
    }
});




const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage });


app.post('/postuler', upload.single('cv_fichier'), async (req, res) => {
    const { prenom_candidat, nom_candidat, email_candidat, telephone_candidat } = req.body;
    const fichierCV = req.file;

    if (!fichierCV) {
        return res.status(400).send("Aucun fichier CV n'a été envoyé.");
    }

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'site.internet.otech@gmail.com',
            pass: 'urrdqredafdosdep'
        }
    });

    const mailOptions = {
        from: email_candidat,
        to: 'contact@otechenvironnement.fr',
        subject: 'Nouvelle candidature',
        text: `Prénom : ${prenom_candidat}
            Nom : ${nom_candidat}0
            Email : ${email_candidat}
            Téléphone : ${telephone_candidat}
            CV en pièce jointe.`,

        attachments: [
            {
                filename: fichierCV.originalname,
                content: fichierCV.buffer
            }
        ]
    };

    try {
        await transporter.sendMail(mailOptions);
        res.render('success', { message: 'Email envoyé avec succès' });

    } catch (err) {
        console.error(err);
        res.status(500).send('Erreur lors de l’envoi de la candidature.');
    }
});



app.listen(3000, '0.0.0.0', () => {
    console.log('Serveur lancé sur http://localhost:3000');
});
