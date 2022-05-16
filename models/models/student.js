const mongoose = require('mongoose');

const StudentSchema = mongoose.Schema({
    first_name: {
        type: String,
        required: true
    },
    last_name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    embeddings: {
        type: Array,
        required: true
    },
    lecture_access: {
        type: Boolean,
        required: false
    },
    lab_access: {
        type: Boolean,
        required: false
    },
    library_access: {
        type: Boolean,
        required: false
    },
});

const Student = module.exports = mongoose.model('Student', StudentSchema);