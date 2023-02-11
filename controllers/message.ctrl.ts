import { NextApiRequest, NextApiResponse } from 'next';
import MessageModal from '@/models/message/message.modal';
import BadReqError from './error/bad_request_error';

async function post(req: NextApiRequest, res: NextApiResponse) {
  const { uid, message, author } = req.body;

  if (!uid) {
    throw new BadReqError('uid가 누락 되었습니다.');
  }

  if (!message) {
    throw new BadReqError('message가 누락 되었습니다.');
  }
  await MessageModal.post({ uid, message, author });
  return res.status(201).end();
}

async function list(req: NextApiRequest, res: NextApiResponse) {
  const { uid, page, size } = req.query;

  if (!uid) {
    throw new BadReqError('uid가 누락 되었습니다.');
  }

  const convertPage = page ?? '1';
  const convertSize = size ?? '10';

  const uidToStr = Array.isArray(uid) ? uid[0] : uid;
  const pageToStr = Array.isArray(convertPage) ? convertPage[0] : convertPage;
  const sizeToStr = Array.isArray(convertSize) ? convertSize[0] : convertSize;

  const listResp = await MessageModal.listWithPage({
    uid: uidToStr,
    page: parseInt(pageToStr, 10),
    size: parseInt(sizeToStr, 10),
  });
  return res.status(200).json(listResp);
}

async function get(req: NextApiRequest, res: NextApiResponse) {
  const { uid, messageId } = req.query;

  if (!uid) {
    throw new BadReqError('uid가 누락 되었습니다.');
  }

  if (!messageId) {
    throw new BadReqError('messageId가 누락 되었습니다.');
  }

  const uidToStr = Array.isArray(uid) ? uid[0] : uid;
  const messageIdToStr = Array.isArray(messageId) ? messageId[0] : messageId;

  const data = await MessageModal.get({ uid: uidToStr, messageId: messageIdToStr });
  return res.status(200).json(data);
}

async function postReply(req: NextApiRequest, res: NextApiResponse) {
  const { uid, messageId, reply } = req.body;

  if (!uid) {
    throw new BadReqError('uid가 누락 되었습니다.');
  }

  if (!messageId) {
    throw new BadReqError('messageId가 누락 되었습니다.');
  }

  if (!reply) {
    throw new BadReqError('reply가 누락 되었습니다.');
  }

  await MessageModal.postReply({ uid, messageId, reply });
  return res.status(201).end();
}

const MessageCtrl = {
  post,
  list,
  get,
  postReply,
};

export default MessageCtrl;
