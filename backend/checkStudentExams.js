// Debug script to check student and exam data
// Run with: node checkStudentExams.js

const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const Exam = require('./models/Exam');
const Class = require('./models/Class');
const Subject = require('./models/Subject');

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log('MongoDB Connected');

        // Find all students
        const students = await User.find({ role: 'Student' }).populate('studentClass');
        console.log('\n=== STUDENTS ===');
        students.forEach(s => {
            console.log(`Student: ${s.name} (${s.email})`);
            console.log(`  Class: ${s.studentClass ? s.studentClass.name : 'NO CLASS ASSIGNED'}`);
            console.log(`  Class ID: ${s.studentClass?._id || 'N/A'}`);
        });

        // Find all exams
        const exams = await Exam.find().populate('class').populate('subject');
        console.log('\n=== EXAMS ===');
        exams.forEach(e => {
            console.log(`Exam: ${e.title}`);
            console.log(`  Subject: ${e.subject?.name || 'N/A'}`);
            console.log(`  Class: ${e.class?.name || 'N/A'}`);
            console.log(`  Class ID: ${e.class?._id || 'N/A'}`);
            console.log(`  Active: ${e.isActive}`);
            console.log(`  Start Time: ${e.startTime}`);
        });

        // Find all classes
        const classes = await Class.find();
        console.log('\n=== CLASSES ===');
        classes.forEach(c => {
            console.log(`Class: ${c.name} ${c.section || ''} (ID: ${c._id})`);
        });

        mongoose.connection.close();
    })
    .catch(err => {
        console.error('Error:', err);
        process.exit(1);
    });
