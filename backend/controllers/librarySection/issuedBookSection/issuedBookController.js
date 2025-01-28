import IssueBookModel from '../../../models/IssueBook.js'

const AddIssuedBook = async (req, res) => {
    try {
        let issuebook = await IssueBookModel.findOne({
            isbnNo: req.body.isbnNo,
        });
        if (issuebook) {
            return res.status(400).json({
                success: false,
                message: "Book With This ISBN No. Already Issued",
            });
        }
        issuebook = await IssueBookModel.create(req.body);
        const data = {
            success: true,
            message: "Book Issued Successfully!",
            issuebook,
        };
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

const IssuedBookDetails = async (req, res) => {
    IssueBookModel.find()
        .then(issuebooks => res.json(issuebooks))
        .catch(err => res.json(err))
}

const IssuedBookCount = async (req, res) => {
    try {
        const searchParams = req.query;
        let issuedbooks;

        if (Object.keys(searchParams).length === 0) {
            issuedbooks = await IssueBookModel.countDocuments();
        } else {
            issuedbooks = await IssueBookModel.countDocuments(searchParams);
        }

        const data = {
            success: true,
            message: "Count Successful!",
            issuedbooks,
        };
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

const FilteredIssuedBook = async (req, res) => {
    const searchParams = req.body;
    try {
        let issuebook = await IssueBookModel.find(searchParams);
        if (!issuebook) {
            return res.status(400).json({ success: false, message: "No book is Issued" });
        }
        const data = {
            success: true,
            message: "book Details Found!",
            issuebook,
        };
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

const DeleteIssuedBook = async (req, res) => {
    try {
        const deletedIssueBook = await IssueBookModel.findByIdAndDelete(req.params.id);

        if (!deletedIssueBook) {
            return res.status(404).json({ message: 'Issue Book not found' });
        }
        return res.status(200).json({ message: 'Issued Book removed successfully' });

    } catch (error) {
        console.error('Error removing Issued Book', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

const ReturnBook = async (req, res) => {
    try {
        const existingBook = await IssueBookModel.findByIdAndUpdate(req.params.id, req.body);

        if (!existingBook) {
            return res.status(404).json({ error: 'Book not found' });
        }

        res.status(200).json({ success: true, message: 'Book Returned Successfully' });

    } catch (error) {
        console.error('Error returning Book', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const IssuedBookStatus = async (req, res) => {
    const { bookId } = req.params;
    const { status, returnDate } = req.body;

    try {
        const updatedBook = await IssueBookModel.findByIdAndUpdate(
            bookId,
            { status, returnDate },
            { new: true }
        );

        if (!updatedBook) {
            return res.status(404).json({ error: 'Book not found' });
        }

        res.json(updatedBook);
    } catch (error) {
        console.error('Error updating book status:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

export default {AddIssuedBook, IssuedBookDetails, IssuedBookCount, FilteredIssuedBook, DeleteIssuedBook, ReturnBook, IssuedBookStatus };