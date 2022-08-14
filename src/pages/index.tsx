import type { NextPage } from 'next';
import { signIn, useSession } from 'next-auth/react';
import Head from 'next/head';

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>Neuroncrafts</title>
        <meta name="description" content="Nauroncrafts Home" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container mx-auto flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-lg">Neuroncrafts</h1>
        <SessionInfo />
      </main>
    </>
  );
};

const SessionInfo = () => {
  const { data: session, status } = useSession();

  if (status === 'loading') return <p>Loading...</p>;
  if (status === 'unauthenticated')
    return (
      <button type="submit" onClick={() => signIn('github')}>
        Login with Github
      </button>
    );
  return <p>{session?.user?.name}</p>;
};

export default Home;
