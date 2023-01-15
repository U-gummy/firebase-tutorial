// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { NextApiRequest, NextApiResponse } from 'next';
import FirebaseAdmin from '@/models/firebase_admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { uid, email, displayName, photoURL } = req.body;
  console.log('uid, email, displayName, photoURL: ', uid, email, displayName, photoURL);
  if (uid === undefined || uid === null) {
    return res.status(400).json({ result: false, message: 'uid가 누락 되었습니다.' });
  }
  try {
    const addResult = await FirebaseAdmin.getInstance()
      .Firebase.collection('members')
      .doc(uid)
      .set({
        uid,
        email: email ?? '',
        displayName: displayName ?? '',
        photoURL: photoURL ?? '',
      });
    return res.status(200).json({ result: true, id: addResult });
  } catch (err) {
    console.log('err: ', err);
    res.status(500).json({ result: false, message: '에러' });
  }
}
