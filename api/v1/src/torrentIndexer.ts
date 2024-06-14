const TorrentIndexer = require("torrent-indexer");
import { getLogger } from "./middleware/logging";

const logger = getLogger(__filename);

const CONSOLE_LOG = console.log;
const CONSOLE_ERROR = console.error;

let numLogDisablers = 0;

function disableLogging() {
  numLogDisablers++;
  console.log = () => {};
  console.error = () => {};
}

function enableLogging() {
  numLogDisablers--;
  if (numLogDisablers === 0) {
    console.log = CONSOLE_LOG;
    console.error = CONSOLE_ERROR;
  }
}

// All sources:
//   | "yts"
//   | "leetx"
//   | "kickass"
//   | "eztv"
//   | "rarbg"
//   | "sky"
//   | "zooqle"
//   | "tpb"
//   | "limetorrents"
//   | "torrentproject";

interface TorrentConfig {
  name?: string;
  url?: string;
}

// Working sources:
// TPB;
// LIMETORRENTS > limetorrents.lol
const SOURCE_AMENDMENTS: { [key: string]: TorrentConfig } = {
  rarbg: {},
  sky: {},
  kickass: {},
  eztv: {},
  leetx: {},
  torrentproject: {},
  limetorrents: { name: "LimeTorrents", url: "https://limetorrents.lol" },
  zooqle: {},
};

interface TorrentResult {
  fileName: string;
  seeders: number;
  leechers: number;
  uploaded: string;
  uploader?: string;
  size: string;
  length: number;
  link?: string;
  resolution?: string;
  source?: string;
  codec?: string;
  group?: string;
  season: number;
  episode: number;
  score: number;
  title: string;
  sourceName: string;
}

const torrentIndexer = new TorrentIndexer({ sources: SOURCE_AMENDMENTS });

export async function searchTorrent(search: string) {
  if (!search) {
    throw new Error('Search query must be a non-empty string.');
  }

  // torrent-indexer produces a lot of unnecessary output
  disableLogging();
  const data: TorrentResult[] = await torrentIndexer.search(
    search.trim(),
    "tv"
  );
  enableLogging();

  if (!data || !Array.isArray(data)) {
    logger.error(`Search for '${search}' gave invalid data: ${data}.`);
    return null;
  }

  if (data.length === 0) {
    logger.error(`Search for '${search}' gave no results.`);
    return null;
  }
  
  const resultsWithMagnets = data.filter((torrent) => torrent.link?.startsWith("magnet:"));
  const resultsBySeeders = resultsWithMagnets.sort((a, b) => b.seeders - a.seeders);
  if (resultsBySeeders[0].seeders === 0) {
    return resultsWithMagnets.sort((a, b) => b.leechers - a.leechers)[0].link as string;
  }
  const topFiveResultsBySeeders = resultsBySeeders.slice(0, 5);
  const resultsByFilesize = topFiveResultsBySeeders.sort((a, b) => +a.size - +b.size);
  return resultsByFilesize[0].link as string;
}

