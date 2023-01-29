import { Avatar, Flex, Box, Text, Divider, Textarea, Button } from '@chakra-ui/react';
import ResizeTextarea from 'react-textarea-autosize';

import { useState } from 'react';
import { InMessage } from '@/models/message/in_message';
import convertDateToString from '@/utils/convert_date_to_string';

interface Props {
  uid: string;
  displayName: string;
  isOwner: boolean;
  item: InMessage;
  photoURL: string;
  onSendComplete(): void;
}

const MessageItem = function ({ uid, photoURL, displayName, isOwner, item, onSendComplete }: Props) {
  const haveRely = item.reply !== undefined;
  const [reply, setReply] = useState('');

  const postReply = async () => {
    const resp = await fetch('/api/messages.add.reply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        uid,
        messageId: item.id,
        reply,
      }),
    });
    if (resp.status < 300) {
      onSendComplete();
    }
  };

  return (
    <Box borderRadius="md" width="full" bg="white" boxShadow="md">
      <Box>
        <Flex pl="2" pt="2" alignItems="center">
          <Avatar size="xs" src={item.author ? item.author.photoURL : '/user.jpeg'} />
          <Text fontSize="xx-small" ml="1">
            {item.author ? item.author.displayName : 'anonymous'}
          </Text>
          <Text whiteSpace="pre-line" fontSize="xx-small" ml="1" color="gray.500">
            {convertDateToString(item.createAt)}
          </Text>
        </Flex>
      </Box>
      <Box p="2">
        <Box borderRadius="md" borderWidth="1px" p="2">
          <Text whiteSpace="pre-line" fontSize="sm">
            {item.message}
          </Text>
        </Box>
        {haveRely && (
          <Box pt="2">
            <Divider />
            <Flex mt="2">
              <Box pt="2">
                <Avatar size="xs" src={photoURL} mr="2" />
              </Box>
              <Box borderRadius="md" width="full" p="2" bg="gray.100">
                <Flex alignItems="center">
                  <Text fontSize="xs">{displayName}</Text>
                  <Text whiteSpace="pre-line" fontSize="xs" color="gray">
                    {convertDateToString(item.replyAt!)}
                  </Text>
                </Flex>
                <Text whiteSpace="pre-line" fontSize="xs">
                  {item.reply}
                </Text>
              </Box>
            </Flex>
          </Box>
        )}
        {!haveRely && isOwner && (
          <Box pt="2">
            <Divider />
            <Flex mt="2">
              <Avatar size="xs" src={photoURL} mr="2" />
              <Box borderRadius="md" width="full" bg="gray.100" mr="2">
                <Textarea
                  border="none"
                  boxShadow="none !important"
                  resize="none"
                  minH="unset"
                  overflow="hidden"
                  fontSize="xs"
                  placeholder="댓글을 입력하세요."
                  as={ResizeTextarea}
                  value={reply}
                  onChange={({ currentTarget }) => setReply(currentTarget.value)}
                />
              </Box>
              <Button
                colorScheme="pink"
                bgColor="#FF75B5"
                variant="solid"
                size="sm"
                disabled={!reply}
                onClick={postReply}
              >
                등록
              </Button>
            </Flex>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default MessageItem;
