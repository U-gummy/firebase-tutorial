import { getApps, initializeApp } from 'firebase/app';
import { Auth, getAuth } from 'firebase/auth';
import getConfig from 'next/config';

const { publicRuntimeConfig } = getConfig();
const FirebaseCredentials = {
  apiKey: publicRuntimeConfig.apiKey,
  authDomain: publicRuntimeConfig.authDomain,
  projectId: publicRuntimeConfig.projectId,
};

export default class FirebaseClient {
  private static instance: FirebaseClient;

  private auth: Auth;

  private constructor() {
    const apps = getApps();

    if (apps.length === 0) {
      console.log('init');
      initializeApp(FirebaseCredentials);
    }

    this.auth = getAuth();
    console.log('firebase auth');
  }

  public get Auth(): Auth {
    return this.auth;
  }

  public static getInstance(): FirebaseClient {
    if (FirebaseClient.instance === undefined || FirebaseClient.instance === null) {
      FirebaseClient.instance = new FirebaseClient();
    }

    return FirebaseClient.instance;
  }
}
