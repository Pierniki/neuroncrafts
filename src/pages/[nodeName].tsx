import { useSession } from 'next-auth/react';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';
import { Node, useNodes } from '../context/nodesContext';

interface Props {}

const NodePage: React.FC<Props> = (props) => {
  const { status } = useSession();
  const { query } = useRouter();

  const stageRef = React.useRef<HTMLDivElement>(null);
  const { nodes, links } = useNodes();

  const pageNodes = React.useMemo(() => {
    return nodes.filter((node) => {
      if (node.name === query.nodeName) return true;
      if (links.find((link) => link.source === query.nodeName && link.target === node.name)) return true;
      return false;
    });
  }, [nodes, links, query.nodeName]);

  const pageLinks = React.useMemo(() => {
    return links
      .filter((link) => {
        if (link.source === query.nodeName) return true;
        return false;
      })
      .map((link) => {
        return {
          source: pageNodes.findIndex((node) => node.name === link.source),
          target: pageNodes.findIndex((node) => node.name === link.target)
        };
      });
  }, [pageNodes, links, query.nodeName]);

  const nodeParents = React.useMemo(() => {
    const getNodeParents = (nodeName: string, parents: Node[] = []): Node[] => {
      const parentLink = links.find((link) => link.target === nodeName);
      const parentNode = nodes.find((node) => node.name === parentLink?.source);
      if (parentNode) {
        parents.push(parentNode);
        return getNodeParents(parentNode.name, parents);
      }
      return parents;
    };
    return typeof query.nodeName === 'string' ? getNodeParents(query.nodeName).reverse() : [];
  }, [query.nodeName, links, nodes]);

  console.log(nodes, pageNodes, pageLinks);

  if (status === 'loading') return <div>Loading...</div>;
  if (status === 'unauthenticated') return <div>Unauthorized</div>;
  if (pageNodes.length === 0 || pageLinks.length === 0) return <p>404</p>;
  return (
    <div>
      <div className="font-semibold px-8 py-4">
        {nodeParents.map((node) => {
          return (
            <>
              <NextLink href={'/' + node.name} key={node.name}>
                <button>{node.name}</button>
              </NextLink>
              <span className="px-1 ">{'>'}</span>
            </>
          );
        })}
        <span className=" font-normal">{query.nodeName}</span>
      </div>
      <div ref={stageRef}></div>
    </div>
  );
};

export default NodePage;
