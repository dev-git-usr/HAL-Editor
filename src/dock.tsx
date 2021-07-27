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
        //let signal = new PanelContainer(document.getElementById("signal_window"), dockManager);
        //let properties = new PanelContainer(document.getElementById("properties_window"), dockManager);
        //let toolbox = new PanelContainer(document.getElementById("toolbox_window"), dockManager);
        //let outline = new PanelContainer(document.getElementById("outline_window"), dockManager);
        let state = new PanelContainer(document.getElementById("state_window"), dockManager);
        //let output = new PanelContainer(document.getElementById("output_window"), dockManager);
        //let editor1 = new PanelContainer(document.getElementById("editor1_window"), dockManager, null, PanelType.document, true);
        //let editor2 = new PanelContainer(document.getElementById("editor2_window"), dockManager, null, PanelType.document, true);
        let editor3 = new PanelContainer(document.getElementById("editor3_window"), dockManager, null, PanelType.document, true);

		//editor2.hideCloseButton(true);

        // Dock the panels on the dock manager
        let documentNode = dockManager.context.model.documentManagerNode;
        //outlineNode = dockManager.dockLeft(documentNode, outline, 0.15);
        dockManager.dockLeft(documentNode, solution, 0.15);
        //dockManager.dockDown(outlineNode, properties, 0.6);
        //let outputNode = dockManager.dockDown(documentNode, output, 0.2);
        //dockManager.dockRight(outputNode, state, 0.40);
        //dockManager.dockRight(documentNode, toolbox, 0.20);
        //dockManager.dockFill(documentNode, editor1);
        //dockManager.dockFill(documentNode, editor2);
		dockManager.dockFill(documentNode, editor3);
        //dockManager.dockFill(documentNode, signal);
        
    }

    ///////////////////// Code Mirror Editor ////////////////////////////
    // Editor 1
    /*
    var editor1_window_div = document.getElementById("editor1_window");
    var editor1 = CodeMirror(editor1_window_div, {
        lineNumbers: true,
        matchBrackets: true,
        foldGutter: true,
        gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
        mode: "text/x-csrc",
        value: source_steering_h,
        onCursorActivity: function () {
            editor1.setLineClass(editorLine1, null, null);
            editorLine1 = editor1.setLineClass(editor1.getCursor().line, null, "activeline");
        }
    });
    editor1_window_div.editor = editor1;
*/
	/*
    var signal_window_div = document.getElementById("signal_window");
    cm_signals = CodeMirror(signal_window_div, {
        lineNumbers: true,
        matchBrackets: true,
        foldGutter: true,
        gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
        mode: "text/x-csrc",
        onCursorActivity: function () {
            signal.setLineClass(signalLine1, null, null);
            signalLine1 = signal.setLineClass(signal.getCursor().line, null, "activeline");
        }
    });
    signal_window_div.editor = cm_signals;
*/

    // Editor 2
    /*
    var editor2_window_div = document.getElementById("editor2_window");
    var cm_editor2 = CodeMirror(editor2_window_div, {
        lineNumbers: true,
        matchBrackets: true,
        foldGutter: true,
        gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
        mode: "text/x-csrc",
        value: source_steering_cpp,
        onCursorActivity: function () {
            editor2.setLineClass(editorLine2, null, null);
            editorLine2 = editor2.setLineClass(editor2.getCursor().line, null, "activeline");
        }
    });
    editor2_window_div.editor = cm_editor2;
*/
    ////////////////////////////////////////////////////////////////

    //InitDebugTreeVis(window.dockManager);

};

export function show_manual(msg) {
    var manualdiv = document.getElementById("manual");
    if(msg == "") msg = "Sorry but there is no Manual available";
    if(manualdiv == null) {
        //Manual Container does not exist, so create one and add to Dockmanager
        var windowdiv = document.createElement("div");
        windowdiv.id = "manualwindow";
        windowdiv.setAttribute("data-panel-caption", "Manual");
        manual_window = new PanelContainer(windowdiv, dockManager); // invisible Dialog has no size, so size it manually
        manual_window.width = 600;
        manual_window.height = 400;
        manualdiv = document.createElement("div");
        manualdiv.style.width = "100%";
        manualdiv.style.height = "100%";
        manualdiv.style.overflowX = "hidden";
        windowdiv.appendChild(manualdiv);
        manualdiv.innerHTML = msg;
        //dockManager.floatDialog(manual_window, 50, 50);
        dockManager.floatDialog(manual_window, 50, 50);
    } else {
        //Manual Container does already exist, so only change content
        manualdiv.innerHTML = msg;
    }
}