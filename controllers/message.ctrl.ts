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

const MessageCtrl = {
  post,
};

export default MessageCtrl;
