 
let codeblock = document.getElementById("codeblock");
let codeeditor = document.getElementById("CodeEditor");
let errorblock = document.getElementById("error");
let prettyblock = document.getElementById("MakePretty");
let editorblock = document.getElementById("UseEditor");
let generateJSONblock = document.getElementById("GenerateJSON");
let objexplorer = document.getElementById("objexplorer");

const container = document.getElementById('jsoneditor')
const options = {}
const editor = new JSONEditor(container, options)

//codeblock.innerHTML = "{}"
let CodeTimestamp;
codeblock.addEventListener("input", updateSyntaxHighlight);

codeblock.addEventListener("keydown", function(e){
    //console.log(e);
    if (e.code === "Enter" && e.shiftKey === false) {
        e.preventDefault()
        document.execCommand("insertLineBreak");
        return false;
      }
});

function updateSyntaxHighlight() {
    let dt = new Date();
    CodeTimestamp = dt.getTime() + 1500;
    setTimeout(DoUpdateSyntaxHighlight, 1600);
}

function syntaxHighlight(json, errorindex) {
    if (typeof json != 'string') {
         json = JSON.stringify(json, undefined, 2);
    }
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    let notFound = true;
    let theReturn = json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match,  p1, p2, p3, p4, offset, string) {
        var cls = 'number';
        if (/^"/.test(match)) {
            if (/:$/.test(match)) {
                cls = 'key';
            } else {
                cls = 'string';
            }
        } else if (/true|false/.test(match)) {
            cls = 'boolean';
        } else if (/null/.test(match)) {
            cls = 'null';
        }
        let returnVal = '<span class="' + cls + '">' + match + '</span>';
        //console.log(match + " offset: " + offset)
        if (errorindex !== undefined && errorindex !== -1){
            let endIndex = match.length + offset;
            console.log("ErrorIndex: " + errorindex + " Start Index: " + offset + " endIndex: " + endIndex);
            if (errorindex > offset && errorindex <= endIndex){
                notFound = false;
                cls+= " warning"
                returnVal = '<span class="' + cls + '">' + match + '</span><svg class="svg-inline--fa fa-exclamation fa-w-6 warning" style="color: red; padding: 0px 6px; display: inline-block;" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="exclamation" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 512" data-fa-i2svg=""><path fill="currentColor" d="M176 432c0 44.112-35.888 80-80 80s-80-35.888-80-80 35.888-80 80-80 80 35.888 80 80zM25.26 25.199l13.6 272C39.499 309.972 50.041 320 62.83 320h66.34c12.789 0 23.331-10.028 23.97-22.801l13.6-272C167.425 11.49 156.496 0 142.77 0H49.23C35.504 0 24.575 11.49 25.26 25.199z"></path></svg>';
            } else if(errorindex < endIndex && notFound){
                notFound = false;
                returnVal = '<svg class="svg-inline--fa fa-exclamation fa-w-6 warning" style="color: #D500F9; font-size: 26px; padding: 2px 6px; display: inline-block;" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="exclamation" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 512" data-fa-i2svg=""><path fill="currentColor" d="M176 432c0 44.112-35.888 80-80 80s-80-35.888-80-80 35.888-80 80-80 80 35.888 80 80zM25.26 25.199l13.6 272C39.499 309.972 50.041 320 62.83 320h66.34c12.789 0 23.331-10.028 23.97-22.801l13.6-272C167.425 11.49 156.496 0 142.77 0H49.23C35.504 0 24.575 11.49 25.26 25.199z"></path></svg><span class="' + cls + '">' + match + '</span>';
            }
            //console.log(returnVal)
        }
        
        return returnVal;
    });
    return theReturn;
}

function DoUpdateSyntaxHighlight() {
    let dt = new Date();
    let now = dt.getTime();
    if (now >= CodeTimestamp){
        let pos = getCaretPosition(codeblock);
        let json = codeblock.innerHTML;
        json = json.replace(/(<([^>]+)>)/gi, "");
        let error = IsValidJSONString(json);
        let errpos;
        if (error ==="Valid"){
            errorblock.innerHTML = "<i class=\"far fa-check-circle\"></i> " + error;
            errorblock.className = "success";
            prettyblock.disabled = null;
            editorblock.disabled = null;
        } else {
            errorblock.innerHTML = "<i class=\"fas fa-exclamation-triangle\"></i> " + error;
            errorblock.className = "error";
            prettyblock.disabled = "true";
            editorblock.disabled = "true";
            errpos = String(error).match(/[0-9]{1,10}/);
            console.log("errpos: " + errpos);
        }
        codeblock.innerHTML = syntaxHighlight(json, errpos);
        SetCaretPosition(codeblock,pos[0])
    }
  }
