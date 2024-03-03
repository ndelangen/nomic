import { z } from "zod";

import { ScheduleModuleFactory } from "../lib/types.ts";
import { main } from "../lib/main.ts";

const ScheduleModule = ScheduleModuleFactory(z.unknown());

main(
  async (item, { core, state}) => {
    const validated = ScheduleModule.safeParse(item);
    if (validated.success) {
      await validated.data.schedule({ state, core });
      console.log(`Schedule ${item.id} ran successfully!`);
    }
  }
).catch((e) => {
  console.error(e);
  Deno.exit(1);
});
