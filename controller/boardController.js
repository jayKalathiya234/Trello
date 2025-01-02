const board = require('../models/boardModels')
const nodemailer = require('nodemailer')
const crypto = require('crypto');

exports.createBoard = async (req, res) => {
    try {
        let { workSpaceId, title, visibility, members, invitationLink } = req.body

        let checkExistWorkSpaceId = await board.findOne({ workSpaceId, title })

        if (checkExistWorkSpaceId) {
            return res.status(409).json({ status: 409, success: false, message: "Board Alredy Exist...." })
        }

        invitationLink = crypto.randomBytes(10).toString('hex');

        checkExistWorkSpaceId = await board.create({
            workSpaceId,
            title,
            visibility,
            members: [
                { user: req.user._id, role: 'admin' }
            ],
            invitationLink
        })

        return res.status(201).json({ status: 201, success: true, message: "Board Create SuccessFully...", data: checkExistWorkSpaceId });

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, success: false, message: error.message })
    }
}

exports.getAllBoards = async (req, res) => {
    try {
        let page = parseInt(req.query.page)
        let pageSize = parseInt(req.query.pageSize)

        if (page < 1 || pageSize < 1) {
            return res.status(401).json({ status: 401, success: false, message: "Page And PageSize Cann't Be Less Than 1" })
        }

        let paginatedBord;

        paginatedBord = await board.find().populate('workSpaceId').populate('members.user')

        let count = paginatedBord.length

        if (count === 0) {
            return res.status(404).json({ status: 404, success: false, message: "Board Not Found" })
        }

        if (page && pageSize) {
            let startIndex = (page - 1) * pageSize;
            let lastIndex = (startIndex + pageSize)
            paginatedBord = await paginatedBord.slice(startIndex, lastIndex)
        }

        return res.status(200).json({ status: 200, success: true, totalBoard: count, message: "All Board Found SuccessFully....", data: paginatedBord });

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, success: false, message: error.message })
    }
}

exports.getBorderById = async (req, res) => {
    try {
        let id = req.params.id

        let getBoardId = await board.findById(id).populate('workSpaceId').populate('members.user')

        if (!getBoardId) {
            return res.status(404).json({ status: 404, success: false, message: "Board Not Found" })
        }

        return res.status(200).json({ status: 200, success: true, message: "Board Found SuccessFully...", data: getBoardId });

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, success: false, message: error.message });
    }
}

exports.updateBoardById = async (req, res) => {
    try {
        let id = req.params.id

        const { title, visibility } = req.body;

        const Board = await board.findById(id);

        if (!Board) {
            return res.status(404).json({ status: 404, success: false, message: 'Board not found' });
        }

        const userMembership = Board.members.find(
            member => member.user.toString() === req.user._id.toString()
        );

        if (!userMembership || userMembership.role !== 'admin') {
            return res.status(403).json({ status: 403, success: false, message: 'Not authorized to update this board' });
        }

        Board.title = title || Board.title;
        Board.visibility = visibility || Board.visibility;

        await Board.save();

        return res.status(200).json({ status: 200, success: true, message: 'Board updated successfully', data: Board });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: 500, success: false, error: error.message });
    }
};

exports.deleteBoardById = async (req, res) => {
    try {
        let id = req.params.id

        let deleteBoardId = await board.findById(id)

        if (!deleteBoardId) {
            return res.status(404).json({ status: 404, success: false, message: "Board Not Found" })
        }

        const userMembership = deleteBoardId.members.find(
            member => member.user.toString() === req.user._id.toString()
        );

        if (!userMembership || userMembership.role !== 'admin') {
            return res.status(403).json({ status: 403, success: false, message: 'Not authorized to Delete this board' });
        }

        await board.findByIdAndDelete(id)

        return res.status(200).json({ status: 200, success: true, message: "Board Delete SuccessFully..." })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, success: false, message: error.message });
    }
}

