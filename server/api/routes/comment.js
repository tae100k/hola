import { Router } from 'express'; 
import { isAccessTokenValid } from '../middlewares/index.js';
import { CommentService } from '../../services/index.js';
import { asyncErrorWrapper } from '../../asyncErrorWrapper.js';
import { Study as studyModel } from '../../models/Study.js';
import { Notification as notificationModel} from '../../models/Notification.js';

const route = Router();

export default (app) => {
    /*
    댓글에 관련된 Router를 정의한다.
    등록 / 수정 / 삭제하려는 사용자의 정보는 Access Token을 이용하여 처리한다.

    # GET /studies/comments/:id : 스터디의 댓글 리스트 조회
    # POST /studies/comments : 신규 댓글 등록
    # PATCH /studies/comments/:id : 댓글 정보 수정
    # DELETE /studies/comments/:id : 댓글 삭제
    */
  app.use('/studies/comments', route);
  
  // 댓글 리스트 조회
  route.get('/:id', asyncErrorWrapper(async (req, res, next) => {
    const id = req.params.id;

    let CommentServiceInstance = new CommentService({studyModel, notificationModel});
    const comments = await CommentServiceInstance.findComments(id);

    res.status(200).json(comments);
  }));

  // 댓글 등록
  route.post('/', isAccessTokenValid, asyncErrorWrapper(async (req, res, next) => {
    const commentDTO = req.body;
    const userId = req.user._id;

    let CommentServiceInstance = new CommentService({studyModel, notificationModel});
    const study = await CommentServiceInstance.registerComment(userId, commentDTO);

    return res.status(201).json(study);
  }));

  // 댓글 수정
  route.patch('/:id', isAccessTokenValid, asyncErrorWrapper(async (req, res, next) => {
    const commentDTO = req.body;
    commentDTO.id = req.params.id;
    const tokenUserId = req.user._id;

    let CommentServiceInstance = new CommentService({studyModel, notificationModel});
    const comment = await CommentServiceInstance.modifyComment(commentDTO, tokenUserId);

    res.status(200).json(comment);
  }));

  // 댓글 삭제
  route.delete('/:id', isAccessTokenValid, asyncErrorWrapper(async (req, res, next) => {
    const commentId = req.params.id;
    const userId = req.user._id;

    let CommentServiceInstance = new CommentService({studyModel, notificationModel});
    await CommentServiceInstance.deleteComment(commentId, userId);
    res.status(204).json();
  }));
}