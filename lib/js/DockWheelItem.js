import { EventHandler } from "./EventHandler.js";
export class DockWheelItem {
    constructor(wheel, id) {
        this.wheel = wheel;
        this.id = id;
        let wheelType = id.replace('-s', '');
        this.element = document.createElement('div');
        this.element.classList.add('dock-wheel-item');
        this.element.classList.add('disable-selection');
        this.element.classList.add('dock-wheel-' + wheelType);
        this.element.classList.add('dock-wheel-' + wheelType + '-icon');
        this.hoverIconClass = 'dock-wheel-' + wheelType + '-icon-hover';
        this.mouseOverHandler = new EventHandler(this.element, 'mouseover', this.onMouseMoved.bind(this));
        this.mouseOutHandler = new EventHandler(this.element, 'mouseout', this.onMouseOut.bind(this));
        this.active = false; // Becomes active when the mouse is hovered over it
    }
    onMouseMoved() {
        this.active = true;
        this.element.classList.add(this.hoverIconClass);
        this.wheel.onMouseOver(this);
    }
    onMouseOut() {
        this.active = false;
        this.element.classList.remove(this.hoverIconClass);
        this.wheel.onMouseOut();
    }
}
//# sourceMappingURL=DockWheelItem.js.map