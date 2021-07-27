/**
 * The serializer saves / loads the state of the dock layout hierarchy
 */
export class DockGraphSerializer {
    serialize(model) {
        let graphInfo = this._buildGraphInfo(model.rootNode);
        let dialogs = this._buildDialogsInfo(model.dialogs.sort((x, y) => x.elementDialog.style.zIndex - y.elementDialog.style.zIndex));
        return JSON.stringify({ graphInfo: graphInfo, dialogsInfo: dialogs });
    }
    _buildGraphInfo(node) {
        let nodeState = {};
        node.container.saveState(nodeState);
        let childrenInfo = [];
        node.children.forEach((childNode) => {
            childrenInfo.push(this._buildGraphInfo(childNode));
        });
        let nodeInfo = {
            containerType: node.container.containerType,
            state: nodeState,
            children: childrenInfo
        };
        return nodeInfo;
    }
    _buildDialogsInfo(dialogs) {
        let dialogsInfo = [];
        dialogs.forEach((dialog) => {
            let panelState = {};
            let panelContainer = dialog.panel;
            panelContainer.saveState(panelState);
            let panelInfo = {
                containerType: panelContainer.containerType,
                state: panelState,
                position: dialog.getPosition(),
                isHidden: dialog.isHidden
            };
            dialogsInfo.push(panelInfo);
        });
        return dialogsInfo;
    }
}
//# sourceMappingURL=DockGraphSerializer.js.map