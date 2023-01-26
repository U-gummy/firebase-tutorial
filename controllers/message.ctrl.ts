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
  const { uid } = req.query;

  if (!uid) {
    throw new BadReqError('uid가 누락 되었습니다.');
  }

  const uidToStr = Array.isArray(uid) ? uid[0] : uid;
  const listResp = await MessageModal.list({ uid: uidToStr });
  return res.status(200).json(listResp);
}

const MessageCtrl = {
  post,
  list,
};

export default MessageCtrl;
