const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Load the JSON data (students)
function loadData() {
    const rawData = fs.readFileSync('data.json');
    return JSON.parse(rawData);
}

// Save the data back to the JSON file
function saveData(data) {
    const jsonData = JSON.stringify(data, null, 4);
    fs.writeFileSync('data.json', jsonData);
}

// Route to render the form
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

// Route to check if a student exists
app.post('/check-student', (req, res) => {
    const { rollNo } = req.body;
    const data = loadData();
    const student = data.students.find(s => s.rollNo === rollNo);

    if (student) {
        // Return student data if found
        res.json({ exists: true, student });
    } else {
        // No student found
        res.json({ exists: false });
    }
});

// Route to save a new student
app.post('/save-student', (req, res) => {
    const { rollNo, fullName, className, birthDate, address, enrollmentDate } = req.body;

    if (!rollNo || !fullName || !className || !birthDate || !address || !enrollmentDate) {
        return res.status(400).json({ message: 'All fields must be filled!' });
    }

    const data = loadData();
    data.students.push({ rollNo, fullName, className, birthDate, address, enrollmentDate });

    saveData(data);
    res.status(200).json({ message: 'Student enrolled successfully!' });
});

// Route to update an existing student
app.post('/update-student', (req, res) => {
    const { rollNo, fullName, className, birthDate, address, enrollmentDate } = req.body;

    if (!rollNo || !fullName || !className || !birthDate || !address || !enrollmentDate) {
        return res.status(400).json({ message: 'All fields must be filled!' });
    }

    const data = loadData();
    const studentIndex = data.students.findIndex(s => s.rollNo === rollNo);

    if (studentIndex === -1) {
        return res.status(404).json({ message: 'Student not found!' });
    }

    data.students[studentIndex] = { rollNo, fullName, className, birthDate, address, enrollmentDate };

    saveData(data);
    res.status(200).json({ message: 'Student updated successfully!' });
});

// Route to reset the form (client-side)
app.post('/reset', (req, res) => {
    res.status(200).json({ message: 'Form reset successful!' });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
