import CustomServerError from './custom_server_error';

export default function checkSupportMethod(supportMethod: string[], method?: string) {
  if (supportMethod.indexOf(method!) === -1) {
    //에러 반환
    throw new CustomServerError({ statusCode: 400, message: '지원하지 않는 method' });
  }
}
