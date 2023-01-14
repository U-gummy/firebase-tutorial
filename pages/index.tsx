import { NextPage } from 'next';

import Layout from '@/component/Layout';
import { useAuth } from '@/contexts/auth_user.context';

const IndexPage: NextPage = function () {
  const { signInWithGoogle } = useAuth();

  return (
    <Layout title="test" minHeight="100vh" backgroundColor="gray.50">
      <button type="button" onClick={signInWithGoogle}>
        구글로그인
      </button>
    </Layout>
  );
};

export default IndexPage;
