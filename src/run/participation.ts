import { z } from "zod";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { parse, stringify } from "yaml";
import { CORE_STATE } from "../lib/CORE_STATE.ts";

const ARGS = z.tuple([z.string(), z.enum(["join", "leave"])]);
const LOCATION = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "state",
  "core.yml"
);

const main = async () => {
  const [name, action] = ARGS.parse(Deno.args);

  const content = await Deno.readTextFile(LOCATION);
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

  await Deno.writeTextFile(LOCATION, stringify(data));
};

main().catch((e) => {
  console.error(e);
  Deno.exit(1);
});
