import { EpicPatientTopicListening } from "./epic/familyHistory";

const epicPatientTopicsService = new EpicPatientTopicListening();

export async function kafkaTopicsListening() {
  epicPatientTopicsService.epicPatientTopicListening();
}
