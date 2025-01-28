import mongoose from "mongoose";

const TimetableSchema = new mongoose.Schema({
    Subject: String,
    Department: String,
    Semester: String,
    Faculty: String,
    StartTime: String,
    EndTime: String
})

const TimetableModel = mongoose.model("Timetable", TimetableSchema)
export default TimetableModel