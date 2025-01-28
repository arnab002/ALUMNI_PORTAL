import AttendanceModel from '../../models/Attendance.js'

const StudentAttendance = async (req, res) => {
    const { attendanceData } = req.body;

    if (!attendanceData || !Array.isArray(attendanceData) || attendanceData.length === 0) {
        return res.status(400).json({ error: 'Invalid attendance data.' });
    }

    try {
        const bulkUpdateOps = attendanceData.map((attendanceRecord) => {
            // Check if an attendance record already exists for the given student and date
            return {
                updateOne: {
                    filter: {
                        enrollmentNo: attendanceRecord.enrollmentNo,
                        date: attendanceRecord.date,
                        subject: attendanceRecord.subject,
                    },
                    update: {
                        $set: {
                            fullName: attendanceRecord.fullName,
                            department: attendanceRecord.department,
                            semester: attendanceRecord.semester,
                            subject: attendanceRecord.subject,
                            attendance: attendanceRecord.attendance,
                        },
                    },
                    upsert: true,
                },
            };
        });

        await AttendanceModel.bulkWrite(bulkUpdateOps);

        res.json({ success: true });
    } catch (error) {
        console.error('Error submitting attendance:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const FilteredStudentAttendanceDetails = async (req, res) => {
    const searchParams = req.body;
    try {
        let studentattendance = await AttendanceModel.find(searchParams);
        if (!studentattendance) {
            return res.status(400).json({ success: false, message: "No Student Attendance Found" });
        }
        const data = {
            success: true,
            message: "Student Attendance Details Found!",
            studentattendance,
        };
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

const FilteredStudentAttendanceDetailsByDateRange = async (req, res) => {
    const { department, semester, enrollmentNo, subject, fromDate, toDate } = req.body;

    try {
        let query = {
            department,
            semester,
            enrollmentNo,
            subject,
        };

        if (enrollmentNo !== 'allStudents') {
            query.enrollmentNo = enrollmentNo;
        }

        if (fromDate && toDate) {
            query.date = {
                $gte: fromDate,
                $lte: toDate,
            };
        }

        const studentAttendance = await AttendanceModel.find(query);
        res.status(200).json({ studentattendance: studentAttendance });
    } catch (error) {
        console.error('Error fetching Student Attendance', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const FilteredStudentAttendanceDetailsByDate = async (req, res) => {
    const { department, semester, enrollmentNo, subject, date } = req.body;

    try {
        let query = {
            department,
            semester,
            enrollmentNo,
            subject,
            date,
        };

        if (enrollmentNo !== 'allStudents') {
            query.enrollmentNo = enrollmentNo;
        }

        const studentAttendance = await AttendanceModel.find(query);
        res.status(200).json({ studentattendance: studentAttendance });
    } catch (error) {
        console.error('Error fetching Student Attendance', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

export default {StudentAttendance, FilteredStudentAttendanceDetails, FilteredStudentAttendanceDetailsByDate, FilteredStudentAttendanceDetailsByDateRange};