import { ScheduleModuleFactory } from "./lib/types";
import { main } from "./lib/main";
import { z } from "zod";

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
  process.exitCode = 1;
});
