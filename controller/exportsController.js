const mongoose = require('mongoose');
const Workspace = require('../models/workSpaceModels');
const Board = require('../models/boardModels');
const List = require('../models/listModel');
const Card = require('../models/cardModel');
const exportsData = require('../models/exportModel');

exports.exportWorkspaceData = async (req, res) => {
    try {
        const workspaceId = req.params.id;
        const currentDate = new Date();

        if (!mongoose.Types.ObjectId.isValid(workspaceId)) {
            return res.status(400).json({
                status: 400,
                success: false,
                message: "Invalid Workspace ID Format"
            });
        }

        const workspaceData = await Workspace.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(workspaceId)
                }
            },
            {
                $lookup: {
                    from: 'boards',
                    let: { workSpaceId: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ['$workSpaceId', '$$workSpaceId'] }
                            }
                        },
                        {
                            $lookup: {
                                from: 'lists',
                                let: { boardId: '$_id' },
                                pipeline: [
                                    {
                                        $match: {
                                            $expr: { $eq: ['$boardId', '$$boardId'] }
                                        }
                                    },
                                    {
                                        $lookup: {
                                            from: 'cards',
                                            let: { listId: '$_id' },
                                            pipeline: [
                                                {
                                                    $match: {
                                                        $expr: { $eq: ['$listId', '$$listId'] }
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
                                                    $lookup: {
                                                        from: 'customfields',
                                                        let: { boardId: '$$boardId' },
                                                        pipeline: [
                                                            {
                                                                $match: {
                                                                    $expr: { $eq: ['$boardId', '$$boardId'] }
                                                                }
                                                            }
                                                        ],
                                                        as: 'customFieldsData'
                                                    }
                                                },
                                                {
                                                    $project: {
                                                        _id: 1,
                                                        title: 1,
                                                        description: 1,
                                                        position: 1,
                                                        archived: 1,
                                                        attachments: 1,
                                                        checkList: 1,
                                                        label: 1,
                                                        dueDate: 1,
                                                        startDate: 1,
                                                        member: 1,
                                                        memberDetails: 1,
                                                        customFields: 1,
                                                        comments: 1,
                                                        cover: 1,
                                                        createdAt: 1,
                                                        updatedAt: 1
                                                    }
                                                }
                                            ],
                                            as: 'cards'
                                        }
                                    },
                                    {
                                        $project: {
                                            _id: 1,
                                            title: 1,
                                            position: 1,
                                            archived: 1,
                                            color: 1,
                                            cards: 1,
                                            createdAt: 1,
                                            updatedAt: 1
                                        }
                                    }
                                ],
                                as: 'lists'
                            }
                        },
                        {
                            $project: {
                                _id: 1,
                                title: 1,
                                description: 1,
                                visibility: 1,
                                background: 1,
                                starred: 1,
                                label: 1,
                                member: 1,
                                lists: 1,
                                createdAt: 1,
                                updatedAt: 1
                            }
                        }
                    ],
                    as: 'boards'
                }
            },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    description: 1,
                    visibility: 1,
                    boards: 1,
                    createdAt: 1,
                    updatedAt: 1
                }
            }
        ]);

        if (!workspaceData || workspaceData.length === 0) {
            return res.status(404).json({ status: 404, success: false, message: "Workspace Not Found" });
        }

        const exportData = {
            workspace: workspaceData[0]
        };

        const newExport = await exportsData.create({
            workspaceId: workspaceId,
            exportedBy: req.user._id,
            exportedDate: currentDate,
            exportData: exportData
        });

        return res.status(200).json({ status: 200, success: true, message: "Workspace Data Exported Successfully...", data: exportData });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: 500, success: false, message: error.message });
    }
};

exports.getAllExportsData = async (req, res) => {
    try {
        let getExportsData = await exportsData.find({ exportedBy: req.user._id })

        if (!getExportsData) {
            return res.status(404).json({ status: 404, success: false, message: "Exports Data Not Found" })
        }

        return res.status(200).json({ status: 200, success: true, message: "All Exports Data Found SuccessFully...", data: getExportsData })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, success: false, message: error.message })
    }
}
