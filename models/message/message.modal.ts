import { firestore } from 'firebase-admin';
import CustomServerError from '@/controllers/error/custom_server_error';
import FirebaseAdmin from '../firebase_admin';

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

const MessageModal = {
  post,
};

export default MessageModal;
