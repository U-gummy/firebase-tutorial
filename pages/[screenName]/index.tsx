import { GetServerSideProps, NextPage } from 'next';
import ResizeTextarea from 'react-textarea-autosize';

import {
  Avatar,
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Switch,
  Text,
  Textarea,
  Toast,
  useToast,
} from '@chakra-ui/react';
import { useState } from 'react';
import axios, { AxiosResponse } from 'axios';
import Layout from '@/component/Layout';
import { useAuth } from '@/contexts/auth_user.context';
import { InAuthUser } from '@/models/in_auth_user';

interface Props {
  userInfo: InAuthUser | null;
}

const UserHomePage: NextPage<Props> = function ({ userInfo }) {
  const [message, setMessage] = useState('');
  const [isAnonymous, setAnonymous] = useState(false);

  const toast = useToast();
  const { authUser } = useAuth();
  const IMAGE_URL = '/user.jpeg';
  if (!userInfo) {
    return <p>사용자를 찾을 수 없습니다.</p>;
  }

  return (
    <Layout title="test" minHeight="100vh" bgColor="gray.50">
      <Box maxW="md" mx="auto" padding="10px">
        <Flex border="2px solid #333" borderRadius="lg" padding=" 10px">
          <Avatar size="lg" src={userInfo.photoURL ?? 'IMAGE_URL'} />
          <Flex direction="column" justify="center" pl="15px">
            <Text fontSize="md">{userInfo.displayName}</Text>
            <Text fontSize="xs">{userInfo.email}</Text>
          </Flex>
        </Flex>
      </Box>
      <Box maxW="md" mx="auto" padding="10px">
        <Flex align="center">
          <Avatar size="xs" src={isAnonymous ? IMAGE_URL : authUser?.photoURL ?? IMAGE_URL} />

          <Textarea
            bg="gray.100"
            border="none"
            placeholder="무엇이 궁금한가요"
            resize="none"
            minH="unset"
            fontSize="xs"
            padding="2"
            ml="8px"
            maxRows={7}
            borderRadius="lg"
            as={ResizeTextarea}
            value={message}
            onChange={({ currentTarget }) => {
              if (currentTarget.value) {
                const lineCount = currentTarget.value.match(/[^\n]*\n[^\n]*/gi)?.length ?? 1;
                if (lineCount >= 7) {
                  return toast({
                    title: '최대 7줄까지만 입력 가능합니다.',
                    position: 'bottom',
                  });
                }
              }
              setMessage(currentTarget.value);
            }}
          />
          <Button bgColor="#FFBB6C" color="#fff" colorScheme="yellow" ml="8px" fontSize="xs" disabled={!message}>
            등록
          </Button>
        </Flex>
        <FormControl display="flex" alignItems="center" mt="1" padding="0 2px">
          <Switch
            size="sm"
            colorScheme="orange"
            id="anonymous"
            mr="1"
            isChecked={isAnonymous}
            onChange={() => {
              if (!authUser) {
                return toast({
                  title: '로그인이 필요합니다.',
                  position: 'bottom',
                });
              }
              setAnonymous((prev) => !prev);
            }}
          />
          <FormLabel htmlFor="anonymous" fontSize="small" margin="0">
            anonymous
          </FormLabel>
        </FormControl>
      </Box>
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps<Props> = async ({ query }) => {
  const { screenName } = query;
  if (!screenName) {
    return {
      props: {
        userInfo: null,
      },
    };
  }
  try {
    const protocol = process.env.PROTOCOL || 'http';
    const host = process.env.HOST || 'localhost';
    const port = process.env.PORT || '3000';
    const baseUrl = `${protocol}://${host}:${port}`;
    const userInfoResp: AxiosResponse<InAuthUser> = await axios(`${baseUrl}/api/user.info/${screenName}`);

    return {
      props: {
        userInfo: userInfoResp.data ?? null,
      },
    };
  } catch (err) {
    console.log('err: ', err);
    return {
      props: {
        userInfo: null,
      },
    };
  }
};
export default UserHomePage;
