import * as Y from "yjs" //Yjs is a CRDT-based (Conflict-free Replicated Data Type) 
// library that lets multiple users edit shared data without conflicts, even with latency or offline edits.
//yjs represents every character in the editor as a usinqueID instead of their position

export function createYjsDoc(){ //this is a factory function which creates a new object everytime
    const ydoc= new Y.Doc()  //imagine this as the whole docs file. this is kept uniques for every user. so that changes can be synced
    const yText= ydoc.getText("editor") // ad this as the text inside it

    return { ydoc, yText };
}

