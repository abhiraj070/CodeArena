import * as Y from "yjs" //Yjs is a CRDT-based (Conflict-free Replicated Data Type) 
// library that lets multiple users edit shared data without conflicts, even with latency or offline edits.
//yjs represents every character in the editor as a usinqueID instead of their position

export function createYjsDoc(){ //this is a factory function which creates a new object everytime
    const ydoc= new Y.Doc()  //imagine this as the whole docs file. this is kept uniques for every user. so that changes can be synced
    const yText= ydoc.getText("editor") // ad this as the text inside it

    return { ydoc, yText };

}
 //visualisation
/*Suppose I have two clients connected to a editor and I have a server connected to both the clients. Now imagine this as I hand over a 
 notebook(Y.doc), a separate notebook to each client and 1 to a server and told them to connect their notebooks to the 
 Monaco editor(monacoBinding). Now when they edit something on their editor, Monaco model changes. Monaco model then updates this change 
 to the y.text of yjs. When y.text is updated, it automatically triggers a Y.doc update, which is used to tell the server that there is 
 some update in the y.text of client A. Then the update is sent to the server. On the server, the update is verified, That whether it a 
 valid update or not. Then the update is updated to their notebook(their y.doc ). this y.doc was created just to sync the newly 
 connected or rejoined users. then the updated is sent to the client A and there also the update is updated and hence the sync.*/

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
