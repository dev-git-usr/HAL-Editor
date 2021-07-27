export class DockNode {
    constructor(container) {
        /** The dock container represented by this node */
        this.container = container;
        this.children = [];
    }
    detachFromParent() {
        if (this.parent) {
            this.parent.removeChild(this);
            delete this.parent;
        }
    }
    removeChild(childNode) {
        let index = this.children.indexOf(childNode);
        if (index >= 0)
            this.children.splice(index, 1);
    }
    addChild(childNode) {
        childNode.detachFromParent();
        childNode.parent = this;
        this.children.push(childNode);
    }
    addChildBefore(referenceNode, childNode) {
        this._addChildWithDirection(referenceNode, childNode, true);
    }
    addChildAfter(referenceNode, childNode) {
        this._addChildWithDirection(referenceNode, childNode, false);
    }
    _addChildWithDirection(referenceNode, childNode, before) {
        // Detach this node from it's parent first
        childNode.detachFromParent();
        childNode.parent = this;
        let referenceIndex = this.children.indexOf(referenceNode);
        let preList = this.children.slice(0, referenceIndex);
        let postList = this.children.slice(referenceIndex + 1, this.children.length);
        this.children = preList.slice(0);
        if (before) {
            this.children.push(childNode);
            this.children.push(referenceNode);
        }
        else {
            this.children.push(referenceNode);
            this.children.push(childNode);
        }
        Array.prototype.push.apply(this.children, postList);
    }
    performLayout(relayoutEvenIfEqual) {
        let childContainers = this.children.map((childNode) => { return childNode.container; });
        this.container.performLayout(childContainers, relayoutEvenIfEqual);
    }
    debugDumpTree(indent) {
        if (indent === undefined)
            indent = 0;
        let message = this.container.name;
        for (let i = 0; i < indent; i++)
            message = '\t' + message;
        let parentType = this.parent === undefined ? 'null' : this.parent.container.containerType;
        console.log('>>' + message + ' [' + parentType + ']');
        this.children.forEach((childNode) => { childNode.debugDumpTree(indent + 1); });
    }
}
//# sourceMappingURL=DockNode.js.map