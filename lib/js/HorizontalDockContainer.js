import { SplitterDockContainer } from "./SplitterDockContainer.js";
import { Utils } from "./Utils.js";
import { ContainerType } from "./ContainerType.js";
export class HorizontalDockContainer extends SplitterDockContainer {
    constructor(dockManager, childContainers) {
        super(Utils.getNextId('horizontal_splitter_'), dockManager, childContainers, false);
        this.containerType = ContainerType.horizontal;
    }
}
//# sourceMappingURL=HorizontalDockContainer.js.map