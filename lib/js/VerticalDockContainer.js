import { SplitterDockContainer } from "./SplitterDockContainer.js";
import { Utils } from "./Utils.js";
import { ContainerType } from "./ContainerType.js";
export class VerticalDockContainer extends SplitterDockContainer {
    constructor(dockManager, childContainers) {
        super(Utils.getNextId('vertical_splitter_'), dockManager, childContainers, true);
        this.containerType = ContainerType.vertical;
    }
}
//# sourceMappingURL=VerticalDockContainer.js.map