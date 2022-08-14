import type { NextPage } from 'next';
import { Session } from 'next-auth';
import { signIn, useSession, signOut } from 'next-auth/react';
import Head from 'next/head';
import Link from 'next/link';

const Home: NextPage = () => {
  const sessionQuery = useSession();

  return (
    <>
      <Head>
        <title>Neuroncrafts</title>
        <meta name="description" content="Nauroncrafts Home" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen flex flex-col">
        <nav className="h-12 shadow-sm flex justify-end items-center px-8">
          {sessionQuery.status === 'authenticated' && <button onClick={() => signOut()}>Logout</button>}
        </nav>
        <main className="container mx-auto flex flex-col items-center justify-center p-4 flex-1">
          <h1 className="text-lg">Neuroncrafts</h1>
          <SessionInfo status={sessionQuery.status} session={sessionQuery.data} />
        </main>
      </div>
    </>
  );
};

const SessionInfo: React.FC<{
  status: 'authenticated' | 'loading' | 'unauthenticated';
  session: Session | null;
}> = ({ status, session }) => {
  if (status === 'loading') return <p>Loading...</p>;
  if (status === 'unauthenticated')
    return (
      <button type="submit" onClick={() => signIn('github')}>
        Login with Github
      </button>
    );
  return (
    <>
      <p>{session?.user?.name}</p>
      <Link href={'/Home'}>
        <button>Enter</button>
      </Link>
    </>
  );
};

export default Home;
