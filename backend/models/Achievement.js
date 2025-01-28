import mongoose from "mongoose";

const AchievementSchema = new mongoose.Schema({
    title: String,
    description: String,
    image: String
})

const AchievementModel = mongoose.model("Achievement", AchievementSchema)
export default AchievementModel