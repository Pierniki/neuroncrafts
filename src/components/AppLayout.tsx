import { NextPage } from 'next';
import { Session } from 'next-auth';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import React from 'react';

interface Props {
  children: React.ReactNode;
}

export const AppLayout: React.FC<Props> = (props) => {
  const sessionQuery = useSession();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar status={sessionQuery.status} session={sessionQuery.data} />
      <main className="flex-1 flex flex-col justify-start items-center">
        {React.isValidElement(props.children)
          ? React.cloneElement(props.children, { status: sessionQuery.status, session: sessionQuery.data })
          : null}
      </main>
    </div>
  );
};

export interface SessionProps {
  status: 'authenticated' | 'loading' | 'unauthenticated';
  session: Session | null;
}

const Navbar: React.FC<SessionProps> = ({ status }) => {
  return (
    <nav className="h-12 shadow-sm flex justify-between items-center px-8">
      <Link href={'/'}>
        <button className="text-xl font-bold">Neuroncrafts</button>
      </Link>
      {status === 'authenticated' && <button onClick={() => signOut()}>Logout</button>}
    </nav>
  );
};

export const AuthWrapper: SessionNextPage<{ page: NextPage }> = (props) => {
  if (props.status !== 'authenticated') return null;
  return <>{React.isValidElement(props.page) ? React.cloneElement(props.page, props) : null}</>;
};

export type SessionNextPage<T> = NextPage<T & SessionProps>;
