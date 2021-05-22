// Event listeners for detecting changes to css and HTML entered by user
document.getElementById("html-box").addEventListener("input", update);
document.getElementById("css-box").addEventListener("input", update);

// Event listeners for toolbar elements
document.getElementById("fetch-btn").addEventListener("click", recover);
document.getElementById("store-btn").addEventListener("click", store);
document.getElementById("clear-btn").addEventListener("click", clearPage);
document
  .getElementById("preserve-code")
  .addEventListener("input", alterSaveState);

// Event listeners for closing and opening browser window
window.addEventListener("beforeunload", savePageDataOnClose);
window.addEventListener("load", recoverPreviousPage);

// Allowable tags to check when auto closing
const doubletags = ["h1", "h2", "b", "u"]; // not complete
const singletags = ["br", "img", "hr", "link"]; // not complete

// experimenter object
class xperimenter {
  constructor(html, css, main) {
    // variables to hold object references to id's
    this.cssbox = document.getElementById(css);
    this.htmlbox = document.getElementById(html);
    this.mainbox = document.getElementById(main);

    // variables to hold initial values/content of id's
    this.html = this.htmlbox.value;
    this.css = this.cssbox.value;
    this.main = "";
    this.capturehtml = false; // variable to decide to capture characters into buffer
    this.htmlbuffer = ""; // captured characters for later processing
    this.htmltagstack = []; // list contains a list of currently entered tags

    // other state variables
    this.savestate = "1"; // 0 -> Don't save on exit, default -> 1 as per HTML input tag
  }

  // Page rendering method of the main box, using css and html entered by the user
  renderPage() {
    this.mainbox.innerHTML = "<style>" + this.css + "</style>" + this.html;
  }

  // Html box setter method
  setHtml(value) {
    this.htmlbox.value = value;
  }

  // Css box setter method
  setCss(value) {
    this.cssbox.value = value;
  }

  fetchDataFromLs() {
    if ("xpt-html" in localStorage) {
      // recover html from localstorage key
      let tempHtml = localStorage.getItem("xpt-html");
      this.htmlbox.value = tempHtml;
      this.html = tempHtml;
    } else {
      console.log("HTML data does not exist..nothing to fetch");
    }

    if ("xpt-css" in localStorage) {
      // recover css from localstorage key
      let tempCss = localStorage.getItem("xpt-css");
      this.cssbox.value = tempCss;
      this.css = tempCss;
    } else {
      console.log("CSS data does not exist..nothing to fetch");
    }

    // now re-render the page with recovered data
    this.renderPage();
  }

  storeDataToLs() {
    // store both blocks of data to local storage
    localStorage.setItem("xpt-html", this.htmlbox.value);
    localStorage.setItem("xpt-css", this.cssbox.value);
  }

  clearLsKeys() {
    // this does nothing if keys do not already exist
    // so no need to check for existence first
    localStorage.removeItem("xpt-html");
    localStorage.removeItem("xpt-css");
  }

  setSaveState(value) {
    // set the current value of savestate to value supplied
    this.savestate = value;
  }

  getSaveState() {
    // return the current vale of the savestate
    return this.savestate;
  }

  processHTMLinput() {
    // Process the input stream of HTML to intercept < and > characters in order to
    // detect opening tags and close them automatically

    let tempstr = this.htmlbox.value; // Get the current contents of the input box HTML
    this.html = tempstr; // Assign to a temporary string and pass it to the html variable
    let lastChar = tempstr.charAt(tempstr.length - 1); // get last character and buffer typed into the box

    // examine most recent character entered test to see if it is a < open tag, or > closing tag
    if (lastChar == "<") {
      this.htmlbuffer = ""; // clears previous tag in buffer to build a new one
      this.capturehtml = true; // start capturing HTML characters - buffer will end up containing the HTML tag
    } else if (lastChar == ">") {
      this.capturehtml = false; // stop capturing HTML once closing tag detected
      // could really do with stripping out of the tag vattributes e.g. h2 class = "one"  ---> h2
      let res = this.htmlbuffer.split(" ")[0]; // take only text up to 1st space detected
      this.htmltagstack.push(res); // result will be tag without attributes
    } else {
      if (this.capturehtml == true) {
        // if the capture html flag is true then add this character to the buffer
        // this will build the entire captured HTML tag, othersise we can igonore
        this.htmlbuffer += lastChar;
        // at this point it would be worth testing if 2nd character is a / i.e. </
        // as this would indicate a closing tag is being entered

        if (this.htmlbuffer == "/") {
          // only any point of doing this if "</" is detected
          // we now have to get the last item from the tag stack
          if (this.htmltagstack.length > 0) {
            // if tag stack length > 1 , there is an item to pop - get the closing tag
            let closingtag = this.htmltagstack.pop();
            this.htmlbuffer += closingtag; // we now have the closing tag
          } else {
            // no item to pop - just close tag
            let closingtag = "";
            this.htmlbuffer += closingtag; // we now have the closing tag
          }
          // update output HTML
          this.html =
            tempstr.slice(0, tempstr.length - 2) + "<" + this.htmlbuffer + ">";
          this.htmlbox.value = this.html; // update the text box too
          this.capture = false; // stop capturing
        }
      }
    }
  }

  // method to process input CSS stream from input box - extended later if required, to do CSS processing
  processCSSinput() {
    this.css = this.cssbox.value;
  }
}

// END OF CLASS DEFINITION

// initial setup - call when initially setting up the xperimenter object
let xp = new xperimenter("html-box", "css-box", "main-box");
xp.setHtml("");
xp.setCss("#main-box {\n   \n}");
xp.renderPage();

// event handler functions

function update() {
  // get updated user values
  xp.processHTMLinput(); // process the HTML input by user
  xp.processCSSinput(); // process the css input by user
  xp.renderPage(); // render the new html area
}

function recover() {
  xp.fetchDataFromLs();
}

function store() {
  xp.storeDataToLs();
}

// look at this - should we just clear boxes and leave previous or clear everything
// review this functionality
function clearPage() {
  xp.setHtml("");
  xp.setCss("#main-box {\n   \n}");
  xp.clearLsKeys();
  update();
}

function savePageDataOnClose() {
  // check savestate, if = 1 then save data to local storage
  // otherwise clear data keys to prevent storage over sessions
  let s = xp.getSaveState(); // use getter to fetch save state
  if (s === "1") {
    xp.storeDataToLs();
  } else {
    xp.clearLsKeys();
  }
}

function recoverPreviousPage() {
  // check if Local storage exisits first - to ADD
  xp.fetchDataFromLs();
}

function alterSaveState() {
  // toggle the savestate
  let s = xp.getSaveState(); // use getter to fetch save state
  if (s === "0") {
    xp.setSaveState("1");
  } else {
    xp.setSaveState("0");
  }
  console.log(`Save state is: ${xp.savestate}`);
}
