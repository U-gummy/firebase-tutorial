// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { NextApiRequest, NextApiResponse } from 'next';
import FirebaseAdmin from '@/models/firebase_admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { uid, email, displayName, photoURL } = req.body;

  if (uid === undefined || uid === null) {
    return res.status(400).json({ result: false, message: 'uid가 누락 되었습니다.' });
  }

  if (email === undefined || email === null) {
    return res.status(400).json({ result: false, message: 'email가 누락 되었습니다.' });
  }

  try {
    const screenName = email.replace('@gmail.com', '');

    const addResult = await FirebaseAdmin.getInstance().Firebase.runTransaction(async (transaction) => {
      const memberRef = FirebaseAdmin.getInstance().Firebase.collection('member').doc(uid);
      const screenNameRef = FirebaseAdmin.getInstance().Firebase.collection('screen_name').doc(screenName);
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
      return res.status(201).json({ result: true, id: uid });
    }

    return res.status(200).json({ result: true, id: uid });
  } catch (err) {
    console.log('err: ', err);
    res.status(500).json({ result: false, message: '에러' });
  }
}
