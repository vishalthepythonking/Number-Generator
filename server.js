const express = require('express');
const faker = require('faker');
const { parse } = require('json2csv');
const fs = require('fs');
const path = require('path');
const compression = require('compression');
const helmet = require('helmet');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(compression());
app.use(helmet());
app.use(cors()); // Enable CORS for cross-origin requests
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Serve the index.html file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Handle form submissions
app.post('/', (req, res) => {
    const { area_code, quantity } = req.body;

    if (!area_code || !quantity || isNaN(quantity) || quantity < 1 || quantity > 1000) {
        return res.status(400).send('Invalid input');
    }

    const phoneNumbers = [];
    for (let i = 0; i < quantity; i++) {
        const phoneNumber = `${area_code}-${faker.phone.phoneNumber('###-####')}`;
        phoneNumbers.push({ phone_number: phoneNumber });
    }

    const csv = parse(phoneNumbers);
    const filePath = path.join(__dirname, 'generated_phone_numbers.csv');
    fs.writeFileSync(filePath, csv);

    res.download(filePath, 'generated_phone_numbers.csv', (err) => {
        if (err) {
            console.error('Error during file download:', err);
        }
        fs.unlinkSync(filePath);
    });
});

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
