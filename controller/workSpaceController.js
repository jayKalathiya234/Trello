const workSpace = require('../models/workSpaceModels')
const crypto = require('crypto');
const user = require('../models/userModels');
const nodemailer = require('nodemailer')

exports.createWorkSpace = async (req, res) => {
    try {
        let { name, shortName, description, owner, members, visibility, inviteLink } = req.body

        let checkExistWorkSpace = await workSpace.findOne({ name })

        if (checkExistWorkSpace) {
            return res.status(409).json({ status: 409, message: "WorkSpace Name Alredy Exist..." });
        }

        inviteLink = crypto.randomBytes(10).toString('hex');

        checkExistWorkSpace = await workSpace.create({
            name,
            shortName,
            description,
            owner: req.user._id,
            members: [{ user: req.user._id, role: 'admin' }],
            visibility,
            inviteLink
        })

        return res.status(201).json({ status: 201, message: "WorkSpace Create SuccessFully...", workSpace: checkExistWorkSpace })

    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: 500, message: error.message })
    }
}

exports.getAllWorkSpace = async (req, res) => {
    try {
        let page = parseInt(req.query.page)
        let pageSize = parseInt(req.query.pageSize)

        if (page < 1 || pageSize < 1) {
            return res.status(401).json({ status: 401, message: "Page And PageSize Cann't Be Less Than 1" })
        }

        let paginatedWorkSpace;

        paginatedWorkSpace = await workSpace.find().populate('owner').populate('members.user')

        let count = paginatedWorkSpace.length

        if (count === 0) {
            return res.status(404).json({ status: 404, message: "workSpace Not Found" })
        }

        if (page && pageSize) {
            let startIndex = (page - 1) * pageSize;
            let lastIndex = (startIndex + lastIndex)
            paginatedWorkSpace = await paginatedWorkSpace.slice(startIndex, lastIndex)
        }

        return res.status(200).json({ status: 200, totalWorkSpace: count, message: "All WorkSpace Found SuccessFully...", workSpaces: paginatedWorkSpace });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: 500, message: error.message })
    }
}

exports.getWorkSpaceById = async (req, res) => {
    try {
        let id = req.params.id

        let getWorkSpaceId = await workSpace.findById(id).populate('owner').populate('members.user')

        if (!getWorkSpaceId) {
            return res.status(404).json({ status: 404, message: "WorkSpace Not Found" })
        }

        return res.status(200).json({ status: 200, message: "workSpace Found SuccessFully...", workSpace: getWorkSpaceId });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: 500, message: error.message })
    }
}

exports.updateWorkSpaceById = async (req, res) => {
    try {
        let id = req.params.id

        let updateWorkSpaceId = await workSpace.findById(id)

        if (!updateWorkSpaceId) {
            return res.status(404).json({ status: 404, message: "WorkSpace Not Found" })
        }

        updateWorkSpaceId = await workSpace.findByIdAndUpdate(id, { ...req.body }, { new: true });

        return res.status(200).json({ status: 200, message: "WorkSpace Updated SuccessFully...", workSpace: updateWorkSpaceId });

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, message: error.message })
    }
}

exports.deleteWorkSpaceById = async (req, res) => {
    try {
        let id = req.params.id

        let deleteWorkSpaceId = await workSpace.findById(id)

        if (!deleteWorkSpaceId) {
            return res.status(404).json({ status: 404, message: "WorkSpace Not Found" })
        }

        const removeWorkSpace = deleteWorkSpaceId.members.find(
            member => member.user.toString() === req.user._id.toString()
        );

        if (!removeWorkSpace || removeWorkSpace.role !== 'admin') {
            return res.status(403).json({ status: 403, message: 'Not authorized to Delete this board' });
        }

        await workSpace.findByIdAndDelete(id)

        return res.status(200).json({ status: 200, message: "WorkSpace Delete SuccessFully..." });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: 500, message: error.message })
    }
}

