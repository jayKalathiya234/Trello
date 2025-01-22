const card = require('../models/cardModel')
const List = require('../models/listModel')
const Board = require('../models/boardModels')
const { default: mongoose } = require('mongoose')

exports.createCard = async (req, res) => {
    try {
        let { listId, title, description, dueDate,color, status, position, attachments, comments, customFields, checkList } = req.body




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
            attachments,
            comments,
            customFields,
            checkList,
            color
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

        let { url, title } = req.body

        let checkCardId = await card.findById(id)

        if (!checkCardId) {
            return res.status(404).json({ status: 404, success: false, message: "Card Not Found" })
        }

        const attachment = {
            url: url || req.body.url,
            image: req.files && req.files.image ? req.files.image.map(file => file.path) : undefined,
            title
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
        let { url, image, status, title } = req.body;


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

        // if (req.files && req.files.image) {
        //     attachment.image = req.files.image.map(file => file.path);
        // }

        if (status) {
            attachment.status = status
        }
        if (title) {
            attachment.title = title;
        }
        checkCardId = await checkCardId.save();

        return res.status(200).json({ status: 200, success: true, message: "Attachment Updated Successfully", data: checkCardId });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: 500, message: error.message });
    }
};

exports.deleteAttachement = async (req, res) => {
    try {
        let { cardId, attachmentId } = req.body;

        let cardData = await card.findById(cardId);

        if (!cardData) {
            return res.status(404).json({ status: 404, success: false, message: "Card Not Found" });
        }

        // Use $pull to remove the attachment
        cardData = await card.findByIdAndUpdate(
            cardId,
            { $pull: { attachments: { _id: attachmentId } } },
            { new: true }
        );

        if (!cardData) {
            return res.status(404).json({ status: 404, success: false, message: "Attachment Not Found" });
        }

        return res.status(200).json({ status: 200, success: true, message: "Attachment Deleted Successfully", data: cardData });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: 500, success: false, message: error.message });
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

exports.updateCustomFields = async (req, res) => {
    try {
        let id = req.params.id;
        const { customFieldName, customFieldValue } = req.body;

        let checkCardDataId = await card.findById(id);

        if (!checkCardDataId) {
            return res.status(404).json({ status: 404, success: false, message: "Card Not Found" });
        }

        checkCardDataId = await card.findByIdAndUpdate(
            id,
            { $set: { [`customFields.${customFieldName}`]: customFieldValue } },
            { new: true }
        );

        return res.status(200).json({ status: 200, success: true, message: "Custom Field Updated Successfully", data: checkCardDataId });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: 500, success: false, message: error.message });
    }
}

exports.deleteCustomFields = async (req, res) => {
    try {
        let id = req.params.id;
        const { customFieldName } = req.body;

        let checkCardDataId = await card.findById(id);

        if (!checkCardDataId) {
            return res.status(404).json({ status: 404, success: false, message: "Card Not Found" });
        }

        checkCardDataId = await card.findByIdAndUpdate(
            id,
            { $unset: { [`customFields.${customFieldName}`]: "" } },
            { new: true }
        );

        return res.status(200).json({ status: 200, success: true, message: "Custom Field Deleted Successfully", data: checkCardDataId });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: 500, success: false, message: error.message });
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

exports.getCardByList = async (req, res) => {
    try {
        let listId = req.params.listId;

        let cards = await card.find({ listId }).populate('listId').populate('member.user');

        if (cards.length === 0) {
            return res.status(404).json({ status: 404, success: false, message: "No cards found for this list" });
        }

        return res.status(200).json({ status: 200, success: true, message: "Cards retrieved successfully", data: cards });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: 500, success: false, message: error.message });
    }
}

exports.moveAllCards = async (req, res) => {
    try {
        const { sourceListId, targetListId } = req.body;

        // Find all cards in the source list
        const cards = await card.find({ listId: sourceListId });

        if (cards.length === 0) {
            return res.status(404).json({ status: 404, success: false, message: "No cards found in the source list" });
        }

        // Update each card to the target list
        await card.updateMany(
            { listId: sourceListId },
            { $set: { listId: targetListId } }
        );

        return res.status(200).json({ status: 200, success: true, message: "All cards moved successfully", data: cards });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: 500, success: false, message: error.message });
    }
}

