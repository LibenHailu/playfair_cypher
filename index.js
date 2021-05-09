cipher = {
  key: "", // Initialize a blank key.
  alpha: "", // Stores our alphabet, used for making the key table.
  allowed: "ABCDEFGHIKLMNOPQRSTUVWXYZ", // A master of our alphabet - this will not
  maxRow: 5, // Rows in the key table. Playfair specifies 5.
  maxCol: 5, // Columns in the key table. Playfair specifies 5.
  nullCh: "X", // Char used to break up duplicate letters and fill uneven pairs.
  randomTable: false, // Randomize the rest of the table? Playfair does not.
  subCh: {
    sub: "J", // Letter to replace
    rpl: "I", // Letter to take its place
  },
};

function shuffleStr(str) {
  var array = str.split("");
  var m = array.length,
    t,
    i;

  // While there remain elements to shuffle…
  while (m) {
    // Pick a remaining element…
    i = Math.floor(Math.random() * m--);
    // And swap it with the current element.
    t = array[m];
    array[m] = array[i];
    array[i] = t;
  }
  return array.join("");
}

// HTML Table for our key table.
function printKey() {
  console.log(cipher.key);
  var tableHtml = '<table class ="table mt-5 mb-5" >';
  for (var i = 0; i < 25; i = i + 5) {
    tableHtml += "<tr>";
    var row = cipher.key.substring(i, i + 5);
    var chars = row.split("");
    var myInputKey = document.getElementById("keyword").value.toUpperCase();
    for (var x = 0; x < 5; x++) {
      if (myInputKey.includes(chars[x])) {
        tableHtml += '<td class="table-active ">' + chars[x] + "</td>";
      } else {
        tableHtml += "<td>" + chars[x] + "</td>";
      }
    }
    tableHtml += "</tr>";
  }
  tableHtml += "</table>";
  var tableNode = new DOMParser().parseFromString(tableHtml, "text/html");

  document.getElementById("keyTable").appendChild(tableNode.firstChild);
}

// Fetches the position of a specific character in the table
function getCharPosition(c) {
  var index = cipher.key.indexOf(c);
  var row = Math.floor(index / 5);
  var col = index % 5;
  return {
    row: row,
    col: col,
  };
}

// Fetches a character based on the given position
// Position must be an object with both row and col attributes.
function getCharFromPosition(pos) {
  var index = pos.row * 5;
  index = index + pos.col;
  return cipher.key.charAt(index);
}

// Applies the Playfair rules to a given set of letters.
function encipherPair(str) {
  if (str.length != 2) return false;
  var pos1 = getCharPosition(str.charAt(0));
  var pos2 = getCharPosition(str.charAt(1));
  var char1 = "";

  // Same Column - Increment 1 row, wrap around to top
  if (pos1.col == pos2.col) {
    pos1.row++;
    pos2.row++;
    if (pos1.row > cipher.maxRow - 1) pos1.row = 0;
    if (pos2.row > cipher.maxRow - 1) pos2.row = 0;
    char1 = getCharFromPosition(pos1) + getCharFromPosition(pos2);
  } else if (pos1.row == pos2.row) {
    // Same Row - Increment 1 column, wrap around to left
    pos1.col++;
    pos2.col++;
    if (pos1.col > cipher.maxCol - 1) pos1.col = 0;
    if (pos2.col > cipher.maxCol - 1) pos2.col = 0;
    char1 = getCharFromPosition(pos1) + getCharFromPosition(pos2);
  } else {
    // Box rule, use the opposing corners
    var col1 = pos1.col;
    var col2 = pos2.col;
    pos1.col = col2;
    pos2.col = col1;
    char1 = getCharFromPosition(pos1) + getCharFromPosition(pos2);
  }
  return char1;
}

// Loops a digraph and passes each letter pair to encipherPair
// Returns the cipher in an array
function encipher(digraph) {
  if (!digraph) return false;
  var cipher = [];
  for (var i = 0; i < digraph.length; i++) {
    cipher.push(encipherPair(digraph[i]));
  }
  return cipher;
}

// Turns a string into a digraph
// Sanitizes the string, returns the digraph in an array
function makeDigraph(str) {
  if (!str) return false;
  var digraph = [];
  str = str.toUpperCase();
  str = str.replace(/\W+/g, "");
  str = str.replace(cipher.subCh.sub, cipher.subCh.rpl);
  var strArr = str.split("");

  for (var i = 0; i < str.length; i++) {
    if (cipher.allowed.indexOf(strArr[i]) == -1) continue;
    if (i + 1 >= str.length) {
      digraph.push(strArr[i] + cipher.nullCh);
    } else if (strArr[i] == strArr[i + 1]) {
      digraph.push(strArr[i] + cipher.nullCh);
    } else digraph.push(strArr[i] + strArr[++i]);
  }
  return digraph;
}

// Creates our key table based upon a given key string
// Sanitizes the key string, using a default if one is not provided.
function generateKeyTable(keystring) {
  if (!keystring) keystring = "PLAYFAIRCIPHER";

  // Sanitize
  keystring = keystring.toUpperCase();
  keystring = keystring.replace(/\W+/g, "");
  keystring = keystring.replace(cipher.subCh.sub, cipher.subCh.rpl);
  // Reset our key and alphabet
  cipher.key = "";
  cipher.alpha = cipher.allowed;

  // Create the start of the table with our key string
  var keyArr = keystring.split("");
  keyArr.forEach((c) => {
    if (cipher.alpha.indexOf(c) > -1 && cipher.key.indexOf(c) == -1) {
      cipher.key += c;
      cipher.alpha = cipher.alpha.replace(c, "");
    }
  });

  // Fill in the rest of the table
  // If we enabled randomizing the table, do it. Playfair does not.
  if (cipher.randomTable) cipher.key += shuffleStr(cipher.alpha);
  else cipher.key += cipher.alpha;
}

// Handle Events

// Generates the table
document
  .getElementById("generateKeytable")
  .addEventListener("click", function () {
    // this.hide();
    var tableList = document.getElementById("keyTable");
    if (tableList.childNodes[0]) {
      console.log(tableList.childNodes[0]);
      tableList.removeChild(tableList.childNodes[0]);
    }
    document.getElementById("regenerateKeytable").show;
    generateKeyTable(document.getElementById("keyword").value);
    // document.getElementById("key")?.value(cipher.key);
    printKey();
    document.getElementById("AfterGen").style.display = "block";
  });

// Encipher the contents of the textarea
document.getElementById("encipher").addEventListener("click", function () {
  var digraph = makeDigraph(document.getElementById("en").value);
  if (!digraph) alert("not valid input");
  console.log(document.getElementById("en"));
  document.getElementById("en").value = digraph.join(" ");
  var cipher = encipher(digraph);
  document.getElementById("de").value = cipher.join(" ");
});
