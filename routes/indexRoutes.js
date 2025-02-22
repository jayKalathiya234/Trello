const express = require('express');
const { createUser, getAllUsers, getUserById, updateUserById, deleteUserById } = require('../controller/userController');
const { loginUser, userGoggleLogin } = require('../auth/userLogin');
const { createWorkSpace, getAllWorkSpace, getWorkSpaceById, updateWorkSpaceById, deleteWorkSpaceById, joinWorkSpaceUsingLink, getMyWorkSpace, removeMemberFromWorkSpace, updateMemberRoleById, workSpaceJoinInvitaionLingUsingEmail } = require('../controller/workSpaceController');
const { auth } = require('../helper/auth');
const { createBoard, getAllBoards, getBorderById, joinBordByInvitationLink, updateBoardById, deleteBoardById, updateMemberRole, removeMemberFromBoard, getBoardByWorkSpaceId, getBoardJoinInvitaionLingUsingEmail, startedBoard, getAllStartedBoadr, setBoardCloseStatus, getAllCloseBoard, getAllBoardUserMembers, getAllBoardLabel, createBoardLabel, updateBoardLabel, deleteBoardLabel, copyBoard } = require('../controller/boardController');
const { createList, getAllListForBoard, updateListById, deleteListById, getListById, getArchivedListForBoard, getAllLists, copyListData, moveListData, archivedList } = require('../controller/listController');
const { createCard, updateCard, updateCardById, addMambers, createLabel, editLabelById, setStartDateAndDueDate, setAttachementById, createCustomFields, moveCardAndCopy, deleteCardDataById, removeMember, getAllCardData, getCardDataById, updateStartDateAndDueDateById, updateSetAttachement, removeLableById, updateCardData, getCardByList, moveAllCards, deleteAttachement, updateCustomFields, deleteCustomFields, getArchivedCard, archivedAllCardInList, archivedCardById, updateCheckList, createCheckList, deleteCheckList, createCover, updateCover, deleteCover, updateLabelId, updateCardCustomFields, deleteAllCheckList, updateCardChecklist, createCardChecklist, setCurrentTimeUsibngCardId, updateCheckListStatus } = require('../controller/cardController');
const upload = require('../helper/imageUplode');
const { createCustomField, editCustomField, deleteCustomField, addCustomFieldOption, updateCustomField, updateCustomFieldById, deleteCustomFieldById, updateCustomFieldfieldShownStatusById } = require('../controller/customFieldController');
const { exportWorkspaceData, getAllExportsData } = require('../controller/exportsController');
const indexRoutes = express.Router();

// Auth Routes

indexRoutes.post('/login', loginUser);
indexRoutes.post('/googleLogin', userGoggleLogin);

// User Routes

indexRoutes.post('/createUser', createUser);
indexRoutes.get('/allUsers', auth, getAllUsers);
indexRoutes.get('/getUser', auth, getUserById);
indexRoutes.put('/updateUser', auth, updateUserById);
indexRoutes.delete('/deleteUser', auth, deleteUserById);

// workSpace Routes

indexRoutes.post('/createWorkSpace', auth, createWorkSpace);
indexRoutes.get('/allWorkSpaces', auth, getAllWorkSpace);
indexRoutes.get('/getWorkSpace/:id', auth, getWorkSpaceById);
indexRoutes.put('/updateWorkSpace/:id', auth, updateWorkSpaceById);
indexRoutes.delete('/deleteWarkSpace/:id', auth, deleteWorkSpaceById);
indexRoutes.get('/joinWorkSpace/:id', auth, joinWorkSpaceUsingLink);
indexRoutes.get('/myWorkSpace', auth, getMyWorkSpace);
indexRoutes.put('/removeMemberWorkSpace/:id', auth, removeMemberFromWorkSpace)
indexRoutes.put('/updateMemberRole/:id', auth, updateMemberRoleById);
indexRoutes.post('/workSpaceJoinInvitaionLinkUsingEmail/:id', auth, workSpaceJoinInvitaionLingUsingEmail);

// board Routes 

indexRoutes.post('/createBoard', auth, createBoard);
indexRoutes.get('/allBoards', auth, getAllBoards)
indexRoutes.get('/getBoard/:id', auth, getBorderById);
indexRoutes.put('/updateBoard/:id', auth, updateBoardById);
indexRoutes.delete('/deleteBoard/:id', auth, deleteBoardById);
indexRoutes.get('/getBoardByWorkSpace/:id', auth, getBoardByWorkSpaceId);
indexRoutes.get('/joinBoardByInvitation/:id', auth, joinBordByInvitationLink);
indexRoutes.put('/updateBoardMemberRole/:id', auth, updateMemberRole);
indexRoutes.put('/removeBoardmember/:id', auth, removeMemberFromBoard)
indexRoutes.post('/boardInvitaionUsingEmail/:id', auth, getBoardJoinInvitaionLingUsingEmail);
indexRoutes.post('/setStartedBoard/:id', auth, startedBoard)
indexRoutes.get('/allStaredBoadrData/:id', auth, getAllStartedBoadr)
indexRoutes.post('/setBoardCloseStatus/:id', auth, setBoardCloseStatus)
indexRoutes.get('/allCloseBoard/:id', auth, getAllCloseBoard)
indexRoutes.get('/allMembersBoard/:id', auth, getAllBoardUserMembers);


