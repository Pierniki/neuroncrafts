import * as d3 from 'd3';
import { SimulationNodeDatum } from 'd3';
import _ from 'lodash';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';
import { SessionNextPage } from '../components/AppLayout';
import { Node, useNodes } from '../context/nodesContext';

const ProtectedNodePage: SessionNextPage<{}> = (props) => {
  if (props.status !== 'authenticated') return <h5>Unauthorized</h5>;
  return <NodePage />;
};

const NodePage: React.FC<{}> = ({}) => {
  const { query } = useRouter();

  const stageRef = React.useRef<HTMLDivElement | null>(null);
  const [stageSize, setStageSize] = React.useState<{ w: number; h: number }>();
  const { nodes, links } = useNodes();

  const pageNodes = React.useMemo(() => {
    return nodes
      .filter((node) => {
        if (node.id === query.nodeId) return true;
        if (links.find((link) => link.source === query.nodeId && link.target === node.id)) return true;
        return false;
      })
      .map((node) => ({
        ...node,
        hasChildren: Boolean(links.find((link) => link.source === node.id && node.id !== query.nodeId))
      }));
  }, [nodes, links, query.nodeId]);

  const pageLinks = React.useMemo(() => {
    return links
      .filter((link) => {
        if (link.source === query.nodeId) return true;
        return false;
      })
      .map((link) => {
        return {
          source: pageNodes.findIndex((node) => node.id === link.source),
          target: pageNodes.findIndex((node) => node.id === link.target)
        };
      });
  }, [pageNodes, links, query.nodeId]);

  const nodeParents = React.useMemo(() => {
    const getNodeParents = (nodeId: string, parents: Node[] = []): Node[] => {
      const parentLink = links.find((link) => link.target === nodeId);
      const parentNode = nodes.find((node) => node.id === parentLink?.source);
      if (parentNode) {
        parents.push(parentNode);
        return getNodeParents(parentNode.id, parents);
      }
      return parents;
    };
    return typeof query.nodeId === 'string' ? getNodeParents(query.nodeId).reverse() : [];
  }, [query.nodeId, links, nodes]);

  const currentNode = React.useMemo(() => {
    return pageNodes.find((node) => node.id === query.nodeId);
  }, [query.nodeId, pageNodes]);

  React.useEffect(() => {
    window.addEventListener('resize', (e) => {
      if (!stageRef.current) return;
      setStageSize({ w: stageRef.current.clientWidth, h: stageRef.current.clientHeight });
    });
  }, []);

  if (pageNodes.length === 0 || pageLinks.length === 0) return <p>404</p>;
  return (
    <div className="w-full flex flex-col flex-1">
      <div className="font-semibold px-8 py-4">
        {nodeParents.map((node) => {
          return (
            <>
              <NextLink href={'/' + node.id} key={'breadcrumb-' + node.id}>
                <button>{node.name}</button>
              </NextLink>
              <span className="px-1 ">{'>'}</span>
            </>
          );
        })}
        {currentNode && <span className=" font-normal">{currentNode.name}</span>}
      </div>
      <div
        ref={(ref) => {
          if (!ref) return;
          if (!stageRef.current) setStageSize({ w: ref.clientWidth, h: ref.clientHeight });
          stageRef.current = ref;
        }}
        className="flex flex-col flex-1 h-full overflow-hidden "
      >
        {stageSize && (
          <NodeStage pageLinks={pageLinks} pageNodes={pageNodes} width={stageSize.w} height={stageSize.h} />
        )}
      </div>
    </div>
  );
};

const NodeStage: React.FC<{
  pageLinks: {
    source: number;
    target: number;
  }[];
  pageNodes: {
    name: string;
    id: string;
    color: string;
    text: string;
    hasChildren: boolean;
  }[];
  width: number;
  height: number;
}> = ({ pageLinks, pageNodes, width, height }) => {
  const [animationNodes, setAnimationNodes] = React.useState<AnimationNode[]>([]);
  const prevValues = React.useRef({ pageLinks, pageNodes });

  const ticks = React.useRef(0);
  const r = 120;

  React.useLayoutEffect(() => {
    if (_.isEqual(pageNodes, prevValues.current.pageNodes) || _.isEqual(pageLinks, prevValues.current.pageLinks))
      prevValues.current = {
        pageLinks,
        pageNodes
      };

    setAnimationNodes([]);
    ticks.current = 0;
    const simulation = d3
      .forceSimulation<AnimationNode>()
      .force('charge', d3.forceManyBody().strength(-2000))
      .force('center', d3.forceCenter(width / 2, height / 2));

    simulation.on('tick', () => {
      ticks.current++;
      if (ticks.current % 10 === 0) {
        setAnimationNodes([...simulation.nodes()]);
      }
    });

    simulation.nodes([...pageNodes]);

    simulation.force(
      'link',
      d3
        .forceLink()
        .links(pageLinks)
        .distance(r * 2.5)
    );

    return () => {
      simulation.stop();
    };
  }, [pageLinks, pageNodes, width, height]);

  return (
    <>
      <div className="relative  w-full flex flex-1">
        {animationNodes.map((node) => {
          return (
            <Node
              {...node}
              key={'node-' + node.id}
              height={r * 2}
              width={r * 2}
              left={(node.x ?? 0) - r}
              top={(node.y ?? 0) - r}
            />
          );
        })}
      </div>
    </>
  );
};

const Node: React.FC<AnimationNode & { height: number; width: number; left: number; top: number }> = ({
  name,
  text,
  id,
  hasChildren,
  color,
  height,
  width,
  left,
  top
}) => {
  const Content = (
    <div
      style={{ height, width, left, top, backgroundColor: color, pointerEvents: 'all' }}
      className={`rounded-full  flex justify-center items-center absolute duration-500 overflow-hidden text-white font-bold text-3xl group ${
        hasChildren ? 'hover:scale-125 cursor-pointer' : 'cursor-default scale-90 opacity-90'
      }`}
    >
      <span className="group-hover:translate-y-64 duration-500 transition-transform absolute">{name}</span>
      <p className="absolute -translate-y-64 group-hover:translate-y-0 duration-500 text-center text-sm font-normal p-8">
        {text}
      </p>
    </div>
  );
  if (!hasChildren) return Content;
  return (
    <NextLink href={'/' + id} passHref={true}>
      {Content}
    </NextLink>
  );
};
type AnimationNode = Node & SimulationNodeDatum & { hasChildren: boolean };

export default ProtectedNodePage;
