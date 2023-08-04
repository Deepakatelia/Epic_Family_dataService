import { NatsConnection, StringCodec, Subscription, connect } from "nats";
import { epicfamilyhistoryStore } from "../../kafka/epic/familyHistory";
import { nat_server } from "../../../admin";

export class EpicPatientNats {
  async patientNatsSubscriber(nc: NatsConnection) {
    const sc = StringCodec();
    const sub = nc.subscribe("Epic-Familyhistory");
    (async (sub: Subscription) => {
      for await (const m of sub) {
        const decoder = new TextDecoder("utf-8");
        const payload = JSON.parse(decoder.decode(m.data));
        if (payload.type == "get") {
          // console.log("first", payload, epicfamilyhistoryStore);
          let response = epicfamilyhistoryStore[payload.id];
          console.log("response....",response)
          if (response?.isExist == true && response) {
            console.log(response?.isExist)
            const nc = await connect({ servers: nat_server });
            const sc = StringCodec();
            m.respond(sc.encode(JSON.stringify(response)));
            
            if (m.respond(sc.encode(JSON.stringify(response)))) {
              await nc.close();
              console.info(`[Familyhistory] handled #${sub.getProcessed()}`);
            } else {
              console.log(
                `[Familyhistory] #${sub.getProcessed()} ignored - no reply subject`
              );
            }
          } else {
            console.log("not found");
            if (m.respond(sc.encode("404"))) {
              console.info(`[Familyhistory] handled #${sub.getProcessed()}`);
            } else {
              console.log(
                `[Familyhistory] #${sub.getProcessed()} ignored - no reply subject`
              );
            }
          }
        } else if (payload.type == "getAll") {
          const allFamilyhistory: any = epicfamilyhistoryStore;
          let finalRes = Object.values(allFamilyhistory);
          // console.log("finalRes.....",finalRes)
          let filteredRes = finalRes.filter((element: any) => {
            return element?.isExist === true;
          });
          if (m.respond(sc.encode(JSON.stringify(filteredRes)))) {
            console.info(`[epic Familyhistory] handled #${sub.getProcessed()}`);
          } else {
            console.log(
              `[epic Familyhistory] #${sub.getProcessed()} ignored - no reply subject`
            );
          }
        }
      }
      console.log(`subscription ${sub.getSubject()} drained.`);
    })(sub);
  }
}