indexRoutes.get('/getAllBoardLabels/:id', auth, getAllBoardLabel);
indexRoutes.post('/createBoardLabel/:id', auth, createBoardLabel);
indexRoutes.put('/updateBoardLabel/:id', auth, updateBoardLabel);
indexRoutes.delete('/deleteBoardLabel/:id', auth, deleteBoardLabel);
indexRoutes.post('/copyBoard/:id', auth, copyBoard);


// List Routes

indexRoutes.post('/createList', auth, createList);
indexRoutes.get('/allListForBoard/:id', auth, getAllListForBoard);
indexRoutes.get('/getList/:id', auth, getListById);
indexRoutes.get('/getArchivedList/:id', auth, getArchivedListForBoard);
indexRoutes.put('/updateList/:id', auth, updateListById);
indexRoutes.delete('/deleteList/:id', auth, deleteListById);
indexRoutes.get('/allLists/:id', auth, getAllLists);
indexRoutes.post('/copyList/:id', auth, copyListData);
indexRoutes.post('/moveList/:id', auth, moveListData);

indexRoutes.put('/archivelists/:id', auth, archivedList)

// card Routes

indexRoutes.post('/createCard', auth, createCard);
indexRoutes.post('/addMember/:id', auth, addMambers);
indexRoutes.get('/allCardData', auth, getAllCardData)
indexRoutes.get('/getCardData/:id', auth, getCardDataById)
indexRoutes.delete('/removeMember/:id', auth, removeMember);
indexRoutes.post('/createLabel/:id', auth, createLabel);
indexRoutes.put('/editLabel/:id', auth, editLabelById);
indexRoutes.delete('/deleteLabel/:id', removeLableById);
indexRoutes.post('/setDueDate/:id', auth, setStartDateAndDueDate)
indexRoutes.put('/updateStartDateAndDueDate/:id', auth, updateStartDateAndDueDateById)
indexRoutes.post('/setAttachmet/:id', auth, upload.fields([{ name: 'image' }]), setAttachementById);
indexRoutes.put('/updateAttachment/:id', auth, upload.fields([{ name: 'image' }]), updateSetAttachement)
indexRoutes.post('/createCustomField/:id', auth, createCustomFields);
indexRoutes.post('/moveCardAndCopy/:id', auth, moveCardAndCopy);
indexRoutes.delete('/deleteCard/:id', auth, deleteCardDataById);
indexRoutes.put('/updateCard/:id', auth, updateCardData);

indexRoutes.get('/getCardByList/:listId', auth, getCardByList);
indexRoutes.post('/moveAllCards', auth, moveAllCards);
indexRoutes.delete('/deleteAttachments', auth, deleteAttachement);
indexRoutes.get('/getArchivedcard/:id', auth, getArchivedCard);
indexRoutes.put('/archiveAllCardsList/:id', auth, archivedAllCardInList);
indexRoutes.put('/archiveCardById/:id', auth, archivedCardById);
// indexRoutes.post('/createCheckList/:id', auth, createCheckList);
indexRoutes.delete('/deleteAllCheckList/:id', auth, deleteAllCheckList);
indexRoutes.post('/createCover/:id', auth, upload.fields([{ name: 'image' }]), createCover);
indexRoutes.put('/updateCover/:id', auth, upload.fields([{ name: 'image' }]), updateCover);
indexRoutes.delete('/deleteCover/:id', auth, deleteCover);
indexRoutes.post('/updateLableId/:id', auth, updateLabelId)

// checkList 

indexRoutes.put('/createCheckList/:id', auth, createCardChecklist)
indexRoutes.put('/updateCheckList/:id', auth, updateCheckList);
indexRoutes.delete('/deleteCheckList/:id', auth, deleteCheckList);
indexRoutes.post('/setCurentTimeInCard/:id', auth, setCurrentTimeUsibngCardId)
indexRoutes.put('/updateCheckListStatus/:id', auth, updateCheckListStatus)

// CustomField

indexRoutes.put('/updateCustomField/:id', auth, editCustomField);
indexRoutes.delete('/deleteCustomField/:id', auth, deleteCustomField);
indexRoutes.post('/createCustom', auth, createCustomField);
indexRoutes.post('/addCustomFieldCard', auth, updateCardCustomFields);
indexRoutes.post('/addCustomFieldOption', auth, addCustomFieldOption);

indexRoutes.put('/addCustomeFiled/:id', auth, updateCustomFieldById)
indexRoutes.delete('/deleteCustomeFiled/:id', auth, deleteCustomFieldById)
indexRoutes.put('/updatefieldShownStatus/:id', auth, updateCustomFieldfieldShownStatusById)

// ExportsData Routes

indexRoutes.get('/exportData/:id', auth, exportWorkspaceData)
indexRoutes.get('/allExportData', auth, getAllExportsData)

module.exports = indexRoutes