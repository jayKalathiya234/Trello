const board = require('../models/boardModels')
const nodemailer = require('nodemailer')
const crypto = require('crypto');

exports.createBoard = async (req, res) => {
    try {
        let { workSpaceId, title, visibility, label, members, invitationLink, color } = req.body;

        const staticLabels = [
            { data: null, color: '#5E4DB2' },
            { data: null, color: '#7F5F01' },
            { data: null, color: '#206A83' },
            { data: null, color: '#6CC3E0' },
            { data: null, color: '#8C9BAB' },
        ];
        if (!label || label.length === 0) {
            label = staticLabels;
        }

        let checkExistWorkSpaceId = await board.findOne({ workSpaceId, title })

        if (checkExistWorkSpaceId) {
            return res.status(409).json({ status: 409, success: false, message: "Board Alredy Exist...." })
        }

        invitationLink = crypto.randomBytes(10).toString('hex');

        checkExistWorkSpaceId = await board.create({
            workSpaceId,
            title,
            visibility,
            label,
            members: [
                { user: req.user._id, role: 'admin' }
            ],
            invitationLink,
            color
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

        paginatedBord = await board.find({ closeStatus: false }).populate('workSpaceId').populate('members.user')

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

        const { title, visibility, color} = req.body;

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
        Board.color = color || Board.color;

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

        let getWorkSpaceIdData = await board.find({ workSpaceId: id, closeStatus: false }).populate('workSpaceId').populate('members.user')

        if (!getWorkSpaceIdData) {
            return res.status(404).json({ status: 404, success: false, message: "board Not Found" })
        }

        return res.status(200).json({ status: 200, success: true, message: "Board Found SuccessFully...", data: getWorkSpaceIdData })

    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: 500, success: false, message: error.message })
    }
}

exports.getAllBoardUserMembers = async (req, res) => {
    try {
        const id = req.params.id;

        const boards = await board.find({ workSpaceId: id, closeStatus: false }).populate('members.user', 'name email')

        if (!boards || boards.length === 0) {
            return res.status(404).json({ status: 404, success: false, message: "No boards found in this workspace" });
        }

        const userBoardsMap = new Map();

        boards.forEach(board => {
            board.members.forEach(member => {
                const userId = member.user._id.toString();
                const userData = member.user;

                if (!userBoardsMap.has(userId)) {
                    userBoardsMap.set(userId, {
                        userData,
                        boards: [],
                    });
                }

                const userBoards = userBoardsMap.get(userId);

                userBoards.boards.push({
                    _id: board._id,
                    title: board.title,
                    visibility: board.visibility,
                    role: member.role,
                    totalMembers: board.members.length,
                    color: board.color
                });
            });
        });

        const usersData = Array.from(userBoardsMap.values());

        return res.status(200).json({ status: 200, success: true, message: "Board members data retrieved successfully", users: usersData, totalBoards: boards.length, });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, success: false, message: error.message });
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
            return res.status(404).json({
                status: 404,
                success: false,
                message: 'Board not found'
            });
        }

        const loggedInUser = checkBoard.members.find(
            member => member.user.toString() === req.user._id.toString()
        );

        if (!loggedInUser || loggedInUser.role !== 'admin') {
            return res.status(403).json({
                status: 403,
                success: false,
                message: 'Only admins can remove members'
            });
        }

        const memberToRemove = checkBoard.members.find(
            member => member.user.toString() === userId
        );

        if (!memberToRemove) {
            return res.status(404).json({
                status: 404,
                success: false,
                message: 'Member to remove not found'
            });
        }

        const isAdminRemovingSelf = req.user._id.toString() === userId;

        if (isAdminRemovingSelf) {
            const otherAdmins = checkBoard.members.filter(
                member => member.role === 'admin' && member.user.toString() !== userId
            );

            if (otherAdmins.length === 0) {
                const newAdmin = checkBoard.members.find(
                    member => member.role === 'member' && member.user.toString() !== userId
                );

                if (!newAdmin) {
                    return res.status(400).json({ status: 400, success: false, message: 'Cannot remove last admin when no other members exist' });
                }

                newAdmin.role = 'admin';
            }
        } else {
            if (memberToRemove.role === 'admin') {
                return res.status(403).json({ status: 403, success: false, message: 'Cannot remove other admins' });
            }
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

exports.startedBoard = async (req, res) => {
    try {
        let id = req.params.id

        let { status } = req.body;

        let checkBoard = await board.findById(id);

        if (!checkBoard) {
            return res.status(404).json({ status: 404, success: false, message: "Board not found" });
        }

        const isMember = checkBoard.members.some(
            member => member.user.toString() === req.user._id.toString()
        );

        if (!isMember) {
            return res.status(403).json({ status: 403, success: false, message: "Only board members can change the board status" });
        }

        checkBoard.status = status;
        await checkBoard.save();

        return res.status(200).json({ status: 200, success: true, message: "Board status updated successfully", data: checkBoard });

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, success: false, message: error.message })
    }
}

