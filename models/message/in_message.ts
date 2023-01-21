export interface InMessage {
  id: string;
  /** 사용자가 남김 질문 */
  message: string;
  /** 댓글 */
  reply?: string;
  createAt: string;
  replyAt?: string;
  author?: {
    displayName: string;
    photoURL?: string;
  };
}
