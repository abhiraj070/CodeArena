import * as Y from "yjs" //Yjs is a CRDT-based (Conflict-free Replicated Data Type) 
// library that lets multiple users edit shared data without conflicts, even with latency or offline edits.
//yjs represents every character in the editor as a usinqueID instead of their position

export function createYjsDoc(){ //this is a factory function which creates a new object everytime
    const ydoc= new Y.Doc()  //imagine this as the whole docs file. this is kept uniques for every user. so that changes can be synced
    const yText= ydoc.getText("editor") // ad this as the text inside it

    return { ydoc, yText };

}

//yjs flow

//Case 1: YOU type
// Step 1: You type "A"
// Step 2: Monaco model updates
// Step 3: MonacoBinding detects change
// Step 4: Updates yText (inside ydocRef)
// Step 5: Yjs emits update
// Step 6: You send it via socket
// Case 2: OTHER USER types
// Step 1: Socket receives update
// Step 2: Y.applyUpdate(ydoc)
// Step 3: yText changes
// Step 4: MonacoBinding detects change
// Step 5: Updates your editor

//Case 2: OTHER USER types
// Step 1: Socket receives update
// Step 2: Y.applyUpdate(ydoc)
// Step 3: yText changes
// Step 4: MonacoBinding detects change
// Step 5: Updates your editor
