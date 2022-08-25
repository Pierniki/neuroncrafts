import { Session } from 'next-auth';
import { signIn } from 'next-auth/react';
import Head from 'next/head';
import Link from 'next/link';
import { SessionNextPage } from '../components/AppLayout';

import Image from 'next/image';

const Home: SessionNextPage<{}> = (props) => {
  return (
    <>
      <Head>
        <title>Neuroncrafts</title>
        <meta name="description" content="Nauroncrafts Home" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="flex flex-col flex-1">
        <main
          className="container mx-auto flex flex-col items-center justify-start p-4 flex-1"
          style={{ paddingTop: '20vh' }}
        >
          <div className=" mb-12  text-center ">
            <h1 className="text-4xl  mb-2">
              Welcome to <span className="font-bold">Neuroncrafts</span>
            </h1>
            {props.session?.user?.name && <span className="text-2xl">{props.session?.user?.name}!</span>}
          </div>
          <SessionInfo {...props} />
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
      <button
        type="submit"
        onClick={() => signIn('github')}
        className="rounded-full flex flex-col items-center justify-center  bg-gray-200 w-56 h-56 hover:scale-125 duration-500"
      >
        Login with
        <span className="font-bold text-3xl">Github</span>
      </button>
    );
  return (
    <>
      <Link href={'/neutral'}>
        <button className="rounded-full text-3xl flex flex-col items-center justify-center font-bold  bg-gray-200 w-56 h-56 hover:scale-125 duration-500">
          Enter
        </button>
      </Link>
    </>
  );
};

export default Home;
