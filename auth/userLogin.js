const user = require('../models/userModels')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

exports.loginUser = async (req, res) => {
    try {
        let { email, password } = req.body

        let checkEmailLogin = await user.findOne({ email })

        if (!checkEmailLogin) {
            return res.status(404).json({ status: 404, success: false, message: "Email Not Found" })
        }

        let checkPassword = await bcrypt.compare(password, checkEmailLogin.password)

        if (!checkPassword) {
            return res.status(404).json({ status: 404, success: false, message: "Password Not Match" })
        }

        let token = jwt.sign({ _id: checkEmailLogin._id }, process.env.SECRET_KEY, { expiresIn: '1D' })

        return res.status(200).json({ status: 200, success: true, message: 'User Login SuccessFully...', data: checkEmailLogin, token: token })

    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: 500, success: false, message: error.message })
    }
}

