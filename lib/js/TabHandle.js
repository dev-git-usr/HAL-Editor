import { PanelContainer } from "./PanelContainer.js";
import { UndockInitiator } from "./UndockInitiator.js";
import { EventHandler } from "./EventHandler.js";
import { Utils } from "./Utils.js";
import { PanelType } from "./enums/PanelType.js";
/**
 * A tab handle represents the tab button on the tab strip
 */
let TabHandle = /** @class */ (() => {
    class TabHandle {
        constructor(parent) {
            this.parent = parent;
            let undockHandler = this._performUndock.bind(this);
            this.elementBase = document.createElement('div');
            this.elementText = document.createElement('div');
            this.elementCloseButton = document.createElement('div');
            this.elementBase.classList.add('dockspan-tab-handle');
            this.elementBase.classList.add('disable-selection'); // Disable text selection
            this.elementText.classList.add('dockspan-tab-handle-text');
            this.elementCloseButton.classList.add('dockspan-tab-handle-close-button');
            this.elementBase.appendChild(this.elementText);
            if (this.parent.host.displayCloseButton)
                this.elementBase.appendChild(this.elementCloseButton);
            if (this.parent.container._hideCloseButton)
                this.elementCloseButton.style.display = 'none';
            this.parent.host.tabListElement.appendChild(this.elementBase);
            let panel = parent.container;
            let title = panel.getRawTitle();
            this.undockListener = {
                onDockEnabled: (e) => { this.undockEnabled(e.state); },
                onHideCloseButton: (e) => { this.hideCloseButton(e.state); }
            };
            this.eventListeners = [];
            panel.addListener(this.undockListener);
            this.elementText.innerHTML = title;
            this.elementText.title = this.elementText.innerText;
            this._bringToFront(this.elementBase);
            this.undockInitiator = new UndockInitiator(this.elementBase, undockHandler);
            this.undockInitiator.enabled = true;
            this.mouseDownHandler = new EventHandler(this.elementBase, 'mousedown', this.onMouseDown.bind(this));
            this.touchDownHandler = new EventHandler(this.elementBase, 'touchstart', this.onMouseDown.bind(this), { passive: false });
            this.closeButtonHandler = new EventHandler(this.elementCloseButton, 'click', this.onCloseButtonClicked.bind(this));
            this.closeButtonTouchHandler = new EventHandler(this.elementCloseButton, 'touchstart', this.onCloseButtonClicked.bind(this));
            this.auxClickHandler = new EventHandler(this.elementBase, 'auxclick', this.onCloseButtonClicked.bind(this));
            this.contextMenuHandler = new EventHandler(this.elementBase, 'contextmenu', this.oncontextMenuClicked.bind(this));
            this.zIndexCounter = parent.host.dockManager.zIndexTabHandle;
        }
        addListener(listener) {
            this.eventListeners.push(listener);
        }
        removeListener(listener) {
            this.eventListeners.splice(this.eventListeners.indexOf(listener), 1);
        }
        undockEnabled(state) {
            this.undockInitiator.enabled = state;
        }
        oncontextMenuClicked(e) {
            e.preventDefault();
            if (!this._ctxMenu && TabHandle.createContextMenuContentCallback) {
                this._ctxMenu = document.createElement('div');
                this._ctxMenu.className = 'dockspab-tab-handle-context-menu';
                TabHandle.createContextMenuContentCallback(this, this._ctxMenu, this.parent.container.dockManager.context.model.documentManagerNode.children);
                this._ctxMenu.style.left = e.pageX + "px";
                this._ctxMenu.style.top = e.pageY + "px";
                document.body.appendChild(this._ctxMenu);
                this._windowsContextMenuCloseBound = this.windowsContextMenuClose.bind(this);
                window.addEventListener('mouseup', this._windowsContextMenuCloseBound);
            }
            else {
                this.closeContextMenu();
            }
        }
        closeContextMenu() {
            if (this._ctxMenu) {
                document.body.removeChild(this._ctxMenu);
                delete this._ctxMenu;
                window.removeEventListener('mouseup', this._windowsContextMenuCloseBound);
            }
        }
        windowsContextMenuClose(e) {
            let cp = e.composedPath();
            for (let i in cp) {
                let el = cp[i];
                if (el == this._ctxMenu)
                    return;
            }
            this.closeContextMenu();
        }
        onMouseDown(e) {
            e.preventDefault();
            this.parent.onSelected();
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
            this.stargDragPosition = e.clientX;
            this.mouseMoveHandler = new EventHandler(window, 'mousemove', this.onMouseMove.bind(this));
            this.touchMoveHandler = new EventHandler(window, 'touchmove', this.onMouseMove.bind(this), { passive: false });
            this.mouseUpHandler = new EventHandler(window, 'mouseup', this.onMouseUp.bind(this));
            this.touchUpHandler = new EventHandler(window, 'touchend', this.onMouseUp.bind(this));
        }
        onMouseUp(e) {
            if (this.elementBase) {
                this.elementBase.classList.remove('dockspan-tab-handle-dragged');
            }
            this.dragged = false;
            if (this.mouseMoveHandler)
                this.mouseMoveHandler.cancel();
            if (this.touchMoveHandler)
                this.touchMoveHandler.cancel();
            if (this.mouseUpHandler)
                this.mouseUpHandler.cancel();
            if (this.touchUpHandler)
                this.touchUpHandler.cancel();
            delete this.mouseMoveHandler;
            delete this.touchMoveHandler;
            delete this.mouseUpHandler;
            delete this.touchUpHandler;
        }
        moveTabEvent(that, state) {
            that.eventListeners.forEach((listener) => {
                if (listener.onMoveTab) {
                    listener.onMoveTab({ self: that, state: state });
                }
            });
        }
        onMouseMove(e) {
            e.preventDefault();
            if (Math.abs(this.stargDragPosition - e.clientX) < 10)
                return;
            if (this.elementBase != null) { //Todo: because of this is null, we need to drag 2 times, needs fix
                this.elementBase.classList.add('dockspan-tab-handle-dragged');
                this.dragged = true;
                this.prev = this.current;
                this.current = e.clientX;
                this.direction = this.current - this.prev;
                let tabRect = this.elementBase.getBoundingClientRect();
                let event = this.direction < 0
                    ? { state: 'left', bound: tabRect.left, rect: tabRect }
                    : { state: 'right', bound: tabRect.right, rect: tabRect };
                if ((e.clientX < tabRect.left && this.direction < 0) || (e.clientX > tabRect.left + tabRect.width && this.direction > 0))
                    this.moveTabEvent(this, event.state);
            }
        }
        hideCloseButton(state) {
            this.elementCloseButton.style.display = state ? 'none' : 'block';
        }
        updateTitle() {
            if (this.parent.container instanceof PanelContainer) {
                let panel = this.parent.container;
                let title = panel.getRawTitle();
                this.elementText.innerHTML = title;
            }
        }
        destroy() {
            let panel = this.parent.container;
            panel.removeListener(this.undockListener);
            this.mouseDownHandler.cancel();
            this.touchDownHandler.cancel();
            this.closeButtonHandler.cancel();
            this.closeButtonTouchHandler.cancel();
            this.auxClickHandler.cancel();
            if (this.mouseUpHandler) {
                this.mouseUpHandler.cancel();
            }
            if (this.touchUpHandler) {
                this.touchUpHandler.cancel();
            }
            if (this.contextMenuHandler) {
                this.contextMenuHandler.cancel();
            }
            Utils.removeNode(this.elementBase);
            Utils.removeNode(this.elementCloseButton);
            delete this.elementBase;
            delete this.elementCloseButton;
        }
        _performUndock(e, dragOffset) {
            if (this.parent.container.containerType === 'panel') {
                this.undockInitiator.enabled = false;
                let panel = this.parent.container;
                return panel.performUndockToDialog(e, dragOffset);
            }
            else
                return null;
        }
        onCloseButtonClicked(e) {
            if (this.elementCloseButton.style.display !== 'none') {
                if (e.button !== 2) {
                    // If the page contains a panel element, undock it and destroy it
                    if (this.parent.container.containerType === 'panel') {
                        let panel = this.parent.container;
                        panel.close();
                    }
                }
            }
        }
        setSelected(isSelected) {
            if (isSelected)
                this.elementBase.classList.add('dockspan-tab-handle-selected');
            else {
                this.elementBase.classList.remove('dockspan-tab-handle-selected');
                this.elementBase.classList.remove('dockspan-tab-handle-active');
            }
        }
        setActive(isActive) {
            if (this.elementBase) {
                if (isActive)
                    this.elementBase.classList.add('dockspan-tab-handle-active');
                else
                    this.elementBase.classList.remove('dockspan-tab-handle-active');
            }
        }
        setZIndex(zIndex) {
            this.elementBase.style.zIndex = zIndex;
        }
        _bringToFront(element) {
            element.style.zIndex = this.zIndexCounter;
            this.zIndexCounter++;
        }
    }
    TabHandle.createContextMenuContentCallback = (tabHandle, contextMenuContainer, documentMangerNodes) => {
        let btnCloseAll = document.createElement('div');
        btnCloseAll.innerText = 'Close all documents';
        contextMenuContainer.append(btnCloseAll);
        let btnCloseAllButThis = document.createElement('div');
        btnCloseAllButThis.innerText = 'Close all documents but this';
        contextMenuContainer.append(btnCloseAllButThis);
        btnCloseAll.onclick = () => {
            let length = documentMangerNodes.length;
            for (let i = length - 1; i >= 0; i--) {
                let panel = documentMangerNodes[i].container;
                if (panel.panelType == PanelType.document)
                    panel.close();
            }
            tabHandle.closeContextMenu();
        };
        btnCloseAllButThis.onclick = () => {
            let length = documentMangerNodes.length;
            for (let i = length - 1; i >= 0; i--) {
                let panel = documentMangerNodes[i].container;
                if (tabHandle.parent.container != panel && panel.panelType == PanelType.document)
                    panel.close();
            }
            tabHandle.closeContextMenu();
        };
    };
    return TabHandle;
})();
export { TabHandle };
//# sourceMappingURL=TabHandle.js.map