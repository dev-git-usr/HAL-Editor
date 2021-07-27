let Utils = /** @class */ (() => {
    class Utils {
        static getPixels(pixels) {
            if (pixels === null) {
                return 0;
            }
            return parseInt(pixels.replace('px', ''));
        }
        static disableGlobalTextSelection(element) {
            element.classList.add('disable-selection');
        }
        static enableGlobalTextSelection(element) {
            element.classList.remove('disable-selection');
        }
        static isPointInsideNode(px, py, node) {
            let element = node.container.containerElement;
            let rect = element.getBoundingClientRect();
            return (px >= rect.left &&
                px <= rect.left + rect.width &&
                py >= rect.top &&
                py <= rect.top + rect.height);
        }
        static getNextId(prefix) {
            return prefix + Utils._counter++;
        }
        static removeNode(node) {
            if (node.parentNode === null) {
                return false;
            }
            node.parentNode.removeChild(node);
            return true;
        }
        static orderByIndexes(array, indexes) {
            let sortedArray = [];
            for (let i = 0; i < indexes.length; i++) {
                sortedArray.push(array[indexes[i]]);
            }
            return sortedArray;
        }
        static arrayRemove(array, value) {
            let idx = array.indexOf(value);
            if (idx !== -1) {
                return array.splice(idx, 1);
            }
            return false;
        }
        static arrayContains(array, value) {
            let i = array.length;
            while (i--) {
                if (array[i] === value) {
                    return true;
                }
            }
            return false;
        }
        static arrayEqual(a, b) {
            if (a === b)
                return true;
            if (a == null || b == null)
                return false;
            if (a.length != b.length)
                return false;
            for (let i = 0; i < a.length; ++i) {
                if (a[i] !== b[i])
                    return false;
            }
            return true;
        }
    }
    Utils._counter = 0;
    return Utils;
})();
export { Utils };
//# sourceMappingURL=Utils.js.map