exports.getBoardByWorkSpaceId = async (req, res) => {
    try {
        let id = req.params.id

        let getWorkSpaceIdData = await board.find({ workSpaceId: id })

        if (!getWorkSpaceIdData) {
            return res.status(404).json({ status: 404, success: false, message: "board Not Found" })
        }

        return res.status(200).json({ status: 200, success: true, message: "Board Found SuccessFully...", data: getWorkSpaceIdData })

    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: 500, success: false, message: error.message })
    }
}

exports.joinBordByInvitationLink = async (req, res) => {
    try {
        let id = req.params.id

        let { role } = req.body

        let checkInvitationLink = await board.findOne({ invitationLink: id })

        if (!checkInvitationLink) {
            return res.status(404).json({ status: 404, success: false, message: 'Board Not Found' })
        }

        const existingMember = checkInvitationLink.members.find(
            member => member.user.toString() === req.user._id.toString()
        );

        if (existingMember) {
            return res.status(400).json({ status: 404, success: false, message: 'You are already a member of this board' });
        }

        checkInvitationLink.members.push({
            user: req.user._id,
            role: role
        });

        await checkInvitationLink.save();

        return res.status(200).json({ status: 200, success: true, message: "board Join SuccessFully...", data: checkInvitationLink });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: 500, success: false, message: error.message })
    }
}

exports.updateMemberRole = async (req, res) => {
    try {
        let id = req.params.id

        let { userId, role } = req.body

        let checkBoard = await board.findById(id)

        if (!checkBoard) {
            return res.status(404).json({ status: 404, success: false, message: "Board Not Found" })
        }

        const userMember = checkBoard.members.find(
            member => member.user.toString() === req.user._id.toString()
        )

        if (!userMember || userMember.role !== 'admin') {
            return res.status(403).json({ status: 403, success: false, message: "Not authorized to update member role" })
        }

        const memberToUpdate = checkBoard.members.find(
            member => member.user.toString() === userId.toString()
        )

        if (!memberToUpdate) {
            return res.status(404).json({ status: 404, success: false, message: "Member Not Found In Board" })
        }

        if (memberToUpdate.role === 'admin') {
            return res.status(404).json({ status: 404, success: false, message: "Cannot change Board admin's role" })
        }

        memberToUpdate.role = role

        await checkBoard.save();

        return res.status(200).json({ status: 200, success: true, message: "Member Role Updated SuccessFully...", data: checkBoard });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: 500, success: false, message: error.message })
    }
}

exports.removeMemberFromBoard = async (req, res) => {
    try {
        let id = req.params.id;
        let { userId } = req.body;

        const checkBoard = await board.findById(id);

        if (!checkBoard) {
            return res.status(404).json({ status: 404, success: false, message: 'Board not found' });
        }

        const userMembership = checkBoard.members.find(
            member => member.user.toString() === req.user._id.toString()
        );

        if (!userMembership || userMembership.role !== 'admin') {
            return res.status(403).json({ status: 403, success: false, message: 'Not authorized to remove members' });
        }

        checkBoard.members = checkBoard.members.filter(
            member => member.user.toString() !== userId
        );

        await checkBoard.save();

        return res.status(200).json({ status: 200, success: true, message: 'Member removed successfully', data: checkBoard });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: 500, success: false, error: error.message });
    }
};

exports.getBoardJoinInvitaionLingUsingEmail = async (req, res) => {
    try {
        let id = req.params.id

        let getBoardData = await board.findById(id)

        if (!getBoardData) {
            return res.status(404).json({ status: 404, success: false, message: "Board Not Found" })
        }

        let { email } = req.body

        const transport = nodemailer.createTransport({
            service: "Gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Join Invitation You To a Trllo Board",
            text: `You have been invited to join the board http://localhost:6000/api/joinBoardByInvitation/${getBoardData.invitationLink}`
        }

        transport.sendMail(mailOptions, (error) => {
            if (error) {
                console.log(error);
                return res.status(500).json({ status: 500, success: false, message: error.message })
            }
            return res.status(200).json({ status: 200, success: true, message: "Join Board Invitaion SuccessFully..." });
        })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, success: false, message: error.message })
    }
}