// node_walk: walk the element tree, stop when func(node) returns false
function node_walk(node, func) {
    var result = func(node);
    for(node = node.firstChild; result !== false && node; node = node.nextSibling)
      result = node_walk(node, func);
    return result;
  };
  
  // getCaretPosition: return [start, end] as offsets to elem.textContent that
  //   correspond to the selected portion of text
  //   (if start == end, caret is at given position and no text is selected)
  function getCaretPosition(elem) {
    var sel = window.getSelection();
    var cum_length = [0, 0];
  
    if(sel.anchorNode == elem)
      cum_length = [sel.anchorOffset, sel.extentOffset];
    else {
      var nodes_to_find = [sel.anchorNode, sel.extentNode];
      if(!elem.contains(sel.anchorNode) || !elem.contains(sel.extentNode))
        return undefined;
      else {
        var found = [0,0];
        var i;
        node_walk(elem, function(node) {
          for(i = 0; i < 2; i++) {
            if(node == nodes_to_find[i]) {
              found[i] = true;
              if(found[i == 0 ? 1 : 0])
                return false; // all done
            }
          }
  
          if(node.textContent && !node.firstChild) {
            for(i = 0; i < 2; i++) {
              if(!found[i])
                cum_length[i] += node.textContent.length;
            }
          }
        });
        cum_length[0] += sel.anchorOffset;
        cum_length[1] += sel.extentOffset;
      }
    }
    if(cum_length[0] <= cum_length[1])
      return cum_length;
    return [cum_length[1], cum_length[0]];
  }

  function SetCaretPosition(el, pos){

    // Loop through all child nodes
    for(var node of el.childNodes){
        if(node.nodeType == 3){ // we have a text node
            if(node.length >= pos){
                // finally add our range
                var range = document.createRange(),
                    sel = window.getSelection();
                range.setStart(node,pos);
                range.collapse(true);
                sel.removeAllRanges();
                sel.addRange(range);
                return -1; // we are done
            }else{
                pos -= node.length;
            }
        }else{
            pos = SetCaretPosition(node,pos);
            if(pos == -1){
                return -1; // no need to finish the for loop
            }
        }
    }
    return pos; // needed because of recursion stuff
}

function setCaret(ele, line, col) {
    var rng = document.createRange();
    var sel = window.getSelection();
    rng.setStart(ele.childNodes[line], col);
    rng.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
    ele.focus();
  }

function IsValidJSONString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return e;
    }
    return "Valid";
}

function MakePretty(){
    let jsonText = codeblock.innerHTML;
    jsonText = jsonText.replace(/(<([^>]+)>)/gi, "");
    jsonText = jsonText.replace(/&nbsp;/gi, "");
    try {
        let jsonObj = JSON.parse(jsonText);
        jsonText = JSON.stringify(jsonObj, undefined, 2);
        codeblock.innerHTML = syntaxHighlight(jsonText);
        console.log("Made Pretty");
    } catch (e){
        console.log(e);
    }
}

function GenerateJSON(){
  codeeditor.style.display = "block";
  objexplorer.style.display = "none";
  generateJSONblock.disabled = "true";
  generateJSONblock.style.display = "none";
  editorblock.style.display = "inline-block";
  prettyblock.disabled = null;
  editorblock.disabled = null;
  let json = editor.get();
  let jsonText = JSON.stringify(json, undefined, 2);
  codeblock.innerHTML = syntaxHighlight(jsonText);
  document.getElementById('CodeEditor').scrollIntoView();
}

function UseEditor(){
  let jsonText = codeblock.innerHTML;
  jsonText = jsonText.replace(/(<([^>]+)>)/gi, "");
  jsonText = jsonText.replace(/&nbsp;/gi, "");
  try {
      let jsonObj = JSON.parse(jsonText);
      codeeditor.style.display = "none";
      objexplorer.style.display = "block";
      prettyblock.disabled = "true";
      editorblock.disabled = "true";
      generateJSONblock.style.display = "inline-block";
      editorblock.style.display = "none";
      generateJSONblock.disabled = null;
      editor.set(jsonObj);
      document.getElementById('jsoneditor').scrollIntoView();
  } catch (e){
      console.log(e);
  }

}