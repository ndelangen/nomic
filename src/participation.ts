import { z } from "zod";
import { join } from "node:path";
import { parse, stringify } from "yaml";
import { CORE_STATE } from "./lib/types";

const ARGS = z.tuple([z.string(), z.enum(["join", "leave"])]);
const LOCATION = join(import.meta.dir, "..", "state", "core.yml");

const main = async () => {
  const [name, action] = ARGS.parse(process.argv.slice(2));

  const file = await Bun.file(LOCATION);
  const content = await file.text();
  const data = CORE_STATE.parse(parse(content));

  switch (action) {
    case "join": {
      if (data.players.list.includes(name)) {
        throw new Error("409 - conflict: Player already exists");
      }
      data.players.list = [...data.players.list, name];
      break;
    }
    case "leave": {
      if (!data.players.list.includes(name)) {
        throw new Error("404 - not found: Player does not exist");
      }
      data.players.list = data.players.list.filter((player) => player !== name);
      break;
    }
    default: {
      throw new Error("Invalid action");
    }
  }

  await Bun.write(LOCATION, stringify(data));
};

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
