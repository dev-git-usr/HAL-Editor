import { Point } from "./Point.js";
import { PanelContainer } from "./PanelContainer.js";
import { DraggableContainer } from "./DraggableContainer.js";
import { ResizableContainer } from "./ResizableContainer.js";
import { EventHandler } from "./EventHandler.js";
import { Utils } from "./Utils.js";
export class Dialog {
    constructor(panel, dockManager) {
        this.panel = panel;
        this.dockManager = dockManager;
        this.eventListener = dockManager;
        this._initialize();
        this.dockManager.context.model.dialogs.push(this);
        this.position = dockManager.defaultDialogPosition;
        this.dockManager.notifyOnCreateDialog(this);
        panel.isDialog = true;
    }
    saveState(x, y) {
        this.position = new Point(x, y);
        this.dockManager.notifyOnChangeDialogPosition(this, x, y);
    }
    static fromElement(id, dockManager) {
        return new Dialog(new PanelContainer(document.getElementById(id), dockManager), dockManager);
    }
    _initialize() {
        this.panel.floatingDialog = this;
        this.elementDialog = Object.assign(document.createElement('div'), { floatingDialog: this });
        this.elementDialog.tabIndex = 0;
        this.elementDialog.appendChild(this.panel.elementPanel);
        this.draggable = new DraggableContainer(this, this.panel, this.elementDialog, this.panel.elementTitle);
        this.resizable = new ResizableContainer(this, this.draggable, this.draggable.topLevelElement);
        this.dockManager.config.dialogRootElement.appendChild(this.elementDialog);
        this.elementDialog.classList.add('dialog-floating');
        this.focusHandler = new EventHandler(this.elementDialog, 'focus', this.onFocus.bind(this), true);
        this.mouseDownHandler = new EventHandler(this.elementDialog, 'mousedown', this.onMouseDown.bind(this), true);
        this.touchDownHandler = new EventHandler(this.elementDialog, 'touchstart', this.onMouseDown.bind(this));
        this.keyPressHandler = new EventHandler(this.elementDialog, 'keypress', this.dockManager.onKeyPressBound, true);
        this.resize(this.panel.elementPanel.clientWidth, this.panel.elementPanel.clientHeight);
        this.isHidden = false;
        this.bringToFront();
    }
    setPosition(x, y) {
        let rect = this.dockManager.config.dialogRootElement.getBoundingClientRect();
        this.position = new Point(x - rect.left, y - rect.top);
        this.elementDialog.style.left = (x - rect.left) + 'px';
        this.elementDialog.style.top = (y - rect.top) + 'px';
        this.dockManager.notifyOnChangeDialogPosition(this, x, y);
    }
    getPosition() {
        return new Point(this.position ? this.position.x : 0, this.position ? this.position.y : 0);
    }
    onFocus() {
        if (this.dockManager.activePanel != this.panel)
            this.dockManager.activePanel = this.panel;
    }
    onMouseDown() {
        this.bringToFront();
    }
    destroy() {
        if (this.focusHandler) {
            this.focusHandler.cancel();
            delete this.focusHandler;
        }
        if (this.mouseDownHandler) {
            this.mouseDownHandler.cancel();
            delete this.mouseDownHandler;
        }
        if (this.touchDownHandler) {
            this.touchDownHandler.cancel();
            delete this.touchDownHandler;
        }
        if (this.keyPressHandler) {
            this.keyPressHandler.cancel();
            delete this.keyPressHandler;
        }
        Utils.removeNode(this.elementDialog);
        this.draggable.removeDecorator();
        Utils.removeNode(this.panel.elementPanel);
        Utils.arrayRemove(this.dockManager.context.model.dialogs, this);
        delete this.panel.floatingDialog;
    }
    resize(width, height) {
        this.resizable.resize(width, height);
    }
    setTitle(title) {
        this.panel.setTitle(title);
    }
    setTitleIcon(iconName) {
        this.panel.setTitleIcon(iconName);
    }
    bringToFront() {
        this.elementDialog.style.zIndex = this.dockManager.zIndexDialogCounter++;
        this.dockManager.activePanel = this.panel;
    }
    hide() {
        this.elementDialog.style.zIndex = '0';
        this.elementDialog.style.display = 'none';
        if (!this.isHidden) {
            this.isHidden = true;
            this.dockManager.notifyOnHideDialog(this);
        }
    }
    close() {
        this.hide();
        this.remove();
        this.dockManager.notifyOnClosePanel(this.panel);
        this.destroy();
    }
    remove() {
        this.elementDialog.parentNode.removeChild(this.elementDialog);
    }
    show() {
        this.elementDialog.style.zIndex = this.dockManager.zIndexDialogCounter++;
        this.elementDialog.style.display = 'block';
        if (this.isHidden) {
            this.isHidden = false;
            this.dockManager.notifyOnShowDialog(this);
        }
    }
}
//# sourceMappingURL=Dialog.js.map