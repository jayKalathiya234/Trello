const card = require('../models/cardModel')
const List = require('../models/listModel')
const Board = require('../models/boardModels')

exports.createCard = async (req, res) => {
    try {
        let { listId, title, description, dueDate, status, position, label, attachments, comments, customFields } = req.body

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

        let checkCardIsExist = await card.findOne({ title })

        if (checkCardIsExist) {
            return res.status(409).json({ status: 409, success: false, message: "Card Alredy Exist..." })
        }

        const lastCard = await card.findOne({ listId }).sort({ position: -1 }).limit(1);
        const newPosition = lastCard ? lastCard.position + 1 : 1;

        checkCardIsExist = await card.create({
            listId,
            title,
            description,
            dueDate,
            status,
            position: position || newPosition,
            label,
            attachments,
            comments,
            customFields
        })

        return res.status(201).json({ status: 201, success: true, message: "Card Created SuccessFully...", data: checkCardIsExist })

    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: 500, success: false, message: error.message })
    }
}

exports.getAllCardData = async (req, res) => {
    try {
        let page = parseInt(req.query.page)
        let pageSize = parseInt(req.query.pageSize)

        if (page < 1 || pageSize < 1) {
            return res.status(401).json({ status: 401, success: false, message: "Page And PageSize Cann't Be Less Than 1" })
        }

        let paginatedCardData;

        paginatedCardData = await card.find().populate('listId').populate('member.user')

        let count = paginatedCardData.length

        if (count === 0) {
            return res.status(404).json({ status: 404, success: false, message: "Card Data Not Found" })
        }

        if (page && pageSize) {
            let startIndex = (page - 1) * pageSize
            let lastIndex = (startIndex + pageSize)
            paginatedCardData = await paginatedCardData.slice(startIndex, lastIndex)
        }

        return res.status(200).json({ status: 200, success: true, message: "All Card Data Found SuccessFully...", data: paginatedCardData })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, success: false, message: error.message })
    }
}

exports.getCardDataById = async (req, res) => {
    try {
        let id = req.params.id

        let getCardDataId = await card.findById(id).populate('listId').populate('member.user')

        if (!getCardDataId) {
            return res.status(404).json({ status: 404, success: false, message: "Card Data Not Found" })
        }

        return res.status(200).json({ status: 200, success: true, message: "Card Data Found SuccessFully...", data: getCardDataId })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, success: false, message: error.message })
    }
}

exports.addMambers = async (req, res) => {
    try {
        let id = req.params.id

        let { userId } = req.body

        let checkCardData = await card.findById(id)

        if (!checkCardData) {
            return res.status(404).json({ status: 404, success: false, message: "Card Not Found" });
        }

        checkCardData = await card.findByIdAndUpdate(
            id,
            { $push: { member: { user: userId } } },
            { new: true }
        );

        return res.status(200).json({ status: 200, success: true, message: "Card Memeber add SuccessFully...", data: checkCardData });

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, success: false, message: error.message })
    }
}

exports.removeMember = async (req, res) => {
    try {
        let id = req.params.id

        let getCardDetails = await card.findOne({ "member._id": id })

        if (!getCardDetails) {
            return res.status(404).json({ status: 404, success: false, message: "Card Data Not Found" })
        }

        getCardDetails = await card.findOneAndUpdate(
            { "member._id": id },
            { $pull: { member: { _id: id } } },
            { new: true }
        )

        return res.status(200).json({ status: 200, success: true, message: "Card Member Remove SuccessFully..." })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, success: false, message: error.message })
    }
}

exports.createLabel = async (req, res) => {
    try {
        let id = req.params.id

        let { labelName, color } = req.body

        let checkCardId = await card.findById(id)

        if (!checkCardId) {
            return res.status(404).json({ status: 404, success: false, message: "Card Not Found" })
        }

        checkCardId = await card.findByIdAndUpdate(
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

exports.editLabelById = async (req, res) => {
    try {
        let id = req.params.id

        let { labelName, color, status } = req.body

        let updateCardId = await card.findOne({ 'label._id': id })

        if (!updateCardId) {
            return res.status(404).json({ status: 404, success: false, message: "Card Not Found" })
        }

        updateCardId = await card.findOneAndUpdate(
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

exports.removeLableById = async (req, res) => {
    try {
        let id = req.params.id

        let getLableDataId = await card.findOne({ "label._id": id })

        if (!getLableDataId) {
            return res.status(404).json({ status: 404, success: false, message: "Label Not Found" })
        }

        getLableDataId = await card.findOneAndUpdate(
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

exports.setStartDateAndDueDate = async (req, res) => {
    try {
        let id = req.params.id

        let { dueDate } = req.body

        let checkCardDataId = await card.findById(id)

        if (!checkCardDataId) {
            return res.status(404).json({ status: 404, success: false, message: "Card Not Found" })
        }

        checkCardDataId = await card.findByIdAndUpdate(
            id,
            { $set: { dueDate } },
            { new: true }
        );

        return res.status(200).json({ status: 200, success: true, message: "Due Date Set SuccessFully...", data: checkCardDataId });

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, success: false, message: error.message })
    }
}

exports.updateStartDateAndDueDateById = async (req, res) => {
    try {
        let id = req.params.id

        let { startDate, dueDate } = req.body

        let checkCardDataId = await card.findById(id)

        if (!checkCardDataId) {
            return res.status(404).json({ status: 404, success: false, message: "Card Data Not Found" })
        }

        let updateData = {};

        if (startDate) {
            updateData.startDate = startDate
        }

        if (dueDate) {
            updateData.dueDate = dueDate
        }

        checkCardDataId = await card.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true }
        );

        return res.status(200).json({ status: 200, success: true, message: "Card Data Updated SuccessFully...", data: checkCardDataId })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, success: false, message: error.message })
    }
}

exports.setAttachementById = async (req, res) => {
    try {
        let id = req.params.id

        let { url } = req.body

        let checkCardId = await card.findById(id)

        if (!checkCardId) {
            return res.status(404).json({ status: 404, success: false, message: "Card Not Found" })
        }

        const attachment = {
            url: url || req.body.url,
            image: req.files && req.files.image ? req.files.image.map(file => file.path) : undefined
        };

        checkCardId = await card.findByIdAndUpdate(
            id,
            { $push: { attachments: attachment } },
            { new: true }
        );

        return res.status(200).json({ status: 200, success: true, message: "Atteachment Create SuccessFully...", data: checkCardId })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, message: error.message })
    }
}

exports.updateSetAttachement = async (req, res) => {
    try {
        let id = req.params.id;
        let { url, image, status } = req.body;


        let checkCardId = await card.findOne({ 'attachments._id': id });

        if (!checkCardId) {
            return res.status(404).json({ status: 404, success: false, message: "Card Not Found" });
        }

        let attachment = checkCardId.attachments.id(id);

        if (!attachment) {
            return res.status(404).json({ status: 404, success: false, message: "Attachment Not Found" });
        }

        if (url) {
            attachment.url = url;
        }

        if (req.files && req.files.image) {
            attachment.image = req.files.image.map(file => file.path);
        }

        if (status) {
            attachment.status = status
        }

        checkCardId = await checkCardId.save();

        return res.status(200).json({ status: 200, success: true, message: "Attachment Updated Successfully", data: checkCardId });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: 500, message: error.message });
    }
};

