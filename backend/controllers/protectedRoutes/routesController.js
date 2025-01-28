const AdminRoutes = (req, res) => {
    const isAdmin = req.session && req.session.user && req.session.user.role === 'Admin';

    if (isAdmin) {
        res.status(200).json({ success: true, authenticated: true, message: 'Admin authorization successful' });
    } else if (req.session && req.session.user) {
        res.redirect('/403');
    } else {
        res.redirect('/adminlogin');
    }
}

const DepartmentRoutes = (req, res) => {
    const isDepartment = req.session && req.session.user && req.session.user.role === 'Department Admin';

    if (isDepartment) {
        res.status(200).json({ success: true, authenticated: true, message: 'Department Admin authorization successful' });
    } else if (req.session && req.session.user) {
        res.redirect('/403');
    } else {
        res.redirect('/departmentlogin');
    }
}

const FacultyRoutes = (req, res) => {
    const isFaculty = req.session && req.session.user && req.session.user.role === 'Faculty';

    if (isFaculty) {
        res.status(200).json({ success: true, authenticated: true, message: 'Faculty authorization successful' });
    } else if (req.session && req.session.user) {
        res.redirect('/403');
    } else {
        res.redirect('/facultylogin');
    }
}

const StudentRoutes = (req, res) => {
    const isStudent = req.session && req.session.user && req.session.user.role === 'Student';

    if (isStudent) {
        res.status(200).json({ success: true, authenticated: true, message: 'Student authorization successful' });
    } else if (req.session && req.session.user) {
        res.redirect('/403');
    } else {
        res.redirect('/studentlogin');
    }
}

const LibrarianRoutes = (req, res) => {
    const isLibrarian = req.session && req.session.user && req.session.user.role === 'Librarian';

    if (isLibrarian) {
        res.status(200).json({ success: true, authenticated: true, message: 'Librarian authorization successful' });
    } else if (req.session && req.session.user) {
        res.redirect('/403');
    } else {
        res.redirect('/librarianlogin');
    }
}

const LibraryMemberRoutes = (req, res) => {
    const isLibraryMember = req.session && req.session.user && req.session.user.role === 'LibraryMember';

    if (isLibraryMember) {
        res.status(200).json({ success: true, authenticated: true, message: 'Library Member authorization successful' });
    } else if (req.session && req.session.user) {
        res.redirect('/403');
    } else {
        res.redirect('/libraryMemberlogin');
    }
}

export default { AdminRoutes, DepartmentRoutes, FacultyRoutes, StudentRoutes, LibrarianRoutes, LibraryMemberRoutes };