import { createZZS } from "./lib/types";
import { main } from "./lib/main";
import { z } from "zod";

const ff = createZZS(z.unknown());

main(
  async (item, { core, state}) => {
    const validated = ff.safeParse(item);
    if (validated.success) {
      await validated.data.schedule({ state, core });
      console.log(`Rule ${item.id} ran successfully!`);
    }
  }
).catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
