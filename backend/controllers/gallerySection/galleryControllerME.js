import GalleryMEModel from '../../models/GalleryME.js'

const AddGallery = async (req, res) => {
    try {
        const gallery = await GalleryMEModel.create(req.body);

        if (gallery) {
            res.status(200).json({ success: true, message: 'Image Saved Successfully' });
        } else {
            res.status(401).json({ success: false, message: 'Process Failed' });
        }
    }
    catch (error) {
        console.error('Error during creation', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

const GalleryDetails = async (req, res) => {
    GalleryMEModel.find()
        .then(gallery => res.json(gallery))
        .catch(err => res.json(err))
}

const SingleGalleryDetails = async (req, res) => {
    GalleryMEModel.findById(req.params.id)
        .then(gallery => res.json(gallery))
        .catch(err => res.json(err))
}

const EditGallery = async (req, res) => {
    try {
        const existingGallery = await GalleryMEModel.findByIdAndUpdate(req.params.id, req.body);

        if (!existingGallery) {
            return res.status(404).json({ error: 'Gallery not found' });
        }

        res.status(200).json({ success: true, message: 'Gallery Updated Successfully' });

    } catch (error) {
        console.error('Error updating Gallery', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const DeleteGallery = async (req, res) => {
    try {
        const deletedGallery = await GalleryMEModel.findByIdAndDelete(req.params.id);

        if (!deletedGallery) {
            return res.status(404).json({ message: 'Gallery not found' });
        }
        return res.status(200).json({ message: 'Gallery deleted successfully' });

    } catch (error) {
        console.error('Error deleting Gallery', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

export default {AddGallery, GalleryDetails, SingleGalleryDetails, EditGallery, DeleteGallery};