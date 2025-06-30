// // models/Student.js
// import mongoose from 'mongoose';

// const studentSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   rollNumber: { type: String, required: true, unique: true },
//   email: { type: String },
//   department: { type: String, required: true },
//   semester: { type: Number, required: true },
//   division: { type: String },
//   subjectIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subject' }],
//   faceEncoding: { type: [Number], default: [] },
// }, {
//   timestamps: true
// });

// const Student = mongoose.model('Student', studentSchema);
// export default Student;