exports.getArchivedCard = async (req, res) => {
    try {
        let boardId = req.params.id;

        let checkBoardId = await Board.findById(boardId);

        if (!checkBoardId) {
            return res.status(404).json({ status: 404, success: false, message: "Board not found" });
        }

        let isMemberAuthorized = checkBoardId.members.some(
            member => member.user.toString() === req.user._id.toString()
        );

        if (!isMemberAuthorized) {
            return res.status(403).json({ status: 403, success: false, message: "Not authorized to view archived cards in this board" });
        }

        // Find all lists associated with the board
        const lists = await List.find({ boardId: boardId });

        if (lists.length === 0) {
            return res.status(404).json({ status: 404, success: false, message: "No lists found for this board" });
        }

        // Find archived cards in these lists
        const archivedCards = await card.find({ listId: { $in: lists.map(list => list._id) }, archived: true })
            .sort({ updatedAt: -1 })
            .populate('listId');

        return res.status(200).json({ status: 200, success: true, message: "Archived cards found successfully", data: archivedCards });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, success: false, message: "An error occurred while retrieving archived cards" });
    }
}

exports.archivedAllCardInList = async (req, res) => {
    try {
        const listId = req.params.id;
        const { archived } = req.body;

        // Find all cards in the specified list
        const cards = await card.find({ listId });
        console.log(cards)

        if (cards.length === 0) {
            return res.status(404).json({ status: 404, success: false, message: "No cards found in the specified list" });
        }

        // Update all cards in the list to set archived to true, ensuring listId is preserved
        const updateResult = await card.updateMany(
            { listId: listId },
            { $set: { archived: archived } }
        );

        if (updateResult.modifiedCount === 0) {
            return res.status(500).json({ status: 500, success: false, message: "Failed to archive cards" });
        }


        return res.status(200).json({ status: 200, success: true, message: "All cards in the list archived successfully" });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, success: false, message: error.message });
    }
}
exports.archivedCardById = async (req, res) => {
    try {
        const cardId = req.params.id;
        const { archived } = req.body;

        // Find the card by ID
        let cardData = await card.findById(cardId);

        if (!cardData) {
            return res.status(404).json({ status: 404, success: false, message: "Card Not Found" });
        }

        // Update the archived status of the card
        cardData = await card.findByIdAndUpdate(
            cardId,
            { $set: { archived: archived } },
            { new: true }
        );

        return res.status(200).json({ status: 200, success: true, message: "Card archived status updated successfully", data: cardData });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, success: false, message: error.message });
    }
}

exports.createCheckList = async (req, res) => {
    try {
        const cardId = req.params.id;
        const { text, completed = false } = req.body;

        // Find the card by ID
        let cardData = await card.findById(cardId);

        if (!cardData) {
            return res.status(404).json({ status: 404, success: false, message: "Card Not Found" });
        }

        // Add the new checklist item
        const newChecklistItem = { text, completed };
        cardData.checkList.push(newChecklistItem);

        // Save the updated card
        await cardData.save();

        return res.status(201).json({ status: 201, success: true, message: "Checklist item created successfully", data: cardData });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, success: false, message: error.message });
    }
}

