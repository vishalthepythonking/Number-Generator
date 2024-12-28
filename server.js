const express = require('express');
const faker = require('faker');
const { parse } = require('json2csv');
const fs = require('fs');
const path = require('path');
const compression = require('compression');
const helmet = require('helmet');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(compression()); // Enable compression for better performance
app.use(helmet()); // Secure HTTP headers
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded form data
app.use(express.json()); // Parse JSON data
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files

// Serve the index.html file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
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

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
