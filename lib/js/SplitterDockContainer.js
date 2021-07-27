import { SplitterPanel } from "./SplitterPanel.js";
export class SplitterDockContainer {
    constructor(name, dockManager, childContainers, stackedVertical) {
        // for prototype inheritance purposes only
        if (arguments.length === 0) {
            return;
        }
        this.name = name;
        this.dockManager = dockManager;
        this.stackedVertical = stackedVertical;
        this.splitterPanel = new SplitterPanel(childContainers, this.stackedVertical);
        this.containerElement = this.splitterPanel.panelElement;
        this.minimumAllowedChildNodes = 2;
    }
    resize(width, height) {
        //    if (_cachedWidth === _cachedWidth && _cachedHeight === _height) {
        //      // No need to resize
        //      return;
        //    }
        this.splitterPanel.resize(width, height);
        this._cachedWidth = width;
        this._cachedHeight = height;
    }
    performLayout(childContainers, relayoutEvenIfEqual = false) {
        this.splitterPanel.performLayout(childContainers, relayoutEvenIfEqual);
    }
    setActiveChild( /*child*/) {
    }
    destroy() {
        this.splitterPanel.destroy();
    }
    /**
     * Sets the percentage of space the specified [container] takes in the split panel
     * The percentage is specified in [ratio] and is between 0..1
     */
    setContainerRatio(container, ratio) {
        this.splitterPanel.setContainerRatio(container, ratio);
        this.resize(this.width, this.height);
    }
    getRatios() {
        return this.splitterPanel.getRatios();
    }
    setRatios(ratios) {
        this.splitterPanel.setRatios(ratios);
        this.resize(this.width, this.height);
    }
    saveState(state) {
        state.width = this.width;
        state.height = this.height;
    }
    loadState(state) {
        this.state = { width: state.width, height: state.height };
        // this.resize(state.width, state.height);
    }
    get width() {
        if (this._cachedWidth === undefined)
            this._cachedWidth = this.splitterPanel.panelElement.clientWidth;
        return this._cachedWidth;
    }
    get height() {
        if (this._cachedHeight === undefined)
            this._cachedHeight = this.splitterPanel.panelElement.clientHeight;
        return this._cachedHeight;
    }
}
//# sourceMappingURL=SplitterDockContainer.js.map