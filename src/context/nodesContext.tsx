import React from 'react';
import { useQuery } from 'react-query';
import { z, ZodError } from 'zod';
import create from 'zustand';

const nodeSchema = z.object({ name: z.string(), color: z.string().length(7).startsWith('#'), text: z.string() });
const nodesSchema = z.array(nodeSchema);
export type Node = z.infer<typeof nodeSchema>;

const linkSchema = z.object({ source: z.string(), target: z.string() });
const linksSchema = z.array(linkSchema);
export type Link = z.infer<typeof linkSchema>;

interface NodesContext {
  nodes: Node[];
  links: Link[];
}

export const NodesContext = React.createContext<NodesContext | null>(null);

interface Props {
  children: React.ReactNode;
}

export const NodesLoader: React.FC<Props> = ({ children }) => {
  const nodesQuery = useQuery<Node[], ZodError>(
    ['nodes'],
    () =>
      fetch('nodes.json')
        .then((res) => res.json())
        .then((res) => nodesSchema.parseAsync(res)),
    { retry: false }
  );

  const linksQuery = useQuery<Link[], ZodError>(
    ['links'],
    () =>
      fetch('stories.json')
        .then((res) => res.json())
        .then((res) => linksSchema.parseAsync(res)),
    { retry: false }
  );

  if (nodesQuery.isLoading || linksQuery.isLoading) return <div>Loading...</div>;
  if (nodesQuery.isError || linksQuery.isError)
    return (
      <main className="container mx-auto flex flex-col items-center justify-center min-h-screen p-4">
        {nodesQuery.error && (
          <>
            <h5>Errors in nodes:</h5>
            {nodesQuery.error.issues.map((error) => {
              return <p key={error.path.toString()}>{`[${error.path.toString()}] - ${error.message}`}</p>;
            })}
          </>
        )}
        {linksQuery.error && (
          <>
            <h5>Errors in nodes:</h5>
            {linksQuery.error.issues.map((error) => {
              return <p key={error.path.toString()}>{`[${error.path.toString()}] - ${error.message}`}</p>;
            })}
          </>
        )}
      </main>
    );
  return (
    <NodesContext.Provider value={{ nodes: nodesQuery.data ?? [], links: linksQuery.data ?? [] }}>
      {children}
    </NodesContext.Provider>
  );
};

export const useNodes = () => {
  const nodesStore = React.useContext(NodesContext);
  if (!nodesStore) throw new Error('useNodes must be used within a NodesContext');
  return nodesStore;
};
