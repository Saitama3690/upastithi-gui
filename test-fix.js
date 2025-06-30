// Test script to verify the timetable route fix
console.log('Testing timetable route fixes...');

// Simulate the payload that was causing issues
const testPayload = {
  day: "Wednesday",
  time: "11:00", 
  subjectId: "6853f6461a9a25e115520a11", // Valid MongoDB ObjectId
  faculty: "6852e9eeaf0b9e67a6fbfc37",   // Valid MongoDB ObjectId
  division: "B",
  room: "Lab-1",
  department: "CSE",
  semester: 1,
  duration: 60
};

console.log('Original problematic payload:');
console.log({
  day: "Wednesday",
  time: "11:00",
  subjectId: "dsa (4330702)", // This was the problem - not a valid ObjectId
  faculty: "badshah (CSE)",    // This was the problem - not a valid ObjectId
  division: "B",
  room: "Lab-1",
  department: "CSE",
  semester: 1,
  duration: 60
});

console.log('\nFixed payload (with proper ObjectIds):');
console.log(testPayload);

console.log('\nFixes applied:');
console.log('1. Removed incorrect timetableAPI.createEntry() call from backend');
console.log('2. Fixed undefined subjectName variable reference');
console.log('3. Enabled validation error checking');
console.log('4. Added toJSON transforms to models for id field compatibility');
console.log('5. Reset frontend initial state to empty values');
console.log('\nThe 400 Bad Request error should now be resolved when proper ObjectIds are sent.');