import { firestore } from 'firebase-admin';
import CustomServerError from '@/controllers/error/custom_server_error';
import FirebaseAdmin from '../firebase_admin';
import { InMessage, InMessageServer } from './in_message';

const MEMBER_COL = 'member';
const SCREEN_NAME_COL = 'screen_name';
const MESSAGE_COL = 'message';

const { Firestore } = FirebaseAdmin.getInstance();

async function post({
  uid,
  message,
  author,
}: {
  uid: string;
  message: string;
  author?: {
    displayName: string;
    photoURL?: string;
  };
}) {
  const memberRef = Firestore.collection(MEMBER_COL).doc(uid);

  await Firestore.runTransaction(async (transaction) => {
    const memberDoc = await transaction.get(memberRef);
    if (!memberDoc.exists) {
      throw new CustomServerError({ statusCode: 400, message: '존재하지 않는 사용자입니다.' });
    }

    const newMessageRef = memberRef.collection(MESSAGE_COL).doc();
    const newMessageBody: {
      message: string;
      createAt: firestore.FieldValue;
      author?: {
        displayName: string;
        photoURL?: string;
      };
    } = {
      message,
      createAt: firestore.FieldValue.serverTimestamp(),
    };

    if (author) {
      newMessageBody.author = author;
    }

    await transaction.set(newMessageRef, newMessageBody);
  });
}

async function list({ uid }: { uid: string }) {
  const memberRef = Firestore.collection(MEMBER_COL).doc(uid);

  const listData = await Firestore.runTransaction(async (transaction) => {
    const memberDoc = await transaction.get(memberRef);
    if (!memberDoc.exists) {
      throw new CustomServerError({ statusCode: 400, message: '존재하지 않는 사용자입니다.' });
    }

    const messageCol = memberRef.collection(MESSAGE_COL).orderBy('createAt', 'desc');
    const messageColDoc = await transaction.get(messageCol);
    const data = messageColDoc.docs.map((mv) => {
      const docData = mv.data() as Omit<InMessageServer, 'id'>;
      const returnData = {
        ...docData,
        id: mv.id,
        createAt: docData.createAt.toDate().toISOString(),
        replyAt: docData.replyAt ? docData.replyAt.toDate().toISOString() : undefined,
      } as InMessage;
      return returnData;
    });
    return data;
  });
  return listData;
}

async function get({ uid, messageId }: { uid: string; messageId: string }) {
  const memberRef = Firestore.collection(MEMBER_COL).doc(uid);
  const messageRef = memberRef.collection(MESSAGE_COL).doc(messageId);

  const data = await Firestore.runTransaction(async (transaction) => {
    const memberDoc = await transaction.get(memberRef);
    const messageDoc = await transaction.get(messageRef);

    if (!memberDoc.exists) {
      throw new CustomServerError({ statusCode: 400, message: '존재하지 않는 사용자입니다.' });
    }

    if (!messageDoc.exists) {
      throw new CustomServerError({ statusCode: 400, message: '존재하지 않는 문서입니다.' });
    }

    const messageData = messageDoc.data() as InMessageServer;

    return {
      ...messageData,
      id: messageId,
      createAt: messageData.createAt.toDate().toISOString(),
      replyAt: messageData.replyAt ? messageData.replyAt.toDate().toISOString() : undefined,
    };
  });
  return data;
}

async function postReply({ uid, messageId, reply }: { uid: string; messageId: string; reply: string }) {
  const memberRef = Firestore.collection(MEMBER_COL).doc(uid);
  const messageRef = memberRef.collection(MESSAGE_COL).doc(messageId);

  await Firestore.runTransaction(async (transaction) => {
    const memberDoc = await transaction.get(memberRef);
    const messageDoc = await transaction.get(messageRef);

    if (!memberDoc.exists) {
      throw new CustomServerError({ statusCode: 400, message: '존재하지 않는 사용자입니다.' });
    }

    if (!messageDoc.exists) {
      throw new CustomServerError({ statusCode: 400, message: '존재하지 않는 문서입니다.' });
    }

    const messageData = messageDoc.data() as InMessageServer;
    if (messageData.reply) {
      throw new CustomServerError({ statusCode: 400, message: '이미 댓글을 입력했습니다.' });
    }

    await transaction.update(messageRef, { reply, replyAt: firestore.FieldValue.serverTimestamp() });
  });
}

const MessageModal = {
  post,
  list,
  get,
  postReply,
};

export default MessageModal;
