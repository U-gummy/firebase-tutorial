import FirebaseAdmin from '../firebase_admin';
import { InAuthUser } from '../in_auth_user';

const MEMBER_COL = 'member';
const SCREEN_NAME_COL = 'screen_name';

type AddResult = { result: true; id: string } | { result: false; message: string };

async function add({ uid, email, displayName, photoURL }: InAuthUser): Promise<AddResult> {
  try {
    const screenName = (email as string).replace('@gmail.com', '');

    const addResult = await FirebaseAdmin.getInstance().Firebase.runTransaction(async (transaction) => {
      const memberRef = FirebaseAdmin.getInstance().Firebase.collection(MEMBER_COL).doc(uid);
      const screenNameRef = FirebaseAdmin.getInstance().Firebase.collection(SCREEN_NAME_COL).doc(screenName);
      const memberDoc = await transaction.get(memberRef);

      if (memberDoc.exists) {
        return false;
      }

      const addData = { uid, email, displayName: displayName ?? '', photoURL: photoURL ?? '' };

      await transaction.set(memberRef, addData);
      await transaction.set(screenNameRef, addData);
      return true;
    });

    if (!addResult) {
      return { result: true, id: uid };
    }

    return { result: true, id: uid };
  } catch (err) {
    console.log('err: ', err);
    return { result: false, message: '에러' };
  }
}

const MemberModel = { add };

export default MemberModel;
