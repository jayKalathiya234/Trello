const list = require('../models/listModel');
const board = require('../models/boardModels');
const mongoose = require('mongoose')
const customfield = require('../models/CustomFieldModel')

exports.createList = async (req, res) => {
    try {
        let { boardId, title, color } = req.body

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
            position,
            color
        });

        return res.status(201).json({ status: 201, success: true, message: "List Create SuccessFully...", data: checkExistList })

    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: 500, success: false, message: error.message })
    }
}

// exports.getAllLists = async (req, res) => {
//     try {
//         let id = req.params.id

//         let page = parseInt(req.query.page)
//         let pageSize = parseInt(req.query.pageSize)

//         if (page < 1 || pageSize < 1) {
//             return res.status(401).json({ status: 401, success: false, message: "Page And PageSize Cann't Be Less Than 1" })
//         }

//         let paginatedListData = await list.aggregate([
//             {
//                 $match: {
//                     boardId: new mongoose.Types.ObjectId(id)
//                 }
//             },
//             {
//                 $lookup: {
//                     from: 'boards',
//                     localField: 'boardId',
//                     foreignField: '_id',
//                     pipeline: [
//                         {
//                             $project: {
//                                 label: 1
//                             }
//                         },
//                         {
//                             $unwind: "$label"
//                         },
//                         {
//                             $group: {
//                                 _id: "$_id",
//                                 labels: {
//                                     $push: {
//                                         _id: "$label._id",
//                                         data: "$label.data",
//                                         color: "$label.color",
//                                         status: "$label.status"
//                                     }
//                                 }
//                             }
//                         }
//                     ],
//                     as: 'boardData'
//                 }
//             },
//             {
//                 $lookup: {
//                     from: 'cards',
//                     let: { listId: "$_id", boardLabels: { $arrayElemAt: ["$boardData.labels", 0] } },
//                     pipeline: [
//                         {
//                             $match: {
//                                 $expr: { $eq: ["$listId", "$$listId"] }
//                             }
//                         },
//                         {
//                             $unwind: {
//                                 path: "$label",
//                                 preserveNullAndEmptyArrays: true
//                             }
//                         },
//                         {
//                             $addFields: {
//                                 labelDetails: {
//                                     $filter: {
//                                         input: "$$boardLabels",
//                                         as: "boardLabel",
//                                         cond: { $eq: ["$$boardLabel._id", "$label.labelId"] }
//                                     }
//                                 }
//                             }
//                         },
//                         {
//                             $lookup: {
//                                 from: 'users',
//                                 localField: 'member.user',
//                                 foreignField: '_id',
//                                 as: 'memberDetails'
//                             }
//                         },
//                         {
//                             $group: {
//                                 _id: "$_id",
//                                 listId: { $first: "$listId" },
//                                 title: { $first: "$title" },
//                                 archived: { $first: "$archived" },
//                                 position: { $first: "$position" },
//                                 attachments: { $first: "$attachments" },
//                                 checkList: { $first: "$checkList" },
//                                 member: { $first: "$member" },
//                                 cover: { $first: "$cover" },
//                                 createdAt: { $first: "$createdAt" },
//                                 updatedAt: { $first: "$updatedAt" },
//                                 dueDate: { $first: "$dueDate" },
//                                 startDate: { $first: "$startDate" },
//                                 status: { $first: "$status" },
//                                 labels: {
//                                     $push: {
//                                         $mergeObjects: [
//                                             {
//                                                 _id: "$label._id",
//                                                 labelId: "$label.labelId"
//                                             },
//                                             { $arrayElemAt: ["$labelDetails", 0] }
//                                         ]
//                                     }
//                                 },
//                                 memberDetails: { $first: "$memberDetails" }
//                             }
//                         },
//                         {
//                             $sort: { position: 1 }
//                         }
//                     ],
//                     as: "cardData"
//                 }
//             },

//             {
//                 $project: {
//                     _id: 1,
//                     boardId: 1,
//                     title: 1,
//                     position: 1,
//                     archived: 1,
//                     color: 1,
//                     createdAt: 1,
//                     updatedAt: 1,
//                     cardData: 1,
//                     // boardLabels: { $arrayElemAt: ["$boardData.labels", 0] }
//                 }
//             }
//         ])

//         let count = paginatedListData.length

//         if (count === 0) {
//             return res.status(404).json({ status: 404, success: false, message: "List Data Not Found" })
//         }

//         if (page && pageSize) {
//             let startIndex = (page - 1) * pageSize
//             let lastIndex = (startIndex + pageSize)
//             paginatedListData = paginatedListData.slice(startIndex, lastIndex)
//         }

