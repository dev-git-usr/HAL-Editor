import { EventHandler } from "./EventHandler.js";
import { Point } from "./Point.js";
import { Utils } from "./Utils.js";
export class DraggableContainer {
    constructor(dialog, delegate, topLevelElement, dragHandle) {
        this.dialog = dialog;
        this.delegate = delegate;
        this.containerElement = delegate.containerElement;
        this.dockManager = delegate.dockManager;
        this.topLevelElement = topLevelElement;
        this.containerType = delegate.containerType;
        this.mouseDownHandler = new EventHandler(dragHandle, 'mousedown', this.onMouseDown.bind(this));
        this.touchDownHandler = new EventHandler(dragHandle, 'touchstart', this.onMouseDown.bind(this));
        this.topLevelElement.style.marginLeft = topLevelElement.offsetLeft + 'px';
        this.topLevelElement.style.marginTop = topLevelElement.offsetTop + 'px';
        this.minimumAllowedChildNodes = delegate.minimumAllowedChildNodes;
        this.iframeEventHandlers = [];
    }
    destroy() {
        this.removeDecorator();
        this.delegate.destroy();
    }
    saveState(state) {
        this.delegate.saveState(state);
    }
    loadState(state) {
        this.delegate.loadState(state);
    }
    setActiveChild( /*child*/) {
    }
    get width() {
        return this.delegate.width;
    }
    get height() {
        return this.delegate.height;
    }
    get name() {
        return this.delegate.name;
    }
    set name(value) {
        if (value)
            this.delegate.name = value;
    }
    resize(width, height) {
        this.delegate.resize(width, height);
    }
    performLayout(children) {
        this.delegate.performLayout(children, false);
    }
    removeDecorator() {
        if (this.mouseDownHandler) {
            this.mouseDownHandler.cancel();
            delete this.mouseDownHandler;
        }
        if (this.touchDownHandler) {
            this.touchDownHandler.cancel();
            delete this.touchDownHandler;
        }
    }
    onMouseDown(event) {
        if (event.preventDefault)
            event.preventDefault();
        let touchOrMouseData = null;
        if (event.touches) {
            if (event.touches.length > 1)
                return;
            touchOrMouseData = event.touches[0];
        }
        else {
            touchOrMouseData = event;
        }
        this._startDragging(touchOrMouseData);
        this.previousMousePosition = { x: touchOrMouseData.clientX, y: touchOrMouseData.clientY };
        if (this.mouseMoveHandler) {
            this.mouseMoveHandler.cancel();
            delete this.mouseMoveHandler;
        }
        if (this.touchMoveHandler) {
            this.touchMoveHandler.cancel();
            delete this.touchMoveHandler;
        }
        if (this.mouseUpHandler) {
            this.mouseUpHandler.cancel();
            delete this.mouseUpHandler;
        }
        if (this.touchUpHandler) {
            this.touchUpHandler.cancel();
            delete this.touchUpHandler;
        }
        this.mouseMoveHandler = new EventHandler(window, 'mousemove', this.onMouseMove.bind(this));
        this.touchMoveHandler = new EventHandler(event.target, 'touchmove', this.onMouseMove.bind(this), { passive: false });
        this.mouseUpHandler = new EventHandler(window, 'mouseup', this.onMouseUp.bind(this));
        this.touchUpHandler = new EventHandler(event.target, 'touchend', this.onMouseUp.bind(this));
        if (this.dockManager.iframes) {
            for (let f of this.dockManager.iframes) {
                let mmi = this.onMouseMovedIframe.bind(this);
                this.iframeEventHandlers.push(new EventHandler(f.contentWindow, 'mousemove', (e) => mmi(e, f)));
                this.iframeEventHandlers.push(new EventHandler(f.contentWindow, 'mouseup', this.onMouseUp.bind(this)));
                this.iframeEventHandlers.push(new EventHandler(f.contentWindow, 'touchmove', (e) => mmi(e, f)));
                this.iframeEventHandlers.push(new EventHandler(f.contentWindow, 'touchend', this.onMouseUp.bind(this)));
            }
        }
    }
    onMouseUp(event) {
        this._stopDragging(event);
        this.mouseMoveHandler.cancel();
        delete this.mouseMoveHandler;
        this.touchMoveHandler.cancel();
        delete this.touchMoveHandler;
        this.mouseUpHandler.cancel();
        delete this.mouseUpHandler;
        this.touchUpHandler.cancel();
        delete this.touchUpHandler;
        for (let e of this.iframeEventHandlers) {
            e.cancel();
        }
        this.iframeEventHandlers = [];
    }
    _startDragging(event) {
        this.containerElement.classList.add("draggable-dragging-active");
        if (this.dialog.eventListener)
            this.dialog.eventListener._onDialogDragStarted(this.dialog, event);
        Utils.disableGlobalTextSelection(this.dockManager.config.dialogRootElement);
    }
    _stopDragging(event) {
        this.containerElement.classList.remove("draggable-dragging-active");
        if (this.dialog.eventListener)
            this.dialog.eventListener._onDialogDragEnded(this.dialog, event);
        Utils.enableGlobalTextSelection(this.dockManager.config.dialogRootElement);
    }
    onMouseMovedIframe(e, iframe) {
        let posIf = iframe.getBoundingClientRect();
        this.onMouseMove(e, { x: posIf.x, y: posIf.y });
    }
    onMouseMove(event, iframeOffset) {
        if (event.preventDefault)
            event.preventDefault();
        let br = document.body.getBoundingClientRect();
        if (event.touches != null) {
            if (event.touches.length > 1)
                return;
            for (let w in this.dockManager.dockWheel.wheelItems) {
                let item = this.dockManager.dockWheel.wheelItems[w];
                let offset = item.element.getBoundingClientRect();
                if (event.touches[0].clientX > (offset.left - br.left) &&
                    event.touches[0].clientX < (offset.left + item.element.clientWidth - br.left) &&
                    event.touches[0].clientY > (offset.top - br.top) &&
                    event.touches[0].clientY < (offset.top + item.element.clientHeight - br.top)) {
                    item.onMouseMoved();
                }
                else {
                    if (item.active)
                        item.onMouseOut();
                }
            }
        }
        let touchOrMouseData = null;
        if (event.changedTouches) {
            if (event.changedTouches.length > 1)
                return;
            touchOrMouseData = event.changedTouches[0];
        }
        else {
            touchOrMouseData = event;
        }
        let currentMousePosition = new Point(touchOrMouseData.clientX, touchOrMouseData.clientY);
        if (iframeOffset)
            currentMousePosition = new Point(touchOrMouseData.clientX + iframeOffset.x, touchOrMouseData.clientY + iframeOffset.y);
        let dx = this.dockManager.checkXBounds(this.topLevelElement, currentMousePosition, this.previousMousePosition, false, false);
        let dy = this.dockManager.checkYBounds(this.topLevelElement, currentMousePosition, this.previousMousePosition, false, false);
        this._performDrag(dx, dy);
        this.previousMousePosition = currentMousePosition;
    }
    _performDrag(dx, dy) {
        let left = dx + Utils.getPixels(this.topLevelElement.style.marginLeft);
        let top = dy + Utils.getPixels(this.topLevelElement.style.marginTop);
        this.topLevelElement.style.marginLeft = left + 'px';
        this.topLevelElement.style.marginTop = top + 'px';
    }
}
//# sourceMappingURL=DraggableContainer.js.map