import { Kafka } from "kafkajs";
import { kafka_server } from "../../../admin";

const kafka = new Kafka({
  clientId: "my-app",
  brokers: [kafka_server],
});

export var epicfamilyhistoryStore = [];

export class EpicPatientTopicListening {
  async epicPatientTopicListening() {
    const consumer = kafka.consumer({
      groupId: `Epic_Familyhistory_consumer-group`,
    });
    await consumer.connect();
    await consumer.subscribe({
      topic: "Epic-Familyhistory",
      fromBeginning: true,
    });
    await consumer.run({
      eachMessage: async (data) => {
        const { message } = data;
        const operation = message.key.toString().split("#")[0];
        
        if (operation == "create" && message.value) {
          const obj = JSON.parse(message.value.toString("utf8"));
          // console.log("obj...",obj)
          obj.forEach(element => {
            // epicfamilyhistoryStore = [];
            epicfamilyhistoryStore[element.id] = element;
            // console.log("data sent to topic");
          });
          // console.log("epicfamilyhistoryStore.....",epicfamilyhistoryStore)
          
        } else if (operation == "delete" && message.value) {
          console.log("operation....",operation)
          const key = message.key.toString().split("#")[1];
          const obj = JSON.parse(message.value.toString("utf8"));
          console.log("key....",key)
          console.log("obj.....",obj)
          epicfamilyhistoryStore[key] = obj;
        }
      },
    });
    consumer.seek({ topic: "Epic-Familyhistory", partition: 0, offset: "0" });
  }
}
