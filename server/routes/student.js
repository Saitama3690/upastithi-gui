// import express from 'express';
// import { body, validationResult } from 'express-validator';
// import Student from '../models/Student.js'; // don't forget the `.js`
// import authenticateToken from '../middleware/authenticateToken.js';
// import requireRole from '../middleware/requireRole.js';

// const router = express.Router();

// // GET all students
// router.get('/', authenticateToken, requireRole(['admin', 'faculty']), async (req, res) => {
//   try {
//     const students = await Student.find().populate('subjectIds');
//     res.json(students);
//   } catch (err) {
//     res.status(500).json({ message: 'Error fetching students' });
//   }
// });

// // CREATE student
// router.post('/', authenticateToken, requireRole(['admin']), [
//   body('name').notEmpty().trim(),
//   body('rollNumber').notEmpty().trim(),
//   body('email').isEmail().optional(),
//   body('department').isIn(['CSE', 'ME', 'CE', 'EE', 'ECE']),
//   body('semester').isInt({ min: 1, max: 8 }),
//   body('division').optional().trim()
// ], async (req, res) => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

//   try {
//     const existing = await Student.findOne({ rollNumber: req.body.rollNumber });
//     if (existing) return res.status(409).json({ message: 'Roll number already exists' });

//     const student = new Student(req.body);
//     await student.save();
//     res.status(201).json({ message: 'Student created', student });
//   } catch (err) {
//     res.status(500).json({ message: 'Server error', error: err.message });
//   }
// });

// // UPDATE student
// router.put('/:id', authenticateToken, requireRole(['admin']), [
//   body('name').optional().notEmpty().trim(),
//   body('rollNumber').optional().notEmpty().trim(),
//   body('email').optional().isEmail(),
//   body('department').optional().isIn(['CSE', 'ME', 'CE', 'EE', 'ECE']),
//   body('semester').optional().isInt({ min: 1, max: 8 }),
//   body('division').optional().trim()
// ], async (req, res) => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

//   try {
//     const updatedStudent = await Student.findByIdAndUpdate(req.params.id, req.body, {
//       new: true,
//       runValidators: true
//     });

//     if (!updatedStudent) return res.status(404).json({ message: 'Student not found' });
//     res.json({ message: 'Student updated', student: updatedStudent });
//   } catch (err) {
//     res.status(500).json({ message: 'Server error', error: err.message });
//   }
// });

// // DELETE student
// router.delete('/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
//   try {
//     const deleted = await Student.findByIdAndDelete(req.params.id);
//     if (!deleted) return res.status(404).json({ message: 'Student not found' });
//     res.json({ message: 'Student deleted' });
//   } catch (err) {
//     res.status(500).json({ message: 'Server error', error: err.message });
//   }
// });

// export default router;