exports.joinWorkSpaceUsingLink = async (req, res) => {
    try {
        let id = req.params.id

        let checkUserIsExist = await user.findById(req.user._id)

        if (!checkUserIsExist) {
            return res.status(404).json({ status: 404, message: "User Not Found" })
        }

        let checkWorkSpace = await workSpace.findOne({ 'inviteLink': id })

        if (!checkWorkSpace) {
            return res.status(404).json({ status: 404, message: "WorkSpace Not Found" })
        }

        const existingMember = checkWorkSpace.members.find((member) => member.user.equals(req.user._id));

        if (existingMember) {
            return res.status(400).json({ status: 400, message: 'User is already a member of the workspace' });
        }

        checkWorkSpace.members.push({ user: req.user._id, role: 'member' });

        await checkWorkSpace.save();

        return res.status(201).json({ status: 201, message: "WorkSpace Member Join SuccessFully...", workSpace: checkWorkSpace })

    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: 500, message: error.message });
    }
}

exports.getMyWorkSpace = async (req, res) => {
    try {

        let myWorkSpace = await workSpace.find({ $or: [{ owner: req.user._id }, { "members.user": req.user._id }] }).populate('owner').populate('members.user')

        if (!myWorkSpace) {
            return res.status(404).json({ status: 404, message: "WorkSpace Not Found" })
        }

        return res.status(200).json({ status: 200, message: "My WorkSpace Found SuccessFully...", workSpace: myWorkSpace });

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, message: error.message })
    }
}

exports.removeMemberFromWorkSpace = async (req, res) => {
    try {
        let id = req.params.id

        let { userId } = req.body

        let checkWorkSpace = await workSpace.findById(id)

        if (!checkWorkSpace) {
            return res.status(404).json({ status: 404, message: "WorkSpace Not Found" })
        }

        let checkUser = checkWorkSpace.members.find(m => m.user.equals(req.user._id));

        // if (!checkUser || (checkUser.role !== 'admin' && !checkWorkSpace.owner.equals(req.user._id))) {
        //     return res.status(403).json({ status: 403, message: "You do not have permission to remove members" })
        // }

        if (checkWorkSpace.owner.equals(userId)) {
            return res.status(400).json({ status: 400, message: "Cannot remove workspace owner" });
        }

        checkWorkSpace.members = checkWorkSpace.members.filter(m => !m.user.equals(userId))

        await checkWorkSpace.save();

        return res.status(200).json({ status: 200, message: "Member Removed Successfully", workSpace: checkWorkSpace });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: 500, message: error.message })
    }
}

exports.updateMemberRoleById = async (req, res) => {
    try {
        let id = req.params.id

        let { userId, role } = req.body

        const workspace = await workSpace.findById(id);

        if (!workspace) {
            return res.status(404).json({ status: 404, message: "Workspace Not Found" });
        }

        const requesterMember = workspace.members.find(m => m.user.equals(req.user._id));
        if (!requesterMember || (requesterMember.role !== 'admin' && !workspace.owner.equals(req.user._id))) {
            return res.status(403).json({ status: 403, message: "You do not have permission to change member roles" });
        }

        if (workspace.owner.equals(userId)) {
            return res.status(400).json({ status: 400, message: "Cannot change workspace owner's role" });
        }

        const memberIndex = workspace.members.findIndex(m => m.user.equals(userId));
        if (memberIndex === -1) {
            return res.status(404).json({ status: 404, message: "Member Not Found in Workspace" });
        }

        workspace.members[memberIndex].role = role;

        await workspace.save();

        return res.status(200).json({ status: 200, message: "Member Role Updated Successfully", workSpace: workspace });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: 500, message: error.message });
    }
}

exports.workSpaceJoinInvitaionLingUsingEmail = async (req, res) => {
    try {
        let id = req.params.id

        let getWorkSpaceData = await workSpace.findById(id)

        if (!getWorkSpaceData) {
            return res.status(404).json({ status: 404, success: false, message: "WorkSpace Not Found" })
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
            subject: "Join Invitation You To a Trllo WorkSpace",
            text: `You have been invited to join the board http://localhost:6000/api/joinWorkSpace/${getWorkSpaceData.inviteLink}`
        }

        transport.sendMail(mailOptions, (error) => {
            if (error) {
                console.log(error);
                return res.status(500).json({ status: 500, success: false, message: error.message })
            }
            return res.status(200).json({ status: 200, success: true, message: "Join WorkSpace Invitaion SuccessFully..." });
        })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, success: false, message: error.message })
    }
}
