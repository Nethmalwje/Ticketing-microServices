import {
  Subjects,
  Publisher,
  ExpirationCompleteEvent,
} from "@nethtickets/common";

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
}
