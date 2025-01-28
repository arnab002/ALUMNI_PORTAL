import MaterialModel from '../../models/Material.js'
import { io, notifications } from '../../index.js'

const AddMaterial = async (req, res) => {
    try {
        const material = await MaterialModel.create(req.body);

        if (material) {
            const notification = {
                title: material.title,
                message: 'Material Uploaded',
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

            io.emit('new-material', notification);

            res.status(200).json({ success: true, message: 'Material Published Successfully' });
        } else {
            res.status(401).json({ success: false, message: 'Process Failed' });
        }
    }
    catch (error) {
        console.error('Error during creation', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

const MaterialDetails = async (req, res) => {
    MaterialModel.find()
        .then(material => res.json(material))
        .catch(err => res.json(err))
}

const MaterialCount = async (req, res) => {
    try {
        const searchParams = req.query;
        let materials;

        if (Object.keys(searchParams).length === 0) {
            materials = await MaterialModel.countDocuments();
        } else {
            materials = await MaterialModel.countDocuments(searchParams);
        }

        const data = {
            success: true,
            message: "Count Successful!",
            materials,
        };
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

const FilteredMaterialDetails = async (req, res) => {
    const searchParams = req.body;
    try {
        let material = await MaterialModel.find(searchParams);
        if (!material) {
            return res.status(400).json({ success: false, message: "No Material Found" });
        }
        const data = {
            success: true,
            message: "Material Found!",
            material,
        };
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

const FilteredSubjectMaterial = async (req, res) => {
    try {
        const { subject } = req.body;
        const materials = await MaterialModel.find({ subject });

        res.status(200).json({ material: materials });
    } catch (error) {
        console.error('Error fetching materials:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const SingleMaterialDetails = async (req, res) => {
    MaterialModel.findById(req.params.id)
        .then(material => res.json(material))
        .catch(err => res.json(err))
}

const EditMaterial = async (req, res) => {
    try {
        const existingMaterial = await MaterialModel.findByIdAndUpdate(req.params.id, req.body);

        if (!existingMaterial) {
            return res.status(404).json({ error: 'Material not found' });
        }

        res.status(200).json({ success: true, message: 'Material Updated Successfully' });

    } catch (error) {
        console.error('Error updating Material', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const DeleteMaterial = async (req, res) => {
    try {
        const deletedMaterial = await MaterialModel.findByIdAndDelete(req.params.id);

        if (!deletedMaterial) {
            return res.status(404).json({ message: 'Material not found' });
        }
        return res.status(200).json({ message: 'Material deleted successfully' });

    } catch (error) {
        console.error('Error deleting Material', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

export default {AddMaterial, MaterialDetails, MaterialCount, FilteredMaterialDetails, FilteredSubjectMaterial, SingleMaterialDetails, EditMaterial, DeleteMaterial};