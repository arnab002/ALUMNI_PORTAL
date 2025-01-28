import AchievementModel from "../../models/Achievement.js";

const AddAchievement = async (req, res) => {
    try {
        const achievement = await AchievementModel.create(req.body);

        if (achievement) {
            res.status(200).json({ success: true, message: 'Achievement Created Successfully' });
        } else {
            res.status(401).json({ success: false, message: 'Process Failed' });
        }
    }
    catch (error) {
        console.error('Error during creation', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

const AchievementDetails = async (req, res) => {
    AchievementModel.find()
        .then(achievement => res.json(achievement))
        .catch(err => res.json(err))
}

const SingleAchievementDetails = async (req, res) => {
    AchievementModel.findById(req.params.id)
        .then(achievements => res.json(achievements))
        .catch(err => res.json(err))
}

const EditAchievement = async (req, res) => {
    try {
        const existingAchievement = await AchievementModel.findByIdAndUpdate(req.params.id, req.body);

        if (!existingAchievement) {
            return res.status(404).json({ error: 'Achievement not found' });
        }

        res.status(200).json({ success: true, message: 'Achievement Updated Successfully' });

    } catch (error) {
        console.error('Error updating Achievement:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const DeleteAchievement = async (req, res) => {
    try {
        const deletedAchievement = await AchievementModel.findByIdAndDelete(req.params.id);

        if (!deletedAchievement) {
            return res.status(404).json({ message: 'Achievement not found' });
        }
        return res.status(200).json({ message: 'Achievement deleted successfully' });

    } catch (error) {
        console.error('Error deleting Achievement', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

export default {AddAchievement, AchievementDetails, SingleAchievementDetails, EditAchievement, DeleteAchievement};