const express = require('express');
const { createUser, getAllUsers, getUserById, updateUserById, deleteUserById } = require('../controller/userController');
const { loginUser, userGoggleLogin } = require('../auth/userLogin');
const { createWorkSpace, getAllWorkSpace, getWorkSpaceById, updateWorkSpaceById, deleteWorkSpaceById, joinWorkSpaceUsingLink, getMyWorkSpace, removeMemberFromWorkSpace, updateMemberRoleById, workSpaceJoinInvitaionLingUsingEmail } = require('../controller/workSpaceController');
const { auth } = require('../helper/auth');
const { createBoard, getAllBoards, getBorderById, joinBordByInvitationLink, updateBoardById, deleteBoardById, updateMemberRole, removeMemberFromBoard, getBoardByWorkSpaceId, getBoardJoinInvitaionLingUsingEmail, startedBoard, getAllStartedBoadr, setBoardCloseStatus, getAllCloseBoard, getAllBoardUserMembers } = require('../controller/boardController');
const { createList, getAllListForBoard, updateListById, deleteListById, getListById, getArchivedListForBoard, getAllLists } = require('../controller/listController');
const { createCard, updateCard, updateCardById, addMambers, createLabel, editLabelById, setStartDateAndDueDate, setAttachementById, createCustomFields, moveCardAndCopy, deleteCardDataById, removeMember, getAllCardData, getCardDataById, updateStartDateAndDueDateById } = require('../controller/cardController');
const upload = require('../helper/imageUplode');
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

// List Routes

indexRoutes.post('/createList', auth, createList);
indexRoutes.get('/allListForBoard/:id', auth, getAllListForBoard);
indexRoutes.get('/getList/:id', auth, getListById);
indexRoutes.get('/getArchivedList/:id', auth, getArchivedListForBoard);
indexRoutes.put('/updateList/:id', auth, updateListById);
indexRoutes.delete('/deleteList/:id', auth, deleteListById);
indexRoutes.get('/allLists/:id', auth, getAllLists);

// card Routes

indexRoutes.post('/createCard', auth, createCard);
indexRoutes.post('/addMember/:id', auth, addMambers);
indexRoutes.get('/allCardData', auth, getAllCardData)
indexRoutes.get('/getCardData/:id', auth, getCardDataById)
indexRoutes.delete('/removeMember/:id', auth, removeMember);
indexRoutes.post('/createLabel/:id', auth, createLabel);
indexRoutes.put('/editLabel/:id', auth, editLabelById);
indexRoutes.post('/setDueDate/:id', auth, setStartDateAndDueDate)
indexRoutes.put('/updateStartDateAndDueDate/:id', auth, updateStartDateAndDueDateById)
indexRoutes.post('/setAttachmet/:id', auth, upload.fields([{ name: 'image' }]), setAttachementById);
indexRoutes.post('/createCustomField/:id', auth, createCustomFields);
indexRoutes.post('/moveCardAndCopy/:id', auth, moveCardAndCopy);
indexRoutes.delete('/deleteCard/:id', auth, deleteCardDataById);

module.exports = indexRoutes