exports.updateCheckList = async (req, res) => {
    try {
        const cardId = req.params.id;
        const { checklistId, text, completed } = req.body;

        // Find the card by ID
        let cardData = await card.findById(cardId);

        if (!cardData) {
            return res.status(404).json({ status: 404, success: false, message: "Card Not Found" });
        }

        // Find the checklist by ID within the card
        let checklist = cardData.checkList.id(checklistId);

        if (!checklist) {
            return res.status(404).json({ status: 404, success: false, message: "Checklist Not Found" });
        }
        console.log(completed)

        // Update the checklist items
        if (text !== undefined) checklist.text = text;
        if (completed !== undefined) checklist.completed = completed;

        // Save the updated card
        await cardData.save();

        return res.status(200).json({ status: 200, success: true, message: "Checklist updated successfully", data: cardData });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, success: false, message: error.message });
    }
}
exports.deleteCheckList = async (req, res) => {
    try {
        const cardId = req.params.id;
        const { checklistId } = req.body;

        // Find the card by ID
        let cardData = await card.findById(cardId);

        if (!cardData) {
            return res.status(404).json({ status: 404, success: false, message: "Card Not Found" });
        }

        // Use $pull to remove the checklist item by ID
        cardData = await card.findByIdAndUpdate(
            cardId,
            { $pull: { checkList: { _id: checklistId } } },
            { new: true }
        );

        return res.status(200).json({ status: 200, success: true, message: "Checklist item deleted successfully", data: cardData });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, success: false, message: error.message });
    }
}
exports.createCover = async (req, res) => {
    try {
        const cardId = req.params.id;
        const { color, size } = req.body;

        // Find the card by ID
        let cardData = await card.findById(cardId);

        if (!cardData) {
            return res.status(404).json({ status: 404, success: false, message: "Card Not Found" });
        }

        // Prepare the new cover object
        const newCover = {};
        if (req.files && req.files.image) {
            newCover.image = req.files.image.map(file => file.path);
        }
        if (color) {
            newCover.color = color;
        }
        if (size) {
            newCover.size = size;
        }

        // Update the card with the new cover
        cardData = await card.findByIdAndUpdate(
            cardId,
            { $push: { cover: newCover } }, // Use $push to add to the array
            { new: true }
        );
        console.log(cardData)
        return res.status(200).json({ status: 200, success: true, message: "Cover created successfully", data: cardData });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, success: false, message: error.message });
    }
}
exports.updateCover = async (req, res) => {
    try {
        const cardId = req.params.id;
        const { coverId, color, size } = req.body;

        // Find the card by ID
        let cardData = await card.findById(cardId);

        if (!cardData) {
            return res.status(404).json({ status: 404, success: false, message: "Card Not Found" });
        }

        // Find the cover by ID within the card
        let cover = cardData.cover.id(coverId);

        if (!cover) {
            return res.status(404).json({ status: 404, success: false, message: "Cover Not Found" });
        }

        // Update the cover fields
        if (req.files && req.files.image) {
            cover.image = req.files.image.map(file => file.path);
        }
        if (color) {
            cover.color = color;
        }
        if (size) {
            cover.size = size;
        }

        // Save the updated card
        await cardData.save();

        return res.status(200).json({ status: 200, success: true, message: "Cover updated successfully", data: cardData });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, success: false, message: error.message });
    }
}
exports.deleteCover = async (req, res) => {
    try {
        const cardId = req.params.id;
        const { coverId } = req.body;

        // Find the card by ID
        let cardData = await card.findById(cardId);

        if (!cardData) {
            return res.status(404).json({ status: 404, success: false, message: "Card Not Found" });
        }

        // Check if the cover exists

        const coverExists = cardData.cover.some(cover => cover._id.toString() === coverId);
        if (!coverExists) {
            return res.status(404).json({ status: 404, success: false, message: "Cover Not Found" });
        }

        // Use $pull to remove the cover by ID
        cardData = await card.findByIdAndUpdate(
            cardId,
            { $pull: { cover: { _id: coverId } } },
            { new: true }
        );

        return res.status(200).json({ status: 200, success: true, message: "Cover deleted successfully", data: cardData });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, success: false, message: error.message });
    }
}

exports.updateLabelId = async (req, res) => {
    try {
        const cardId = req.params.id;
        const labelUpdates = req.body.labelUpdates; // Array of new labelIds

        // Find the card by ID
        let cardData = await card.findById(cardId);

        if (!cardData) {
            return res.status(404).json({ status: 404, success: false, message: "Card Not Found" });
        }

        // Clear existing labels
        cardData.label = [];

        // Add new labels from the labelUpdates array
        labelUpdates.forEach(labelId => {
            cardData.label.push({
                labelId: new mongoose.Types.ObjectId(labelId)
            });
        });

        // Save the updated card
        await cardData.save();


        cardData = await card.aggregate([
            {
                $match: { _id: new mongoose.Types.ObjectId(cardId) }
            },
            {
                $lookup: {
                    from: 'boards',
                    let: { labelIds: '$label.labelId' },
                    pipeline: [
                        {
                            $unwind: '$label'
                        },
                        {
                            $match: {
                                $expr: {
                                    $in: ['$label._id', '$$labelIds']
                                }
                            }
                        },
                        {
                            $project: {
                                'label._id': 1,
                                'label.data': 1,
                                'label.color': 1,
                                'label.status': 1
                            }
                        }
                    ],
                    as: 'labelInfo'
                }
            },
            {
                $addFields: {
                    labelInfo: {
                        $map: {
                            input: '$label',
                            as: 'lbl',
                            in: {
                                $arrayElemAt: [
                                    {
                                        $filter: {
                                            input: '$labelInfo',
                                            cond: {
                                                $eq: ['$$this.label._id', '$$lbl.labelId']
                                            }
                                        }
                                    },
                                    0
                                ]
                            }
                        }
                    }
                }
            }

        ])
        // .findById(cardId).populate({
        //     path: 'label.labelId',
        //     select: 'data color' // Select the fields you want from the label
        // });
        // const data = await Board.find({"label._id": labelUpdates})

        // const labelInfo = Board.label.map(label => ({
        //     _id: label._id,
        //     data: label.data,
        //     color: label.color
        // }));


        return res.status(200).json({
            status: 200,
            success: true,
            message: "Labels updated successfully",
            data: cardData
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, success: false, message: error.message });
    }
}