exports.createCustomFields = async (req, res) => {
    try {
        let id = req.params.id

        let checkIdData = await card.findById(id)

        const { customFieldName, customFieldValue } = req.body;

        if (!checkIdData) {
            return res.status(404).json({ status: 404, success: false, message: "Card Not Found" })
        }

        checkIdData = await card.findByIdAndUpdate(
            id,
            { $set: { [`customFields.${customFieldName}`]: customFieldValue } },
            { new: true }
        );

        return res.status(200).json({ status: 200, success: true, message: "CustomFields added SuccessFully...", data: checkIdData })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, success: false, message: error.message })
    }
}


exports.moveCardAndCopy = async (req, res) => {
    try {
        const cardId = req.params.id;
        const { targetListId, targetBoardId, newPosition, type = 'move', title } = req.body;

        const originalCard = await card.findById(cardId);
        if (!originalCard) {
            return res.status(404).json({ success: false, message: "Card not found" });
        }

        const sourceList = await List.findById(originalCard.listId);
        const targetList = await List.findById(targetListId);

        if (!sourceList || !targetList) {
            return res.status(404).json({ success: false, message: "Source or target list not found" });
        }

        const sourceBoard = await Board.findById(sourceList.boardId);
        const targetBoard = await Board.findById(targetList.boardId);

        if (!sourceBoard || !targetBoard) {
            return res.status(404).json({ success: false, message: "Source or target board not found" });
        }

        if (sourceBoard.workSpaceId.toString() !== targetBoard.workSpaceId.toString()) {
            return res.status(403).json({ success: false, message: "Cannot move/copy cards between different workspaces" });
        }

        if (type === 'move') {
            await card.updateMany(
                {
                    listId: originalCard.listId,
                    position: { $gt: originalCard.position }
                },
                { $inc: { position: -1 } }
            );
        }

        const cardData = {
            ...originalCard.toObject(),
            listId: targetListId,
            position: newPosition,
            title: title || originalCard.title
        };

        if (type === 'copy') {
            delete cardData._id;
            delete cardData.createdAt;
            delete cardData.updatedAt;
        }

        await card.updateMany(
            {
                listId: targetListId,
                position: { $gte: newPosition }
            },
            { $inc: { position: 1 } }
        );

        let resultCard;
        if (type === 'copy') {

            resultCard = await card.create(cardData);
        } else {

            resultCard = await card.findByIdAndUpdate(
                cardId,
                {
                    listId: targetListId,
                    position: newPosition,
                    title: title || originalCard.title
                },
                { new: true }
            );
        }

        return res.status(type === 'copy' ? 201 : 200).json({
            success: true,
            message: `Card ${type === 'copy' ? 'copied' : 'moved'} successfully`,
            data: resultCard
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteCardDataById = async (req, res) => {
    try {
        let id = req.params.id

        let deleteCardId = await card.findById(id)

        if (!deleteCardId) {
            return res.status(404).json({ status: 404, success: false, message: "Card Not Found" })
        }

        await card.findByIdAndDelete(id)

        return res.status(200).json({ status: 200, success: true, message: "Card Delete SuccessFully..." })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, success: false, message: error.message })
    }
}

exports.updateCardData = async (req, res) => {
    try {
        let id = req.params.id

        let updateCardDataId = await card.findById(id)

        if (!updateCardDataId) {
            return res.status(404).json({ status: 404, success: false, message: "Card Data Not Found" })
        }

        updateCardDataId = await card.findByIdAndUpdate(id, { ...req.body }, { new: true })

        return res.status(200).json({ status: 200, success: true, message: "Card Data Updated SuccessFully...", data: updateCardDataId })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, success: false, message: error.message })
    }
}