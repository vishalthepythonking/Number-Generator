const express = require('express');
const faker = require('faker');
const { parse } = require('json2csv');
const fs = require('fs');
const path = require('path');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware to secure HTTP headers
app.use(helmet());

// Middleware for compression
app.use(compression());

// Middleware for logging HTTP requests
app.use(morgan('combined'));

// Middleware to parse form data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve static files
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

    try {
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
                res.status(500).send('Error during file download');
            }

            // Clean up the file after download
            fs.unlinkSync(filePath);
        });
    } catch (error) {
        console.error('Error generating phone numbers:', error);
        res.status(500).send('An error occurred while processing your request');
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).send('Internal server error');
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