//         return res.status(200).json({
//             status: 200,
//             success: true,
//             message: "All List Data Found Successfully...",
//             data: paginatedListData
//         })

//     } catch (error) {
//         console.log(error)
//         return res.status(500).json({ status: 500, success: false, message: error.message })
//     }
// }

exports.getAllLists = async (req, res) => {
    try {
        let id = req.params.id
        let page = parseInt(req.query.page)
        let pageSize = parseInt(req.query.pageSize)

        if (page < 1 || pageSize < 1) {
            return res.status(401).json({ status: 401, success: false, message: "Page And PageSize Cann't Be Less Than 1" })
        }

        let paginatedListData = await list.aggregate([
            {
                $match: {
                    boardId: new mongoose.Types.ObjectId(id)
                }
            },
            {
                $lookup: {
                    from: 'boards',
                    localField: 'boardId',
                    foreignField: '_id',
                    pipeline: [
                        {
                            $project: {
                                label: 1
                            }
                        },
                        {
                            $unwind: "$label"
                        },
                        {
                            $group: {
                                _id: "$_id",
                                labels: {
                                    $push: {
                                        _id: "$label._id",
                                        data: "$label.data",
                                        color: "$label.color",
                                        status: "$label.status"
                                    }
                                }
                            }
                        }
                    ],
                    as: 'boardData'
                }
            },
            {
                $lookup: {
                    from: 'cards',
                    let: { listId: "$_id", boardLabels: { $arrayElemAt: ["$boardData.labels", 0] } },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ["$listId", "$$listId"] }
                            }
                        },
                        {
                            $lookup: {
                                from: 'customfields',
                                let: { boardId: id },
                                pipeline: [
                                    {
                                        $match: {
                                            $expr: { $eq: ["$boardId", { $toObjectId: "$$boardId" }] }
                                        }
                                    },
                                    {
                                        $unwind: "$field"
                                    },
                                    {
                                        $project: {
                                            _id: 1,
                                            "field._id": 1,
                                            "field.fieldLabel": 1,
                                            "field.fieldType": 1,
                                            "field.fieldShown": 1,
                                            "field.fieldOptions": {
                                                $map: {
                                                    input: "$field.fieldOptions",
                                                    as: "option",
                                                    in: {
                                                        _id: "$$option._id",
                                                        color: "$$option.color",
                                                        text: "$$option.text"
                                                    }
                                                }
                                            }
                                        }
                                    },
                                    {
                                        $group: {
                                            _id: "$_id",
                                            fields: {
                                                $push: "$field"
                                            }
                                        }
                                    }
                                ],
                                as: 'customFieldsData'
                            }
                        },
                        {
                            $addFields: {
                                customFieldDetails: {
                                    $map: {
                                        input: "$customFields",
                                        as: "cf",
                                        in: {
                                            $let: {
                                                vars: {
                                                    matchedFieldData: {
                                                        $arrayElemAt: [{
                                                            $filter: {
                                                                input: {
                                                                    $reduce: {
                                                                        input: "$customFieldsData.fields",
                                                                        initialValue: [],
                                                                        in: { $concatArrays: ["$$value", "$$this"] }
                                                                    }
                                                                },
                                                                as: "field",
                                                                cond: { $eq: ["$$field._id", "$$cf.fieldId"] }
                                                            }
                                                        }, 0]
                                                    }
                                                },
                                                in: {
                                                    fieldId: "$$cf.fieldId",
                                                    fieldLabel: "$$matchedFieldData.fieldLabel",
                                                    fieldType: "$$matchedFieldData.fieldType",
                                                    fieldShown: "$$matchedFieldData.fieldShown",
                                                    selectedOptions: {
                                                        $map: {
                                                            input: "$$cf.selectedOptions",
                                                            as: "optionId",
                                                            in: {
                                                                $let: {
                                                                    vars: {
                                                                        optionData: {
                                                                            $arrayElemAt: [{
                                                                                $filter: {
                                                                                    input: "$$matchedFieldData.fieldOptions",
                                                                                    as: "fo",
                                                                                    cond: {
                                                                                        $eq: ["$$fo._id", "$$optionId"]
                                                                                    }
                                                                                }
                                                                            }, 0]
                                                                        }
                                                                    },
                                                                    in: {
                                                                        _id: "$$optionId",
                                                                        color: "$$optionData.color",
                                                                        text: "$$optionData.text"
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        {
                            $unwind: {
                                path: "$label",
                                preserveNullAndEmptyArrays: true
                            }
                        },
                        {
                            $addFields: {
                                labelDetails: {
                                    $filter: {
                                        input: "$$boardLabels",
                                        as: "boardLabel",
                                        cond: { $eq: ["$$boardLabel._id", "$label.labelId"] }
                                    }
                                }
                            }
                        },
                        {
                            $lookup: {
                                from: 'users',
                                localField: 'member.user',
                                foreignField: '_id',
                                as: 'memberDetails'
                            }
                        },
                        {
                            $group: {
                                _id: "$_id",
                                listId: { $first: "$listId" },
                                title: { $first: "$title" },
                                archived: { $first: "$archived" },
                                position: { $first: "$position" },
                                attachments: { $first: "$attachments" },
                                checkList: { $first: "$checkList" },
                                member: { $first: "$member" },
                                cover: { $first: "$cover" },
                                createdAt: { $first: "$createdAt" },
                                updatedAt: { $first: "$updatedAt" },
                                dueDate: { $first: "$dueDate" },
                                startDate: { $first: "$startDate" },
                                status: { $first: "$status" },
                                customFields: { $first: "$customFieldDetails" },
                                labels: {
                                    $push: {
                                        $mergeObjects: [
                                            {
                                                _id: "$label._id",
                                                labelId: "$label.labelId"
                                            },
                                            { $arrayElemAt: ["$labelDetails", 0] }
                                        ]
                                    }
                                },
                                memberDetails: { $first: "$memberDetails" }
                            }
                        },
                        {
                            $sort: { position: 1 }
                        }
                    ],
                    as: "cardData"
                }
            },
            {
                $project: {
                    _id: 1,
                    boardId: 1,
                    title: 1,
                    position: 1,
                    archived: 1,
                    color: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    cardData: 1
                }
            }
        ]);

        let count = paginatedListData.length;

        if (count === 0) {
            return res.status(404).json({ status: 404, success: false, message: "List Data Not Found" });
        }

        if (page && pageSize) {
            let startIndex = (page - 1) * pageSize;
            let lastIndex = (startIndex + pageSize);
            paginatedListData = paginatedListData.slice(startIndex, lastIndex);
        }

        return res.status(200).json({
            status: 200,
            success: true,
            message: "All List Data Found Successfully...",
            data: paginatedListData
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: 500, success: false, message: error.message });
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

        const lists = await list.find({ boardId: id, archived: false }).sort({ position: 1 }).populate('boardId').populate({
            path: 'boardId',
            populate: {
                path: 'members.user',
                select: 'name email'
            },
        });

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

        const { title, position, archived, color } = req.body;

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
        if (color) getList.color = color;
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

        // const isMember = boardData.members.some(
        //     member => member.user.toString() === req.user._id.toString() &&
        //         member.role === 'admin'
        // );

        // if (!isMember) {
        //     return res.status(403).json({ status: 403, success: false, message: 'Not authorized to delete this list' });
        // }

        await list.findByIdAndDelete(id);

        return res.status(200).json({ status: 200, success: true, message: 'List deleted successfully' });

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, success: false, message: error.message })
    }
}

exports.copyListData = async (req, res) => {
    try {
        let id = req.params.id
        let { title } = req.body

        // Get the original list data
        let getListData = await list.findById(id);

        if (!getListData) {
            return res.status(404).json({ status: 404, success: false, message: "List Not Found" });
        }

        // Check board membership
        const boardData = await board.findById(getListData.boardId);
        const isMember = boardData.members.some(
            member => member.user.toString() === req.user._id.toString()
        );

        if (!isMember) {
            return res.status(403).json({ status: 403, success: false, message: 'Not authorized to copy this list' });
        }

        // Get the highest position for the new list
        const lastList = await list.findOne({ boardId: getListData.boardId }).sort({ position: -1 });
        const position = lastList ? lastList.position + 1 : 1;

        // Create new list with copied data
        const copiedList = await list.create({
            boardId: getListData.boardId,
            title: title,
            position: position,
            archived: false,
            color: getListData.color
        });

        // Copy all cards from the original list
        const cards = await mongoose.model('card').find({ listId: id });
        const cardCopyPromises = cards.map(card => {
            return mongoose.model('card').create({
                listId: copiedList._id,
                boardId: card.boardId,
                title: card.title,
                description: card.description,
                position: card.position,
                dueDate: card.dueDate,
                label: card.label,
                member: card.member,
                color: card.color,
                attachments: card.attachments,
                customFields: card.customFields,
                cover: card.cover,
                checkList: card.checkList,
                archived: false
            });
        });

        await Promise.all(cardCopyPromises);

        return res.status(201).json({
            status: 201,
            success: true,
            message: 'List and cards copied successfully',
            data: copiedList
        });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, success: false, message: error.message })
    }
}

exports.moveListData = async (req, res) => {
    try {
        let id = req.params.id
        let { newPosition, newBoardId } = req.body;

        // Find the list to be moved
        const listToMove = await list.findById(id);
        if (!listToMove) {
            return res.status(404).json({ status: 404, success: false, message: "List not found" });
        }

        // Check source board membership
        const sourceBoardData = await board.findById(listToMove.boardId);
        const isSourceMember = sourceBoardData.members.some(
            member => member.user.toString() === req.user._id.toString()
        );

        if (!isSourceMember) {
            return res.status(403).json({ status: 403, success: false, message: 'Not authorized to move this list' });
        }

        // If moving to a different board
        if (newBoardId && newBoardId !== listToMove.boardId.toString()) {
            const targetBoardData = await board.findById(newBoardId);
            if (!targetBoardData) {
                return res.status(404).json({ status: 404, success: false, message: "Target board not found" });
            }

            const isTargetMember = targetBoardData.members.some(
                member => member.user.toString() === req.user._id.toString()
            );

            if (!isTargetMember) {
                return res.status(403).json({ status: 403, success: false, message: 'Not authorized to move list to target board' });
            }

            // Update positions in source board
            await list.updateMany(
                {
                    boardId: listToMove.boardId,
                    position: { $gt: listToMove.position },
                    archived: false
                },
                { $inc: { position: -1 } }
            );

            // If newPosition is specified, use it and adjust target board positions
            if (newPosition !== undefined) {
                // Get all lists in target board
                const targetBoardLists = await list.find({
                    boardId: newBoardId,
                    archived: false
                }).sort({ position: 1 });

                const maxPosition = targetBoardLists.length;

                // Ensure newPosition is within valid range
                const validPosition = Math.max(1, Math.min(newPosition, maxPosition + 1));

                // Shift positions in target board to make space
                await list.updateMany(
                    {
                        boardId: newBoardId,
                        position: { $gte: validPosition },
                        archived: false
                    },
                    { $inc: { position: 1 } }
                );

                listToMove.position = validPosition;
            } else {
                // If no position specified, add to end
                const lastListInTarget = await list.findOne({
                    boardId: newBoardId,
                    archived: false
                }).sort({ position: -1 });

                listToMove.position = lastListInTarget ? lastListInTarget.position + 1 : 1;
            }

            listToMove.boardId = newBoardId;
        } else if (newPosition !== undefined) {
            // Same board, position change
            const currentLists = await list.find({
                boardId: listToMove.boardId,
                archived: false
            }).sort({ position: 1 });

            const maxPosition = currentLists.length;
            const oldPosition = listToMove.position;

            // Ensure newPosition is within valid range
            const validPosition = Math.max(1, Math.min(newPosition, maxPosition));

            if (validPosition !== oldPosition) {
                if (validPosition > oldPosition) {
                    // Moving down
                    await list.updateMany(
                        {
                            boardId: listToMove.boardId,
                            position: { $gt: oldPosition, $lte: validPosition },
                            archived: false
                        },
                        { $inc: { position: -1 } }
                    );
                } else {
                    // Moving up
                    await list.updateMany(
                        {
                            boardId: listToMove.boardId,
                            position: { $gte: validPosition, $lt: oldPosition },
                            archived: false
                        },
                        { $inc: { position: 1 } }
                    );
                }
                listToMove.position = validPosition;
            }
        }

        await listToMove.save();

        return res.status(200).json({
            status: 200,
            success: true,
            message: "List moved successfully",
            data: listToMove
        });

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, success: false, message: error.message })
    }
}

exports.archivedList = async (req, res) => {
    try {
        let id = req.params.id;
        let { archived } = req.body;

        // Find the list to be archived
        const listToArchive = await list.findById(id);
        if (!listToArchive) {
            return res.status(404).json({ status: 404, success: false, message: "List Not Found" });
        }

        // Check board membership
        const boardData = await board.findById(listToArchive.boardId);
        const isMember = boardData.members.some(
            member => member.user.toString() === req.user._id.toString()
        );

        if (!isMember) {
            return res.status(403).json({ status: 403, success: false, message: 'Not authorized to archive this list' });
        }

        // Archive the list
        listToArchive.archived = archived;
        await listToArchive.save();

        return res.status(200).json({
            status: 200,
            success: true,
            message: 'List archived successfully',
            data: listToArchive
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: 500, success: false, message: error.message });
    }
}