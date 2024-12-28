const express = require('express');
const faker = require('faker');
const { parse } = require('json2csv');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

// Middleware to parse form data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Serve the index.html file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Handle form submission and generate phone numbers
app.post('/', (req, res) => {
    const { area_code, quantity } = req.body;

    // Validate input
    if (!area_code || !quantity || isNaN(quantity) || quantity < 1 || quantity > 1000) {
        return res.status(400).send('Invalid input');
    }

    // Generate phone numbers based on the area code and quantity
    const phoneNumbers = [];
    for (let i = 0; i < quantity; i++) {
        const phoneNumber = `${area_code}-${faker.phone.phoneNumber('###-####')}`;
        phoneNumbers.push({ phone_number: phoneNumber });
    }

    // Convert the phone numbers to CSV
    const csv = parse(phoneNumbers);

    // Path to save the CSV file temporarily
    const filePath = path.join(__dirname, 'generated_phone_numbers.csv');
    fs.writeFileSync(filePath, csv);

    // Trigger the download of the generated CSV file
    res.download(filePath, 'generated_phone_numbers.csv', (err) => {
        if (err) {
            console.error('Error during file download:', err);
        }

        // Clean up the file after download
        fs.unlinkSync(filePath);
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
