//Dock Manager
import { DockManager } from "../lib/js/DockManager.js";
import { PanelContainer } from "../lib/js/PanelContainer.js";
import { PanelType } from "../lib/js/enums/PanelType.js";

//////////////////////////////////////////////
//
//                  Docking
//
//////////////////////////////////////////////

let dockManager,
    storeKey = 'lastState';
let outlineNode;
let solution;
let manual_window;

function refresh() {
    localStorage.setItem(storeKey, '');
    location.reload();
}

//@ts-ignore
window.refresh = refresh;

window.onload = () => {
    // Convert a div to the dock manager. Panels can then be docked on to it

    let divDockContainer = document.getElementById('dock_div');
    let divDockManager = document.getElementById('my_dock_manager');
    dockManager = new DockManager(divDockManager);
    //@ts-ignore
    window.dockManager = dockManager;
    dockManager.initialize();

    let lastState = localStorage.getItem(storeKey);
    if (lastState && lastState.length > 0) {
        //dockManager.loadState(lastState);
    }

    // Output Window
    //editorOutput = CodeMirror(document.getElementById("output_window"), {
    //    value: ""
    //});


    // Let the dock manager element fill in the entire screen
    window.onresize = () => {
        dockManager.resize(
            divDockContainer.clientWidth,
            divDockContainer.clientHeight
        );
    };
    window.onresize(null);



    dockManager.addLayoutListener({
        onDock: (dockManager, dockNode) => {
            //logOutput('onDock(dockNode:' + dockNode?.title + ')');
            localStorage.setItem(storeKey, dockManager.saveState());
            //updateState();
        },
        onUndock: (dockManager, dockNode) => {
            //logOutput('onUndock(dockNode:' + dockNode?.title + ')');
            localStorage.setItem(storeKey, dockManager.saveState());
            //updateState();
        },
        onCreateDialog: (dockManager, dialog) => {
            //logOutput('onCreateDialog(dialog:' + dialog.panel.title + ')');
            localStorage.setItem(storeKey, dockManager.saveState());
            //updateState();
        },
        onChangeDialogPosition: (dockManager, dialog, x, y) => {
            //logOutput('onChangeDialogPosition(dialog:' + dialog.panel.title + ', x:' + x + ', y:' + y + ')');
            localStorage.setItem(storeKey, dockManager.saveState());
            //updateState();
        },
        onResumeLayout: (dockManager, panel) => {
            //logOutput('onResumeLayout(panel:' + panel?.title + ')');
            localStorage.setItem(storeKey, dockManager.saveState());
            //updateState();
        },
        onClosePanel: (dockManager, panel) => {
            //logOutput('onClosePanel(panel:' + panel?.title + ')');
            localStorage.setItem(storeKey, dockManager.saveState());
            //updateState();
        },
        onHideDialog: (dockManager, dialog) => {
            //logOutput('onHideDialog(dialog:' + dialog.panel.title + ')');
            localStorage.setItem(storeKey, dockManager.saveState());
            //updateState();
        },
        onShowDialog: (dockManager, dialog) => {
            //logOutput('onShowDialog(dialog:' + dialog.panel.title + ')');
            localStorage.setItem(storeKey, dockManager.saveState());
            //updateState();
        },
        onTabsReorder: (dockManager, dialog) => {
            //logOutput('onTabsReorder(dialog:' + dialog.panel.title + ')');
            localStorage.setItem(storeKey, dockManager.saveState());
            //updateState();
        },
        onActivePanelChange: (dockManger, panel, previousPanel) => {
            //logOutput('onActivePanelChange(previousPanel:' + previousPanel?.title + ', panel:' + panel?.title + ')');
            if (panel && panel.panelType == PanelType.document && panel.elementContent.editor) {
                // CodeMirror needs refresh wehn loaded into invisible div
                panel.elementContent.editor.refresh()
            }
            //updateState();
        }
    });

    //if (!lastState) {
    if(true) {
        // Convert existing elements on the page into "Panels".
        // They can then be docked on to the dock manager
        // Panels get a titlebar and a close button, and can also be
        // converted to a floating dialog box which can be dragged / resized
        solution = new PanelContainer(document.getElementById("solution_window"), dockManager);
        let editor3 = new PanelContainer(document.getElementById("editor3_window"), dockManager, null, PanelType.document, true);

		//editor2.hideCloseButton(true);

        // Dock the panels on the dock manager
        let documentNode = dockManager.context.model.documentManagerNode;
        dockManager.dockLeft(documentNode, solution, 0.15);
		dockManager.dockFill(documentNode, editor3);        
    }
};


//////////////////////////////////////////////////////////////
//
//    Functions to create generic and specific Windows
//
//////////////////////////////////////////////////////////////

//Creates and returns a new dock window - if a window with the id does already exist the existing window is returned
export function create_window(title: string, id: string, ) {
    var windowdiv = document.getElementById(id);
    if(windowdiv == null) {
        //Container does not exist, so create one and add to Dockmanager
        windowdiv = document.createElement("div");
        windowdiv.id = id;
        windowdiv.setAttribute("data-panel-caption", title);
        var panel = new PanelContainer(windowdiv, dockManager); // invisible Dialog has no size, so size it manually
        panel.width = 600;
        panel.height = 400;
        dockManager.floatDialog(panel, 50, 50);
        return windowdiv;
    } else {
        //Container does already exist, return found container
        return windowdiv;
    }

}

//shows Manual in window with id "manual"
export function show_manual(msg) {
    var manualdiv = document.getElementById("manual");
    if(msg == "") msg = "Sorry but there is no Manual available";
    var windowdiv = create_window("Manual", "manual");
    manualdiv = document.createElement("div");
    manualdiv.style.width = "100%";
    manualdiv.style.height = "100%";
    manualdiv.style.overflowX = "hidden";
    windowdiv.innerHTML = "";
    windowdiv.appendChild(manualdiv);
    manualdiv.innerHTML = msg;
}

//create Code Mirror Window
export function create_code_window(title: string, id: string, value: string) {
    var windowdiv = create_window(title, id)    //create window or get the existing one
    var cm_editor = CodeMirror(windowdiv, {
        lineNumbers: true,
        matchBrackets: true,
        foldGutter: true,
        gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
        mode: "text/x-csrc",
        value: value
    });
    windowdiv.editor = cm_editor;
}