import { DockManager } from "../DockManager.js";
import { PanelContainer } from "../PanelContainer.js";
let DockSpawnTsWebcomponent = /** @class */ (() => {
    class DockSpawnTsWebcomponent extends HTMLElement {
        constructor() {
            super();
            this.slotId = 0;
            this.initialized = false;
            this.elementContainerMap = new Map();
            this.windowResizedBound = this.windowResized.bind(this);
            this.slotElementMap = new Map();
        }
        initDockspawn() {
            const shadowRoot = this.attachShadow({ mode: 'open' });
            const linkElement1 = document.createElement("link");
            linkElement1.rel = "stylesheet";
            linkElement1.href = DockSpawnTsWebcomponent.cssRootDirectory + "dock-manager.css";
            linkElement1.onload = this.cssLoaded.bind(this);
            const linkElement2 = document.createElement("link");
            linkElement2.rel = "stylesheet";
            linkElement2.href = DockSpawnTsWebcomponent.cssRootDirectory + "dock-manager-style.css";
            shadowRoot.appendChild(linkElement1);
            shadowRoot.appendChild(linkElement2);
            const dockSpawnDiv = document.createElement('div');
            dockSpawnDiv.id = "dockSpawnDiv";
            dockSpawnDiv.style.width = "100%";
            dockSpawnDiv.style.height = "100%";
            dockSpawnDiv.style.position = "relative";
            shadowRoot.appendChild(dockSpawnDiv);
            this.dockManager = new DockManager(dockSpawnDiv);
            this.dockManager.config.dialogRootElement = dockSpawnDiv;
            this.dockManager.initialize();
            this.dockManager.addLayoutListener({
                onClosePanel: (dockManager, dockNode) => {
                    let slot = dockNode.elementContent;
                    let element = this.slotElementMap.get(slot);
                    this.removeChild(element);
                    this.slotElementMap.delete(slot);
                }
            });
            this.dockManager.resize(this.clientWidth, this.clientHeight);
        }
        cssLoaded() {
            this.dockManager.resize(this.clientWidth, this.clientHeight);
            for (let element of this.children) {
                this.handleAddedChildNode(element);
            }
            this.observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    mutation.addedNodes.forEach((node) => {
                        this.handleAddedChildNode(node);
                    });
                    mutation.removedNodes.forEach((node) => {
                        this.handleRemovedChildNode(node);
                    });
                });
            });
            this.observer.observe(this, { childList: true });
        }
        handleAddedChildNode(element) {
            let slot = document.createElement('slot');
            let slotName = 'slot_' + this.slotId++;
            slot.name = slotName;
            let container = new PanelContainer(slot, this.dockManager, element.title);
            element.slot = slotName;
            this.slotElementMap.set(slot, element);
            this.elementContainerMap.set(element, container);
            let dockRatio = 0.5;
            let dockRatioAttribute = element.getAttribute('dock-spawn-dock-ratio');
            if (dockRatioAttribute)
                dockRatio = dockRatioAttribute;
            let dockType = element.getAttribute('dock-spawn-dock-type');
            let dockRelativeTo = this.dockManager.context.model.documentManagerNode;
            let dockToAttribute = element.getAttribute('dock-spawn-dock-to');
            if (dockToAttribute) {
                //@ts-ignore
                let dockToElement = this.getRootNode().getElementById(dockToAttribute);
                dockRelativeTo = this.dockManager.findNodeFromContainerElement(this.elementContainerMap.get(dockToElement).containerElement);
            }
            if (dockType == 'left')
                this.dockManager.dockLeft(dockRelativeTo, container, dockRatio);
            else if (dockType == 'right')
                this.dockManager.dockRight(dockRelativeTo, container, dockRatio);
            else if (dockType == 'up')
                this.dockManager.dockUp(dockRelativeTo, container, dockRatio);
            else if (dockType == 'down')
                this.dockManager.dockDown(dockRelativeTo, container, dockRatio);
            else
                this.dockManager.dockFill(dockRelativeTo, container);
            if (element.style.display == 'none')
                element.style.display = 'block';
        }
        handleRemovedChildNode(element) {
            let node = this.getDockNodeForElement(element);
            if (node)
                node.container.close();
            this.elementContainerMap.delete(element);
        }
        connectedCallback() {
            if (!this.initialized) {
                this.initDockspawn();
                this.initialized = true;
            }
            window.addEventListener('resize', this.windowResizedBound);
            window.addEventListener('orientationchange', this.windowResizedBound);
        }
        disconnectedCallback() {
            window.removeEventListener('resize', this.windowResizedBound);
            window.removeEventListener('orientationchange', this.windowResizedBound);
        }
        windowResized() {
            this.resize();
        }
        resize() {
            this.dockManager.resize(this.clientWidth, this.clientHeight);
        }
        getDockNodeForElement(elementOrContainer) {
            let element = elementOrContainer;
            if (element.containerElement)
                element = elementOrContainer.containerElement;
            return this.dockManager.findNodeFromContainerElement(element);
        }
        dockFill(element, panelType, dockNode, title) {
            let container = new PanelContainer(element, this.dockManager, title, panelType);
            this.dockManager.dockFill(dockNode != null ? dockNode : this.dockManager.context.model.documentManagerNode, container);
        }
        dockLeft(element, panelType, dockNode, ratio, title) {
            let container = new PanelContainer(element, this.dockManager, title, panelType);
            this.dockManager.dockLeft(dockNode != null ? dockNode : this.dockManager.context.model.documentManagerNode, container, ratio);
        }
        dockRight(element, panelType, dockNode, ratio, title) {
            let container = new PanelContainer(element, this.dockManager, title, panelType);
            this.dockManager.dockRight(dockNode != null ? dockNode : this.dockManager.context.model.documentManagerNode, container, ratio);
        }
        dockUp(element, panelType, dockNode, ratio, title) {
            let container = new PanelContainer(element, this.dockManager, title, panelType);
            this.dockManager.dockUp(dockNode != null ? dockNode : this.dockManager.context.model.documentManagerNode, container, ratio);
        }
        dockDown(element, panelType, dockNode, ratio, title) {
            let container = new PanelContainer(element, this.dockManager, title, panelType);
            this.dockManager.dockDown(dockNode != null ? dockNode : this.dockManager.context.model.documentManagerNode, container, ratio);
        }
    }
    DockSpawnTsWebcomponent.cssRootDirectory = "../../lib/css/";
    return DockSpawnTsWebcomponent;
})();
export { DockSpawnTsWebcomponent };
window.customElements.define('dock-spawn-ts', DockSpawnTsWebcomponent);
//# sourceMappingURL=DockSpawnTsWebcomponent.js.map