export class EventHandler {
    constructor(source, eventName, target, useCapture) {
        this.target = target;
        this.eventName = eventName;
        this.source = source;
        this.source.addEventListener(eventName, this.target, useCapture);
    }
    cancel() {
        this.source.removeEventListener(this.eventName, this.target);
    }
}
//# sourceMappingURL=EventHandler.js.map