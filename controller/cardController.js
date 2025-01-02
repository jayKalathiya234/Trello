const card = require('../models/cardModel')

exports.createCard = async (req, res) => {
    try {
        let { listId, title, description, dueDate, status, position, label, attachments, comments, customFields } = req.body

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

        let { labelName } = req.body

        let checkCardId = await card.findById(id)

        if (!checkCardId) {
            return res.status(404).json({ status: 404, success: false, message: "Card Not Found" })
        }

        checkCardId = await card.findByIdAndUpdate(
            id,
            { $push: { label: { data: labelName } } },
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

        let { labelName } = req.body

        let updateCardId = await card.findOne({ 'label._id': id })

        if (!updateCardId) {
            return res.status(404).json({ status: 404, success: false, message: "Card Not Found" })
        }

        updateCardId = await card.findOneAndUpdate(
            { 'label._id': id },
            { $set: { 'label.$.data': labelName } },
            { new: true }
        );

        return res.status(200).json({ status: 200, success: true, message: "label Edited SuccessFully...", data: updateCardId });

    } catch (error) {
        console.log(error);
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

        let updateData;

        if (startDate) {
            updateData.startDate = startDate
        }

        if (dueDate) {
            updateData.dueDate = dueDate
        }

        checkCardDataId = await card.findByIdAndUpdate(
            id,
            { $set: updateData },
            { Fnew: true }
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
        let id = req.params.id

        const { targetListId, newPosition, type = 'move' } = req.body

        let originalCard = await card.findById(id)

        if (!originalCard) {
            return res.status(404).json({ status: 404, success: false, message: "Card Not Found" });
        }

        await card.updateMany(
            { listId: originalCard.listId, position: { $gt: originalCard.position } },
            { $inc: { position: -1 } }
        );

        const cardData = originalCard.toObject();

        delete cardData._id
        delete cardData.createdAt;
        delete cardData.updatedAt;

        if (type === 'copy') {
            const copiedCard = new card({
                ...cardData,
                listId: targetListId,
                position: newPosition
            });
            await copiedCard.save();

            await card.updateMany(
                { listId: targetListId, position: { $gte: newPosition } },
                { $inc: { position: 1 } }
            );

            return res.status(201).json(copiedCard);
        }
        const moveCard = await card.findByIdAndUpdate(
            id, {
            listId: targetListId,
            position: newPosition,
        }, {
            new: true
        })

        await card.updateMany(
            { listId: targetListId, position: { $gte: newPosition } },
            { inc: { position: 1 } }
        )

        return res.status(200).json({ status: 200, success: true, message: "card moved SuccessFully...", data: moveCard })

    } catch (error) {
        console.log(error)
        return res.status(200).json({ status: 200, success: false, message: error.message })
    }
}

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
