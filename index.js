const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// Use full MongoDB URL from env
const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost:27017/mydb';

// Connect to MongoDB
mongoose.connect(mongoUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// Define Mongoose model
const Email = mongoose.model('Email', {
    email: String,
});

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Routes
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.post('/add-email', async (req, res) => {
    const { email } = req.body;
    try {
        const newEmail = new Email({ email });
        await newEmail.save();
        res.redirect('/');
    } catch (error) {
        res.status(500).send('Error adding email');
    }
});

app.get('/emails', async (req, res) => {
    try {
        const emails = await Email.find({});
        res.json(emails);
    } catch (error) {
        res.status(500).send('Error fetching emails');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
