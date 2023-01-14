import { useAuth } from '@/contexts/auth_user.context';
import { Box, Button, Flex } from '@chakra-ui/react';
import React from 'react';

export const Header = function () {
  const { loading, authUser, signOut, signInWithGoogle } = useAuth();

  const loginButton = (
    <Button backgroundColor="#ff7167" color="#333" border="2px solid #333" onClick={signInWithGoogle}>
      로그인
    </Button>
  );

  const logoutButton = (
    <Button as="a" variant="link" onClick={signOut} color="#333" fontSize="">
      로그아웃
    </Button>
  );

  const authInitialized = loading || authUser === null;

  return (
    <Box borderBottom="2px solid #333">
      <Flex minH="60px" backgroundColor="#46afff" justifyContent="space-between" align="center" px="15px">
        <img style={{ height: '40px' }} src="/btn_cancel.png" />
        {authInitialized ? loginButton : logoutButton}
      </Flex>
    </Box>
  );
};
