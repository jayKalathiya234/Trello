const customfield = require('../models/CustomFieldModel');

exports.createCustomField = async (req, res) => {
    try {
        const { boardId, field } = req.body;

        // Validate required fields
        if (!boardId || !field || !Array.isArray(field)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid input data. BoardId and field array are required'
            });
        }

        // Create new custom field
        const newCustomField = await customfield.create({
            boardId,
            field
        });

        res.status(201).json({
            success: true,
            message: 'Custom field created successfully',
            data: newCustomField
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating custom field',
            error: error.message
        });
    }
};

exports.editCustomField = async (req, res) => {
    try {
        const { boardId, fieldId: targetFieldId, fieldOptionId, updatedOption, fieldLabel } = req.body;
        const customFieldId = req.params.id;


        // Validate required fields
        if (!boardId || !targetFieldId || (!fieldOptionId && !fieldLabel) || (!updatedOption && !fieldLabel)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid input data. Either fieldOptionId with updatedOption, or fieldLabel is required'
            });
        }

        // First, find the existing custom field
        const existingCustomField = await customfield.findById(customFieldId);

        if (!existingCustomField) {
            return res.status(404).json({
                success: false,
                message: 'Custom field not found',
                existingCustomField, customFieldId
            });
        }


        // Find the specific field to update
        const targetField = existingCustomField.field.find(f => f._id.toString() === targetFieldId);
        if (!targetField) {
            return res.status(404).json({
                success: false,
                message: 'Field not found',
                existingCustomField
            });
        }

        // Update field label if provided
        if (fieldLabel) {
            targetField.fieldLabel = fieldLabel;
        }

        // Update field option if provided
        if (fieldOptionId && updatedOption) {
            const optionIndex = targetField.fieldOptions.findIndex(opt => opt._id.toString() === fieldOptionId);
            if (optionIndex === -1) {
                return res.status(404).json({
                    success: false,
                    message: 'Field option not found'
                });
            }

            targetField.fieldOptions[optionIndex] = {
                ...targetField.fieldOptions[optionIndex].toObject(),
                ...updatedOption
            };
        }

        // Save the updated document
        const updatedCustomField = await customfield.findByIdAndUpdate(
            customFieldId,
            { field: existingCustomField.field },
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: 'Field option updated successfully',
            data: updatedCustomField
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating field option',
            error: error.message
        });
    }
};

exports.deleteCustomField = async (req, res) => {
    try {
        const fieldOptionId = req.params.id;

        // Validate required fields
        if (!fieldOptionId) {
            return res.status(400).json({
                success: false,
                message: 'fieldOptionId is required in request body'
            });
        }

        // Find the custom field containing the option
        const existingCustomField = await customfield.findOne({
            'field.fieldOptions._id': fieldOptionId
        });

        if (!existingCustomField) {
            return res.status(404).json({
                success: false,
                message: 'Field option not found'
            });
        }

        // Find the field containing the option to delete
        const targetField = existingCustomField.field.find(f =>
            f.fieldOptions.some(opt => opt._id.toString() === fieldOptionId)
        );

        // Remove the specific field option
        targetField.fieldOptions = targetField.fieldOptions.filter(
            opt => opt._id.toString() !== fieldOptionId
        );

        // Save the updated document
        const updatedCustomField = await customfield.findByIdAndUpdate(
            existingCustomField._id,
            { field: existingCustomField.field },
            { new: true }
        );

        res.status(200).json({
            success: true,
            message: 'Field option deleted successfully',
            data: updatedCustomField
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting field option',
            error: error.message
        });
    }
};

exports.addCustomFieldOption = async (req, res) => {
    try {
        const { boardId, fieldId, newOption } = req.body;

        // Validate required fields
        if (!boardId || !fieldId || !newOption) {
            return res.status(400).json({
                success: false,
                message: 'Invalid input data. BoardId, fieldId, and newOption are required'
            });
        }

        // Find the existing custom field
        const existingCustomField = await customfield.findOne({ boardId, 'field._id': fieldId });

        if (!existingCustomField) {
            return res.status(404).json({
                success: false,
                message: 'Custom field not found'
            });
        }

        // Find the specific field to update
        const targetField = existingCustomField.field.find(f => f._id.toString() === fieldId);
        if (!targetField) {
            return res.status(404).json({
                success: false,
                message: 'Field not found'
            });
        }

        // Add the new option to the field options
        targetField.fieldOptions.push(newOption);

        // Save the updated document
        const updatedCustomField = await customfield.findByIdAndUpdate(
            existingCustomField._id,
            { field: existingCustomField.field },
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: 'Field option added successfully',
            data: updatedCustomField
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error adding field option',
            error: error.message
        });
    }
};

exports.updateCustomFieldById = async (req, res) => {
    try {
        let boardId = req.params.id

        const { field } = req.body;

        const customField = await customfield.findOne({ boardId });

        if (!customField) {
            return res.status(404).json({ success: false, message: 'Custom field not found for the given boardId' });
        }

        customField.field.push(...field);

        await customField.save();

        return res.status(200).json({ success: true, message: 'Custom field updated successfully', data: customField });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteCustomFieldById = async (req, res) => {
    try {
        const fieldId = req.params.id;

        const customField = await customfield.findOne({ "field._id": fieldId });

        if (!customField) {
            return res.status(404).json({ success: false, message: 'Board not found or field not in the board' });
        }

        const fieldIndex = customField.field.findIndex(field => field._id.toString() === fieldId);

        if (fieldIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Field not found for the given fieldId'
            });
        }

        customField.field.splice(fieldIndex, 1);

        await customField.save();

        return res.status(200).json({
            success: true,
            message: 'Custom field deleted successfully',
            data: customField
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateCustomFieldfieldShownStatusById = async (req, res) => {
    try {
        const fieldId = req.params.id;
        const { fieldShown } = req.body;
        if (fieldShown === undefined) {
            return res.status(400).json({
                success: false,
                message: 'fieldShown is required to update.'
            });
        }

        const customField = await customfield.findOne({ "field._id": fieldId });

        if (!customField) {
            return res.status(404).json({
                success: false,
                message: 'Board not found or field not in the board'
            });
        }

        // Find the index of the field to update
        const fieldIndex = customField.field.findIndex(field => field._id.toString() === fieldId);

        if (fieldIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Field not found for the given fieldId'
            });
        }

        // Update the fieldShown value at the found index
        customField.field[fieldIndex].fieldShown = fieldShown;

        // Save the updated custom field document
        await customField.save();

        return res.status(200).json({
            success: true,
            message: 'Custom field fieldShown updated successfully',
            data: customField
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};