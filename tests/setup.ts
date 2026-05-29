/**
 * Vitest global setup — every test file runs against the Node fs-backed
 * data source. Worker tests would substitute an embedded source.
 */

import { setDataSource } from "../src/lib/data-source.ts";
import { nodeDataSource } from "../src/lib/node-data-source.ts";

setDataSource(nodeDataSource);