exports.getAllStartedBoadr = async (req, res) => {
    try {
        let id = req.params.id

        const startedBoards = await board.find({
            'workSpaceId': id,
            'members.user': req.user._id,
            'status': true
        })

        if (!startedBoards.length) {
            return res.status(404).json({ status: 404, success: false, message: "No started boards found" });
        }

        return res.status(200).json({ status: 200, success: true, message: "Started boards retrieved successfully", data: startedBoards });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: 500, success: false, message: error.message });
    }
}

exports.setBoardCloseStatus = async (req, res) => {
    try {
        let id = req.params.id

        let { closeStatus } = req.body

        let getBoardData = await board.findById(id)

        if (!getBoardData) {
            return res.status(404).json({ status: 404, success: false, message: "Board Not Found" })
        }

        const isMember = getBoardData.members.some(
            member => member.user.toString() === req.user._id.toString()
        );

        if (!isMember) {
            return res.status(403).json({ status: 403, success: false, message: "Only board members can change the board status" })
        }

        getBoardData.closeStatus = closeStatus

        await getBoardData.save();

        return res.status(200).json({ status: 200, success: true, message: "Board Close status Updated SuccessFully...", data: getBoardData })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, success: false, message: error.message })
    }
}

exports.getAllCloseBoard = async (req, res) => {
    try {
        let id = req.params.id

        let allCloseBoard = await board.find({ workSpaceId: id, closeStatus: true }).populate('workSpaceId')

        if (!allCloseBoard) {
            return res.status(404).json({ status: 404, success: false, message: "Close Board Not Found" })
        }

        return res.status(200).json({ status: 200, count: allCloseBoard.length, success: true, message: "All Close Board Data Found SuccessFully...", data: allCloseBoard })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, success: false, message: error.message })
    }
}


exports.getAllBoardLabel = async (req, res) => {
    try {
        let id = req.params.id;

        let boardData = await board.findById(id);

        if (!boardData) {
            return res.status(404).json({ status: 404, success: false, message: "Board Not Found" });
        }

        return res.status(200).json({ status: 200, success: true, message: "Board labels retrieved successfully", labels: boardData.label });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: 500, success: false, message: error.message });
    }
}
exports.createBoardLabel = async (req, res) => {
   
        try {
            let id = req.params.id
    
            let { labelName, color } = req.body
    
            let checkCardId = await board.findById(id)
    
            if (!checkCardId) {
                return res.status(404).json({ status: 404, success: false, message: "Board Not Found" })
            }
    
            checkCardId = await board.findByIdAndUpdate(
                id,
                { $push: { label: { data: labelName, color: color } } },
                { new: true }
            );
    
            return res.status(200).json({ status: 200, success: true, message: "label Added SuccessFully...", data: checkCardId })
    
        } catch (error) {
            console.log(error)
            return res.status(500).json({ status: 500, success: false, message: error.message })
        }
}
exports.updateBoardLabel = async (req, res) => {
    try {
        let id = req.params.id

        let { labelName, color, status } = req.body

        let updateCardId = await board.findOne({ 'label._id': id })

        if (!updateCardId) {
            return res.status(404).json({ status: 404, success: false, message: "Board Not Found" })
        }

        updateCardId = await board.findOneAndUpdate(
            { 'label._id': id },
            { $set: { 'label.$.data': labelName, 'label.$.color': color, 'label.$.status': status } },
            { new: true }
        );

        return res.status(200).json({ status: 200, success: true, message: "label Edited SuccessFully...", data: updateCardId });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: 500, success: false, message: error.message })
    }
}

exports.deleteBoardLabel = async (req, res) => {
    try {
        let id = req.params.id

        let getLableDataId = await board.findOne({ "label._id": id })

        if (!getLableDataId) {
            return res.status(404).json({ status: 404, success: false, message: "Label Not Found" })
        }

        getLableDataId = await board.findOneAndUpdate(
            { "label._id": id },
            { $pull: { label: { _id: id } } },
            { new: true }
        )

        return res.status(200).json({ status: 200, success: true, message: "Label Remove SuccessFully..." })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, success: false, message: error.message })
    }
}