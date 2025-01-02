const list = require('../models/listModel');
const board = require('../models/boardModels');

exports.createList = async (req, res) => {
    try {
        let { boardId, title } = req.body

        let checkExistList = await list.findOne({ boardId, title })

        if (checkExistList) {
            return res.status(409).json({ status: 409, success: false, message: "List Alredy Exist..." })
        }

        let checkBoradMember = await board.findById(boardId)

        if (!checkBoradMember) {
            return res.status(404).json({ status: 404, success: false, message: "Board Not Found" });
        }

        let member = checkBoradMember.members.some(
            member => member.user.toString() === req.user._id.toString()
        );

        if (!member) {
            return res.status(403).json({ status: 403, success: false, message: 'Not authorized to create lists in this board' });
        }

        const lastList = await list.findOne({ boardId }).sort({ position: -1 });
        const position = lastList ? lastList.position + 1 : 1;

        checkExistList = await list.create({
            boardId,
            title,
            position
        });

        return res.status(201).json({ status: 201, success: true, message: "List Create SuccessFully...", data: checkExistList })

    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: 500, success: false, message: error.message })
    }
}

exports.getAllListForBoard = async (req, res) => {
    try {
        let id = req.params.id

        let checkBoardId = await board.findById(id)

        if (!checkBoardId) {
            return res.status(404).json({ status: 404, success: false, message: "Board Not Found" })
        }

        let member = checkBoardId.members.some(
            member => member.user.toString() === req.user._id.toString()
        );

        if (!member) {
            return res.status(403).json({ status: 403, success: false, message: 'Not authorized to view lists in this board' });
        }

        const lists = await list.find({ boardId: id, archived: false }).sort({ position: 1 }).populate('boardId');

        return res.status(200).json({ status: 200, success: true, message: "All List Found SuccessFully...", data: lists })

    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: 500, success: false, message: error.message })
    }
}

exports.getListById = async (req, res) => {
    try {
        let id = req.params.id

        let getListId = await list.findById(id)

        if (!getListId) {
            return res.status(404).json({ status: 404, success: false, message: "List Not Found" })
        }

        let getBoardData = await board.findById(getListId.boardId).populate('boardId');

        let checkMember = getBoardData.members.some(
            member => member.user.toString() === req.user._id.toString()
        )

        if (!checkMember) {
            return res.status(403).json({ status: 403, success: false, message: "Not Authorize To View This list" })
        }

        return res.status(200).json({ status: 200, success: true, message: "List Found SuccessFully...", data: getListId })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, success: false, message: error.message })
    }
}

exports.getArchivedListForBoard = async (req, res) => {
    try {
        let id = req.params.id

        let checBoardId = await board.findById(id)

        if (!checBoardId) {
            return res.status(404).json({ status: 404, success: false, message: "Board Not Found" })
        }

        let checkMember = checBoardId.members.some(
            member => member.user.toString() === req.user._id.toString()
        )

        if (!checkMember) {
            return res.status(403).json({ status: 403, success: false, message: "Not authorized to view lists in this board" })
        }

        const archivedList = await list.find({ boardId: id, archived: true }).sort({ updatedAt: -1 }).populate('boardId');

        return res.status(200).json({ status: 200, success: true, message: "Archived Lists Found Successfully...", data: archivedList })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, success: false, message: error.message })
    }
}

exports.updateListById = async (req, res) => {
    try {
        let id = req.params.id

        const { title, position, archived } = req.body;

        const getList = await list.findById(id);

        if (!getList) {
            return res.status(404).json({ status: 404, success: false, message: 'List not found' });
        }

        const boardData = await board.findById(getList.boardId);

        const isMember = boardData.members.some(
            member => member.user.toString() === req.user._id.toString()
        );

        if (!isMember) {
            return res.status(403).json({ status: 403, success: false, message: 'Not authorized to update this list' });
        }

        if (title) getList.title = title;
        // if (description) getList.description = description;
        if (position !== undefined) getList.position = position;
        if (archived !== undefined) getList.archived = archived;

        await getList.save();

        return res.status(200).json({ status: 200, success: true, message: 'List updated successfully', data: getList });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: 500, success: false, message: error.message })
    }
}

exports.deleteListById = async (req, res) => {
    try {
        let id = req.params.id

        let getListData = await list.findById(id)

        if (!getListData) {
            return res.status(404).json({ status: 404, success: false, message: "List Not Found" })
        }

        const boardData = await board.findById(getListData.boardId);

        const isMember = boardData.members.some(
            member => member.user.toString() === req.user._id.toString() &&
                member.role === 'admin'
        );

        if (!isMember) {
            return res.status(403).json({ status: 403, success: false, message: 'Not authorized to delete this list' });
        }

        await list.findByIdAndDelete(id);

        return res.status(200).json({ status: 200, success: true, message: 'List deleted successfully' });

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, success: false, message: error.message })
    }
}
