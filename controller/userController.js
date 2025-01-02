const user = require('../models/userModels');
const bcrypt = require('bcrypt');

exports.createUser = async (req, res) => {
    try {
        let { name, email, password } = req.body

        let checkEmailExist = await user.findOne({ email })

        if (checkEmailExist) {
            return res.status(409).json({ status: 409, success: false, message: "Email Alredy Exist..." })
        }

        let salt = await bcrypt.genSalt(10);
        let hasPassword = await bcrypt.hash(password, salt);

        checkEmailExist = await user.create({
            name,
            email,
            password: hasPassword
        });

        return res.status(201).json({ status: 201, success: true, message: "User Created SuccessFully...", data: checkEmailExist });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: 500, success: false, message: error.message })
    }
}

exports.getAllUsers = async (req, res) => {
    try {
        let page = parseInt(req.query.page)
        let pageSize = parseInt(req.query.pageSize);

        if (page < 1 || pageSize < 1) {
            return res.status(401).json({ status: 401, success: false, message: "Page And PageSize Cann't Be Less Than 1" })
        }

        let paginatedUsers;

        paginatedUsers = await user.find();

        let count = paginatedUsers.length

        if (count === 0) {
            return res.status(404).json({ status: 404, success: false, message: "User Not Found" })
        }

        if (page && pageSize) {
            let startIndex = (page - 1) * pageSize
            let lastIndex = (startIndex + pageSize)
            paginatedUsers = await paginatedUsers.slice(startIndex, lastIndex)
        }

        return res.status(200).json({ status: 200, success: true, totalUser: count, message: "All Users Found SuccessFully....", data: paginatedUsers });

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, success: false, message: error.message })
    }
}

exports.getUserById = async (req, res) => {
    try {
        let id = req.user._id

        let getUserId = await user.findById(id)

        if (!getUserId) {
            return res.status(404).json({ status: 404, success: false, message: "User Not Found" })
        }

        return res.status(200).json({ status: 200, success: true, message: "User Found SuccessFully...", data: getUserId });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: 500, success: false, message: error.message })
    }
}

exports.updateUserById = async (req, res) => {
    try {
        let id = req.user._id

        let updateUserId = await user.findById(id)

        if (!updateUserId) {
            return res.status(404).json({ status: 404, success: false, message: "User Not Found" })
        }

        updateUserId = await user.findByIdAndUpdate(id, { ...req.body }, { new: true });

        return res.status(200).json({ status: 200, success: true, message: "User Updated SuccessFully...", data: updateUserId });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: 500, message: error.message })
    }
}

exports.deleteUserById = async (req, res) => {
    try {
        let id = req.user._id

        let deleteUserId = await user.findById(id)

        if (!deleteUserId) {
            return res.status(404).json({ status: 404, success: false, message: "User Not Found" })
        }

        await user.findByIdAndDelete(id);

        return res.status(200).json({ status: 200, success: true, message: "User Deleted SuccessFully..." });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: 500, success: false, message: error.message })
    }
}
