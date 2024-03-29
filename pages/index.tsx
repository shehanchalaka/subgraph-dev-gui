import type { NextPage } from "next";
import Head from "next/head";
import { useEffect, useMemo, useState } from "react";
import { request, gql } from "graphql-request";
import SettingsModal from "../components/SettingsModal";

const SUBGRAPH_NAME_KEY = "SUBGRAPH_NAME";

const QUERY = gql`
  query GetIndex($subgraphName: String) {
    indexingStatusForCurrentVersion(subgraphName: $subgraphName) {
      synced
      health
      fatalError {
        message
        block {
          number
          hash
        }
        handler
      }
      chains {
        chainHeadBlock {
          number
        }
        latestBlock {
          number
        }
        earliestBlock {
          number
        }
      }
    }
  }
`;

const Home: NextPage = () => {
  const [subgraphName, setSubgraphName] = useState("");

  const [errorMessage, setErrorMessage] = useState("");
  const [synced, setSynced] = useState(false);
  const [status, setStatus] = useState("");
  const [syncedPercentage, setSyncedPercentage] = useState(0);
  const [currentBlock, setCurrentBlock] = useState("");

  const [title, setTitle] = useState("Subgraph gui");

  const [open, setOpen] = useState(false);

  useEffect(() => {
    const _name = localStorage.getItem(SUBGRAPH_NAME_KEY);
    setSubgraphName(_name ?? "");
  }, []);

  useEffect(() => {
    const intervalId = setInterval(() => {
      request("http://localhost:8030/graphql", QUERY, { subgraphName })
        .then((data) => {
          const result = data.indexingStatusForCurrentVersion;
          if (!result) {
            setErrorMessage(
              "Unable to connect. Make sure the subgraph name is correct"
            );
            clearInterval(intervalId);
            return;
          }

          const chain = result.chains?.[0];
          const chainHeadBlock = chain?.chainHeadBlock?.number ?? 0;
          const latestBlock = chain?.latestBlock?.number ?? 0;
          const earliestBlock = chain?.earliestBlock?.number ?? 0;
          const fatalError = result.fatalError;
          const _syncedPercentage =
            ((latestBlock - earliestBlock) * 100) /
            (chainHeadBlock - earliestBlock);

          setCurrentBlock(latestBlock);
          setSynced(result.synced);
          setStatus(result.health);
          setSyncedPercentage(_syncedPercentage);
          setTitle(`Synching ${_syncedPercentage.toFixed(1)}%`);
          setErrorMessage(fatalError ? fatalError.message : "");
        })
        .catch((error) => {
          setErrorMessage(error);
          clearInterval(intervalId);
        });
    }, 2000);

    return () => clearInterval(intervalId);
  }, [subgraphName]);

  const statusIcon = useMemo(
    () => (status === "healthy" ? "💚" : "💔"),
    [status]
  );
  const syncedIcon = useMemo(() => (synced ? "✅" : "⏳"), [synced]);

  const openDialog = () => {
    setOpen(true);
  };

  const onSettingsSave = ({ name }: { name: string }) => {
    setSubgraphName(name);
    localStorage.setItem(SUBGRAPH_NAME_KEY, name);

    setOpen(false);
  };

  return (
    <div className="flex flex-col h-screen bg-[#09141C] text-white">
      <Head>
        <title>{title}</title>
        <meta name="description" content="Subgraph dev GUI" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="flex flex-row justify-between px-4 pt-3 pb-1">
        <div>Subgraph dev gui</div>

        <div className="flex flex-row items-center space-x-3 text-sm">
          <div>{subgraphName}</div>
          <div>{syncedPercentage.toFixed(1)}%</div>
          <div>{currentBlock}</div>
          <div className="text-xs ml-1">{statusIcon}</div>
          <div className="text-xs ml-1">{syncedIcon}</div>
          <button
            className="hover:bg-gray-700 p-0.5 rounded-md"
            onClick={openDialog}
          >
            ⚙️
          </button>
        </div>
      </div>

      {!!errorMessage && (
        <div className="p-4">
          <div className="bg-red-600 p-2 rounded-md text-sm font-light">
            {errorMessage}
          </div>
        </div>
      )}

      <div className="flex flex-grow">
        <iframe
          src="/api/graphql"
          title="GraphQL Playground"
          height="100%"
          width="100%"
        ></iframe>
      </div>

      <SettingsModal
        open={open}
        onClose={() => setOpen(false)}
        onSave={onSettingsSave}
        defaultName={subgraphName}
      />
    </div>
  );
};

export default Home;
