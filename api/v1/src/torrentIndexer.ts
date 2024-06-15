import axios from "axios";
import { parse, Node, HTMLElement } from "node-html-parser";
import { getLogger } from "./middleware/logging";
import { sanitiseShowName } from "./sequelize";
import { BasicEpisode } from "./models";
import { serialiseEpisode } from "./util";

const MAGNET_DL_URL = "https://www.magnetdl.com/";
const SEEDERS_SUFFIX = "/se/desc/";
const LEECHERS_SUFFIX = "/le/desc/";

const logger = getLogger(__filename);

const RESULT_KEYS = {
  DL: "link",
  "Download Name": "name",
  Age: "age",
  Type: "type",
  Files: "files",
  Size: "size",
  SE: "seeders",
  LE: "leechers",
} as const;

const SIZE_UNIT_PREFIXES = {
  K: 1e3,
  M: 1e6,
  G: 1e9,
  T: 1e12,
  P: 1e15,
} as const;

type RawResultKey = keyof typeof RESULT_KEYS;
type ResultKey = (typeof RESULT_KEYS)[RawResultKey];
type ResultValue = string | number | null;
type RawSearchResult = Record<ResultKey, ResultValue>;

export interface SearchResult {
  link?: string;
  name: string;
  age: string;
  type: string;
  files: number;
  size: number;
  seeders: number;
  leechers: number;
}

export class TorrentIndexer {
  constructor() {}

  getSearchQuery(episode: BasicEpisode) {
    const sanitised = sanitiseShowName(episode.showName);
    const serialised = serialiseEpisode(episode);
    return `${sanitised}-${serialised}`.replace(/\s/g, "-").toLowerCase();
  }

  private getSizeValue(value: string) {
    const match = value.match(/([.0-9]+) ([A-Z]?)B/);
    if (!match) {
      return null;
    }
    const size = +match[1];
    if (isNaN(size)) {
      return null;
    }
    const unitPrefix = match[2];
    if (!unitPrefix) return size; // e.g. "347 B"
    const exponent = SIZE_UNIT_PREFIXES[unitPrefix as keyof typeof SIZE_UNIT_PREFIXES];
    if (!exponent) return null;
    return size * exponent;
  }

  private getAnchorHref(parentNode: Node) {
    if (parentNode.nodeType !== 1) {
      logger.warn(`Parent node type is ${parentNode.nodeType}, not 1`);
      return "?";
    }
    const parentElem = parentNode as HTMLElement;
    if (!parentElem.querySelector) {
      logger.warn("Parent element has no `querySelector` method")
      return "?";
    }
    const node = parentElem.querySelector("a");
    const elem = node as HTMLElement;
    if (!node || !elem || node.nodeType !== 1) {
      logger.warn(`Child anchor node type: ${node?.nodeType}`);
      return "?";
    }
    if (!elem.getAttribute) {
      logger.warn("Child anchor element has no `getAttribute` method");
      return "?";
    }
    const href = elem.getAttribute("href");
    return href || "?";
  }

  private async getSearchResults(query: string) {
    if (!query) {
      logger.error("Empty query string when searching for torrents.");
      return [];
    }

    const firstLetter = query[0];

    const url = `${MAGNET_DL_URL}${firstLetter}/${query}${SEEDERS_SUFFIX}`;
    let res;
    try {
      res = await axios({ url, method: "GET" });
    } catch (error) {
      logger.error(error);
      return [];
    }
    if (typeof res.data !== "string") {
      logger.error("Received non-string HTML content from MagnetDL");
      logger.debug(res.data);
      return [];
    }
    const parsed = parse(res.data);
    const headerCells = parsed.querySelector("table.download thead tr.header")?.childNodes ?? [];
    const headers: Record<number, ResultKey> = {};
    headerCells.forEach((cell, idx) => {
      const key = cell.textContent as RawResultKey;
      const value = RESULT_KEYS[key];
      if (!value) {
        logger.warn(`Unknown header value '${key}'.`);
        return;
      }
      headers[idx] = value;
    });
    const resultRows = parsed.querySelectorAll("table.download tbody tr") ?? [];
    const results: SearchResult[] = [];
    for (const row of resultRows) {
      const nodes = row.childNodes ?? [];
      if (nodes.length !== headerCells.length) continue;
      const result: RawSearchResult = {} as RawSearchResult;
      nodes.forEach((node, idx) => {
        const key = headers[idx];
        const rawValue = node.textContent;
        let value: ResultValue = rawValue || this.getAnchorHref(node);
        switch (key) {
          case "files":
          case "seeders":
          case "leechers":
            // Numeric values
            value = +value;
            break;
          case "size":
            // Format: e.g. "307.90 MB"
            const size = this.getSizeValue(value);
            if (size == null) {
              logger.warn(`Obtained null numeric size value: ${value}`);
            }
            value = size;
            break;
        }
        result[key] = value;
      });
      if (result.type !== "TV") {
        logger.debug("Discarding non-TV result");
        logger.debug(result);
        continue;
      }
      results.push(result as SearchResult);
    }
    return results;
  }

  async search(query: string) {
    const results = await this.getSearchResults(query);
    if (results.length === 0) return null;
    const topSevenResults = results.slice(0, 7);
    const resultsByFilesize = topSevenResults.sort((a, b) => b.size - a.size);
    const topResultByFilesize = resultsByFilesize[0];
    if (topResultByFilesize.seeders === 0) {
      const topResultBySeeders = topSevenResults[0];
      if (topResultBySeeders.seeders > 0)
        return topResultBySeeders;
      logger.warn("All torrent search results have 0 seeders");
      // Since all results have 0 seeders, return the one with the most leechers. Maybe they'll be peers
      const resultsByLeechers = results.sort((a, b) => a.leechers - b.leechers);
      return resultsByLeechers[0];
    }
    return topResultByFilesize;
  }
}

