// src/pages/_app.tsx
import { withTRPC } from '@trpc/next';
import { SessionProvider } from 'next-auth/react';
import type { AppType } from 'next/dist/shared/lib/utils';
import { useQuery } from 'react-query';
import superjson from 'superjson';
import { z } from 'zod';
import { NodesLoader } from '../context/nodesContext';
import type { AppRouter } from '../server/router';
import '../styles/globals.css';

const MyApp: AppType = ({ Component, pageProps: { session, ...pageProps } }) => {
  return (
    <NodesLoader>
      <SessionProvider session={session}>
        <Component {...pageProps} />
      </SessionProvider>
    </NodesLoader>
  );
};

const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    return '';
  }
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`; // SSR should use vercel url

  return `http://localhost:${process.env.PORT ?? 3000}`; // dev SSR should use localhost
};

export default withTRPC<AppRouter>({
  config({ ctx }) {
    const url = `${getBaseUrl()}/api/trpc`;
    return {
      url,
      transformer: superjson
    };
  },
  ssr: false
})(MyApp);
