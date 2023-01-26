import { useState, useEffect } from 'react';
import { GetServerSideProps, NextPage } from 'next';
import ResizeTextarea from 'react-textarea-autosize';
import axios, { AxiosResponse } from 'axios';
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
  useToast,
  VStack,
} from '@chakra-ui/react';

import Layout from '@/component/Layout';
import { useAuth } from '@/contexts/auth_user.context';
import { InAuthUser } from '@/models/in_auth_user';
import MessageItem from '@/component/message_item';
import { InMessage } from '@/models/message/in_message';

interface Props {
  userInfo: InAuthUser | null;
}

async function postMessage({
  uid,
  message,
  author,
}: {
  uid: string;
  message: string;
  author?: { displayName: string; photoURL?: string };
}) {
  if (message.length <= 0) {
    return {
      result: false,
      message: '메시지를 입력해 주세요',
    };
  }
  try {
    await fetch('/api/messages.add', {
      method: 'post',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ uid, message, author }),
    });
    return {
      result: true,
    };
  } catch (err) {
    console.log(err);
    return { result: false, message: '메세지 등록 실패' };
  }
}

const UserHomePage: NextPage<Props> = function ({ userInfo }) {
  const [message, setMessage] = useState('');
  const [isAnonymous, setAnonymous] = useState(false);
  const [messageList, setMessageList] = useState<InMessage[]>([]);

  const toast = useToast();
  const { authUser } = useAuth();
  const IMAGE_URL = '/user.jpeg';
  if (!userInfo) {
    return <p>사용자를 찾을 수 없습니다.</p>;
  }

  const fetchMessageList = async (uid: string) => {
    try {
      const resp = await fetch(`/api/messages.list?uid=${uid}`);
      if (resp.status === 200) {
        const data = await resp.json();
        setMessageList(data);
      }
    } catch (err) {
      console.log(err);
    }
  };

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    if (!userInfo) return;
    fetchMessageList(userInfo.uid);
  }, [userInfo]);

  return (
    <Layout title={`${userInfo.displayName}의 홈`} minHeight="100vh" bgColor="gray.50">
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
          <Button
            bgColor="#FFBB6C"
            color="#fff"
            colorScheme="yellow"
            ml="8px"
            fontSize="xs"
            disabled={!message}
            onClick={async () => {
              const postData: {
                message: string;
                uid: string;
                author?: {
                  displayName: string;
                  photoURL?: string;
                };
              } = { message, uid: userInfo.uid };
              if (!isAnonymous) {
                postData.author = {
                  photoURL: authUser?.photoURL ?? IMAGE_URL,
                  displayName: authUser?.displayName ?? 'anonymous',
                };
              }

              const messageResp = await postMessage(postData);
              if (!messageResp.result) {
                toast({ title: '메세지 등록 실패', position: 'bottom' });
              }
              setMessage('');
            }}
          >
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
        <VStack spacing="12px" mt="6">
          {messageList.map((messageData) => (
            <MessageItem
              key={messageData.id + userInfo.uid}
              item={messageData}
              uid={userInfo.uid}
              displayName={userInfo.displayName ?? ''}
              photoURL={userInfo.photoURL ?? IMAGE_URL}
              isOwner={!!(authUser && authUser.uid === userInfo.uid)}
            />
          ))}
        </VStack>
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
