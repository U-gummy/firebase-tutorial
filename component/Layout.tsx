import { Box, BoxProps } from '@chakra-ui/react';
import Head from 'next/head';
import { ReactNode } from 'react';
import { Header } from './Header';

interface Props {
  title: string;
  children: ReactNode;
}

const Layout: React.FC<Props & BoxProps> = function ({ title = 'firebase-tutorial', children, ...boxProps }: Props) {
  return (
    <Box {...boxProps}>
      <Head>
        <title>{title}</title>
      </Head>
      <Header />
      {children}
    </Box>
  );
};

export default Layout;
