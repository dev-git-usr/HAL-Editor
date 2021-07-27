export class ResizeHandle {
    constructor() {
        this.element = undefined;
        this.handleSize = 6; // TODO: Get this from DOM
        this.cornerSize = 12; // TODO: Get this from DOM
        this.east = false;
        this.west = false;
        this.north = false;
        this.south = false;
        this.corner = false;
    }
    adjustSize(clientWidth, clientHeight) {
        if (this.corner) {
            if (this.west)
                this.element.style.left = '0px';
            if (this.east)
                this.element.style.left = (clientWidth - this.cornerSize) + 'px';
            if (this.north)
                this.element.style.top = '0px';
            if (this.south)
                this.element.style.top = (clientHeight - this.cornerSize) + 'px';
        }
        else {
            if (this.west) {
                this.element.style.left = '0px';
                this.element.style.top = this.cornerSize + 'px';
            }
            if (this.east) {
                this.element.style.left = (clientWidth - this.handleSize) + 'px';
                this.element.style.top = this.cornerSize + 'px';
            }
            if (this.north) {
                this.element.style.left = this.cornerSize + 'px';
                this.element.style.top = '0px';
            }
            if (this.south) {
                this.element.style.left = this.cornerSize + 'px';
                this.element.style.top = (clientHeight - this.handleSize) + 'px';
            }
            if (this.west || this.east) {
                this.element.style.height = (clientHeight - this.cornerSize * 2) + 'px';
            }
            else {
                this.element.style.width = (clientWidth - this.cornerSize * 2) + 'px';
            }
        }
    }
}
//# sourceMappingURL=ResizeHandle.js.map