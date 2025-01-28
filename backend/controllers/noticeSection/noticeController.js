import NoticeModel from '../../models/Notice.js'
import { io, notifications } from '../../index.js';

const AddNotice = async (req, res) => {
    try {
        const notice = await NoticeModel.create(req.body);

        if (notice) {

            const notification = {
                title: notice.title,
                message: 'Notice Uploaded',
                status: 'New',
                type: 'danger',
                createdAt: new Date()
            };

            // Add to in-memory notifications
            notifications.push(notification);

            // Keep only those from the last 24 hours
            const currentTime = new Date();
            for (let i = notifications.length - 1; i >= 0; i--) {
                if (currentTime - new Date(notifications[i].createdAt) >= 24 * 60 * 60 * 1000) {
                    notifications.splice(i, 1);
                }
            }

            io.emit('new-notice', notification);
            res.status(200).json({ success: true, message: 'Notice Published Successfully' });
        } else {
            res.status(401).json({ success: false, message: 'Process Failed' });
        }
    }
    catch (error) {
        console.error('Error during creation', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

const NoticeDetails = async (req, res) => {
    const searchParams = req.body;
    NoticeModel.find(searchParams)
        .then(notice => res.json(notice))
        .catch(err => res.json(err))
}

const FilteredNoticeDetails = async (req, res) => {
    const searchParams = req.body;
    try {
        let notice = await NoticeModel.find(searchParams);
        if (!notice) {
            return res.status(400).json({ success: false, message: "No Notice Found" });
        }
        const data = {
            success: true,
            message: "Notice Found!",
            notice,
        };
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

const NewNoticeDetails = async (req, res) => {
    try {
        const { lastFetchedTimestamp, type } = req.query;

        const searchParams = lastFetchedTimestamp
            ? { timestamp: { $gt: new Date(lastFetchedTimestamp) } }
            : {};

        if (type) {
            searchParams.type = type;
        }

        let query = NoticeModel.find(searchParams);

        const notices = await query.exec();

        res.json(notices);
    } catch (error) {
        console.error('Error fetching notices:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const SingleNoticeDetails = async (req, res) => {
    NoticeModel.findById(req.params.id)
        .then(notices => res.json(notices))
        .catch(err => res.json(err))
}

const NoticeCount = async (req, res) => {
    try {
        const searchParams = req.query;
        let notices;

        if (Object.keys(searchParams).length === 0) {
            notices = await NoticeModel.countDocuments();
        } else {
            notices = await NoticeModel.countDocuments(searchParams);
        }

        const data = {
            success: true,
            message: "Count Successful!",
            notices,
        };
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

const EditNotice = async (req, res) => {
    try {
        const existingNotice = await NoticeModel.findByIdAndUpdate(req.params.id, req.body);

        if (!existingNotice) {
            return res.status(404).json({ error: 'Notice not found' });
        }

        res.status(200).json({ success: true, message: 'Notice Updated Successfully' });

    } catch (error) {
        console.error('Error updating notice:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const DeleteNotice = async (req, res) => {
    try {
        const deletedNotice = await NoticeModel.findByIdAndDelete(req.params.id);

        if (!deletedNotice) {
            return res.status(404).json({ message: 'Notice not found' });
        }
        return res.status(200).json({ message: 'Notice deleted successfully' });

    } catch (error) {
        console.error('Error deleting notice:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

export default { AddNotice, NoticeDetails, FilteredNoticeDetails, NewNoticeDetails, SingleNoticeDetails, NoticeCount, EditNotice, DeleteNotice };