"use strict"; //prevent many Javascript issues it used to have

const data = loadJSON('./DO_NOT_TOUCH/data.json'); //Don't delete this line. All your data is here. It does take a few seconds for Replit to load the data because it's so large.

const books = 100000; // # of books in array
let performanceTime = document.getElementById("performance"); // to display to html

// displays loading message until webpage finishes loading everything, then hides it - from stack overflow
function hideLoader() { // O(1)
  window.onload = document.getElementById("loading").style.display = "none";
}

const tLoad = performance.now(); // performance time for initial sorting time (everytime page is loaded)

// replaces all elements in original arrays with array containing [original value, original index]
// **turns original parallel arrays to 2d arrays
// this saves the original index of every value so they only have to be sorted once, and can just be accessed by the original index of another sorted array
let tempCopy = []; // temp copy of original array so it remains unmodified
for (let i = 0; i < books; i++) { // O(n), n = 100000
  data.guid[i] = [data.guid[i], i];
  data.bookName[i] = [data.bookName[i], i];
  data.firstName[i] = [data.firstName[i], i];
  data.lastName[i] = [data.lastName[i], i];
  tempCopy[tempCopy.length] = [data.lastName[i][0].toLowerCase(), i]; // turns value to lowercase to sort (so it's not case sensitive)
  data.gender[i] = [data.gender[i], i];
}

mergeSort(tempCopy); // sorts last name array in lowercase 

// adds sorted values into array according to sorted indexes as [value, index]
// only needed for last names since some start with lowercase letters (affects sorting because it's case sensitive)
const sortedLN = [];
for (let i = 0; i < books; i++) { // O(n), n = 100000
  sortedLN[sortedLN.length] = [data.lastName[tempCopy[i][1]][0], tempCopy[i][1]];
}

// sorts each individual array once with merge sort (according to their acsii values)
// other arrays can be accessed with original index of sorted array when needed
tempCopy = [...data.guid];
const sortedGuid = mergeSort(tempCopy); // creates a seperated sorted array
tempCopy = [...data.firstName];
const sortedFN = mergeSort(tempCopy);
tempCopy = [...data.bookName];
const sortedTitle = mergeSort(tempCopy);
tempCopy = [...data.gender];
const sortedGender = mergeSort(tempCopy);

performanceTime.innerHTML = `page loaded in ${performance.now() - tLoad}ms`; // displays sorting time to html


// merge function used in mergeSort()
// combines and sorts (already sorted) left and right array together
// uses and modifies original arr to save time/space
function merge(left, right, arr) { // O(n)
  let i = 0;
  let j = 0;

  for (let k = 0; k < arr.length; k++) {
    if (i >= left.length) { // if left is empty
      arr[k] = right[j++]; // add remaining values from right
    }
    else if (j >= right.length) { // if right is empty
      arr[k] = left[i++]; // add remaining values from left
    }
    else if (left[i][0] < right[j][0]) { // if left element is less than right element
      // **only compares value (not original index)
      arr[k] = left[i++]; // add value from left
    }
    else { // if right element is less than left element
      arr[k] = right[j++]; // add value from right
    }
  }
  return arr;
}

// returns a part of arr given, starting at index 'start' (inclusive) and ending at index 'end' (non-inclusive)
// does the same thing as javascript array .slice function
// used in mergeSort(), non-mutating
function slice(arr, start, end = arr.length) { // O(n)
  let copy = [];
  // creates a copy of elements in arr from index start to end
  for (let i = start; i < end; i++) {
    copy[copy.length] = arr[i];
  }
  return copy;
}

// this is used to sort the arrays (recursively) everytime the page loads
// mutates arr given in parameter (which is why a copy of the arr is used for us)
// divides array in halves until it's a single element, then puts it back together while sorting it each time (using merge())
function mergeSort(arr) { // total: O(nlogn), without merge(): O(logn)
  // base case - when array is split up into 1 element
  if (arr.length === 1) {
    return arr; // returns array to be merged with merge()
  }

  // divide - splits up array into left and right halves
  let mid = Math.floor(arr.length / 2); // midpoint (rounded down) of array
  let left = slice(arr, 0, mid); // copy of array from start to midpoint
  let right = slice(arr, mid); // copy of array from midpoint to end

  // conquer - recursive call to further split up both halves into halves
  left = mergeSort(left);
  right = mergeSort(right);

  // combine - uses merge() to combine both sorted halves
  return merge(left, right, arr);
}

// search function used to find all matches what user searches for 
// returns array of sorted last names at all of the indexes
// splits into halves and compares target with middle value every time until 1 match is found
// searches in both directions from found match for any duplicates
// **array given must already be sorted
function binarySearch(arr, target, searching = true) { // total: O(nlogn), without mergeSort(): O(n), without searching for duplicates: O(logn)
  // left and right begins at start and end of array, changes with every search
  let right = arr.length - 1;
  let left = 0;
  let indices = []; // used to store indexes of all duplicates
  let count = 1; // used to search for all duplicates in both directions

  // returns value of array at index given in lowercase (searches aren't case sensitive)
  function arrValue(index) { // O(n)
    if (searching === false || document.getElementById("exact-results").checked) { // if user wants results that match exactly with their search - from stack overflow
      return arr[index][0].toLowerCase();
    }
    // if user wants results that starts with what they searched for
    return arr[index][0].toLowerCase().substring(0, target.length); // substring only compares first n letters depending on their search length
  }

  // compares mid point with target + repositions left/right until found
  while (left <= right) {
    let mid = Math.floor((left + right) / 2);
    let midValue = arrValue(mid); // value of array at mid point (to compare)

    if (midValue < target) { // if target is on the left of middle value
      left = mid + 1; // move left pointer to element after mid point
    }
    else if (midValue > target) { // if target is on the right side of middle value
      right = mid - 1; // move right pointer to element before mid point
    }
    else { // if target = middle value OR left = right (therefore target = middle value)
      indices[0] = mid; // adds midpoint index to indices

      // checks for duplicates in both directions + adds to indices array
      // loops until it reaches start/end of array or finds a value different from target (from either directions)
      while ((mid - count >= 0 && mid + count < books) && (midValue === arrValue(mid - count) || midValue === arrValue(mid + count))) { // O(n)
        if (midValue === arrValue(mid - count)) { // if value on left of mid value is a duplicate
          indices[indices.length] = mid - count; // adds index of duplicate to array
        }
        if (midValue === arrValue(mid + count)) { // if value on right of mid value is a duplicate
          indices[indices.length] = mid + count; // adds index of duplicate to array
        }
        count++; // updates count (for both directions)
      }

      // takes all indexes and converts to corresponding last name (to be sorted)
      let sortedByLN = []; // (will be) all the last names at indexes that match the search
      for (let i = 0; i < indices.length; i++) { // O(n)
        let originalIndex = arr[indices[i]][1]; // original index of searched values
        sortedByLN[sortedByLN.length] = data.lastName[originalIndex]; // adds element [value, index] from original last name array at searched indexes
      }

      // sorts and returns array with last names and original indexes of all matching results
      mergeSort(sortedByLN); // O(nlogn)
      return sortedByLN;
    }
  }
  return null; // if search doesn't exist in array given
}

// this allows search to be inputted when user presses the "enter" key (on keyboard)
function triggerSearch(button) { // O(1)
  if (event.keyCode === 13) { // checks if key pressed is "enter"
    document.getElementById(button).click(); // triggers button to enter input - from stack overflow
  }
}

// called when user presses "enter" button to search for a book (by any category)
// displays results to html
function search() { // O(nlogn) (from binarySearch())
  const search = document.getElementById("input-search").value.toLowerCase().replace(/\s+/g, ' ').trim(); // user input to search (removed extra spaces + converted to lowercase so it's not case sensitive) - from stack overflow // O(n), n = length of string
  const searchType = document.getElementById("search-select").value; // information field chosen to search for
  const results = document.getElementById("results"); // table displaying all results
  let searchResults; // array of (sorted) corresponding last names of results found 

  // if nothing was entered to search
  if (search.length === 0) {
    document.getElementById("error").innerHTML = "Please enter something"; // displays error message to html - from stack overflow
    performanceTime.innerHTML = ""; // hides performance time
    results.setAttribute("hidden", "hidden"); // hides results table
    return; // stops running code in function
  }

  const tSearch = performance.now(); // performance time for searching for target inputted by user

  // uses binarySearch() to find results based on information field chosen
  if (searchType === "title") {
    searchResults = binarySearch(sortedTitle, search); // searches from sorted array (of field chosen)
  }
  else if (searchType === "first name") {
    searchResults = binarySearch(sortedFN, search);
  }
  else if (searchType === "last name") {
    searchResults = binarySearch(sortedLN, search);
  }
  else if (searchType === "gender") {
    searchResults = binarySearch(sortedGender, search);
  }
  else { // if searchType = uid
    searchResults = binarySearch(sortedGuid, search);
  }

  // if there are no matching results from searching
  if (searchResults === null) {
    document.getElementById("error").innerHTML = `Sorry, there is no ${searchType} that matches your search`; // displays error message to html
    results.setAttribute("hidden", "hidden"); // hides results table
    performanceTime.innerHTML = `no results found in ${performance.now() - tSearch}ms`; // displays performance time
  }
  else { // if there are matching results
    performanceTime.innerHTML = `${searchResults.length} results found in ${performance.now() - tSearch}ms`; // displays # of results and performance time to html
    document.getElementById("error").innerHTML = ""; // hides error message
    results.removeAttribute("hidden"); // shows results table
    // uses displayTable() to create table with all results sorted by last name
    displayTable(searchResults); // O(n)
  }
}


// stored in global variables to be saved everytime function is called + can be accessed when changing pages
// displays first 10 books when first loaded
const itemsPerPage = 10;
let currentStart = 0;
let currentEnd = itemsPerPage;
let currentReverse = false; // table in ascending order by default
let currentSort;

// displays 10 books at a time as a table with all information and buttons for next/prev page
// can be sorted by ascii values from any information field ascending or descending, or unsorted
function displayTable(sortBy = null, reverse = false, start = 0, end = itemsPerPage) { // O(n), n = itemsPerPage = 10
  hideLoader(); // hides loading text when done loading
  // updates variables with given parameters
  currentReverse = reverse;
  currentStart = start;
  currentEnd = end;
  currentSort = sortBy;

  // number of rows/items to display
  let arrLength = books; // when showing all books (on table page)
  if (sortBy !== null) { // when showing results from search (on search page)
    arrLength = sortBy.length;
  }

  // buttons for next/previous page on html
  const prevButton = document.getElementById("prev-page");
  const nextButton = document.getElementById("next-page");

  // which buttons to show/hide depending on page and # of results
  if (arrLength < itemsPerPage) { // if # of results are less than a page (can fit on 1 page)
    // hides both buttons
    nextButton.setAttribute("type", "hidden"); // from stack overflow
    prevButton.setAttribute("type", "hidden");
  }
  else if (start === 0) { // if on the first page
    // hides previous page button
    nextButton.setAttribute("type", "button");
    prevButton.setAttribute("type", "hidden");
  }
  else if (end >= arrLength) { // if on the last page
    // hides next page button
    nextButton.setAttribute("type", "hidden");
    prevButton.setAttribute("type", "button");
  }
  else { // if in one of the middle pages
    // show both buttons
    nextButton.setAttribute("type", "button");
    prevButton.setAttribute("type", "button");
  }

  let rowNum = 0; // number of the row we're on
  let index = 0; // index of element being displayed

  const tTable = performance.now(); // performance time for creating + displaying table

  // adds all 5 information fields together to form a row, then adds to each row
  for (let i = start; i < end; i++) {
    const row = document.getElementById(`row${rowNum}`); // the row being modified in html

    if (i > arrLength - 1) { // if there are more rows than items to display
      row.style.display = 'none'; // hide unneeded rows after - from stack overflow
    }
    else {
      row.style.display = ''; // show/unhide the row (in case it was hidden before)
      if (sortBy === null) { // if showing all unsorted books (default when table page first loads)
        index = i; // shows books in original order
      }
      else if (reverse === true) { // if sorted in descending/reverse order
        index = sortBy[books - 1 - i][1]; // shows books starting from the end (according to sorted values)
      }
      else { // if sorted in ascending order
        index = sortBy[i][1]; // shows books according to sorted values
      }

      // changes row in html to display 5 corresponding information fields of book (at index)
      // *bonus* creates column with button to show uids of 10 references from author + displays referenced authors last, first name with uid when pressed
      // first parameter takes original index of guid, second parameter provides the current row num (to display on)
      row.innerHTML = `<tr>
      <td>${data.bookName[index][0]}</td>
      <td>${data.firstName[index][0]}</td>
      <td>${data.lastName[index][0]}</td>
      <td>${data.gender[index][0]}</td>
      <td>${data.guid[index][0]}</td>
      <td id="row${rowNum}" class="references"><button onclick="showReferences(${data.guid[index][1]}, ${rowNum})">show references</button></td>
      </tr>`; // from stack overflow
    }
    rowNum++; // move on to the next row
  }
  // displays current page number and total number of pages to html
  document.getElementById("pageNum").innerHTML = `page ${end / itemsPerPage} of ${Math.ceil(arrLength / itemsPerPage)}`;

  // displays performance time only when on table page (except loading for the first time) - only when table is reordered on table page
  if (sortBy !== null && arrLength === books) {
    performanceTime.innerHTML = `table loaded in ${performance.now() - tTable}ms`;
  }
}

// displays next 10 items on table
function nextPage() { // O(n)
  if ((currentEnd + itemsPerPage) <= books) { // if there is a next page
    // moves to next set of 10 items
    currentStart += itemsPerPage;
    currentEnd += itemsPerPage;
    // uses displayTable() to display next page of items
    displayTable(currentSort, currentReverse, currentStart, currentEnd); // O(n)
  }
}

// displays previous 10 items on table
function prevPage() { // O(n)
  if ((currentStart - itemsPerPage) >= 0) { // if there is a previous page
    // moves to previous set of 10 items
    currentStart -= itemsPerPage;
    currentEnd -= itemsPerPage;
    // uses displayTable() to display previous page of items
    displayTable(currentSort, currentReverse, currentStart, currentEnd); // O(n)
  }
}

// *bonus* - displays first + last name of 10 authors referenced based on guid
// called when button is pressed to show references
// parameter index = original index of author referencing (author button is pressed for), rowNum = row # of button pressed (to display references on)
function showReferences(index, rowNum) { // O(n), n = # of references = 10
  const tRef = performance.now() // performance time of searching + displaying all 10 references

  const row = document.getElementById(`row${rowNum}`); // row of author that button was pressed for
  let add = ""; // last name, first name - guid of author referenced
  const references = data.references[index]; // array of 10 uids referenced by author

  // finds original index of uid reference and displays author of uid
  for (let i = 0; i < 10; i++) { // O(n), n = 10
    // adds a new line (\n) with "last name, first name - uid" of referenced author using findAuthor()
    add += `${findAuthor(references[i])}\n`;
  }
  // replaces pressed button with 10 references with names
  row.cells[5].innerHTML = add; // from stack overflow

  row.cells[5].innerHTML += `\nreferences found in ${performance.now() - tRef}ms`; // displays performance time for finding references
}

// returns author as "last name, first name - uid" given guid to be displayed
// uses binary search to find original index of each uid
// only looks at element at index [0] since there should only be 1 result
function findAuthor(guid) { //O(logn) - no duplicates
  // binary search already returns last name as [last name, original index], first name can be accessed by using original index 
  const index = binarySearch(sortedGuid, guid, false)[0]; // original index of guid
  return `${index[0]}, ${data.firstName[index[1]][0]} - ${guid}`;
}

// *bonus* - BFS function used to find shortest number of "jumps" between 2 authors' references (MRCA)
// returns array of all UIDs between 2 authors, or null if not possible
// stores [uid currently checking, [uids to get to the current uid]] in queue and already checked uids in "checked" to prevent loops
// (doesn't always work)
function bfs(startUID, targetUID, queue = [[startUID, []]], checked = new Set()) { // O(mn), m = # of references = 10
  if (queue.length === 0) { // if there are no references connecting
    return null;
  }

  //obtain the first array element before deleting
  const checking = queue[0]; // uid and previous uids currently checking
  //remove the first element from array like in array.shift()
  [, ...queue] = queue;

  const reference = checking[0]; // current uid checking
  const uids = checking[1]; // previous uids to this point
  const index = binarySearch(sortedGuid, reference, false)[0][1]; // original index of current uid
  let nextReference; // next reference to check

  let temp = []; // to prevent uids from being modified
  // checks current uid's 10 references 
  for (let i = 0; i < 10; i++) {
    nextReference = data.references[index][i]; // goes through each of the 10 references
    temp = [...uids]; // copy of current uids to add to queue if needed

    if (nextReference === targetUID) { // if next reference is the target uid (target found)
      uids[uids.length] = nextReference; // add next reference to uids and return
      return uids;
    }
    if (!checked.has(nextReference) && nextReference !== startUID) { // if reference hasn't already been checked and isn't the starting uid
      checked.add(nextReference); // add referenced to checked references (to prevent checking next time)
      temp[temp.length] = nextReference; // add reference to current uids
      queue[queue.length] = [nextReference, temp]; // add current reference and uids to be checked (in queue)
    }
  }

  // recursive call until target has been found, or all items have been checked
  return bfs(startUID, targetUID, queue, checked);
}

// called when user searches for references connecting 2 authors
// takes user inputs and searches for results (if any) using bfs() function
// displays results/error message to html
function findMRCA() { // O(n)
  const tMRCA = performance.now(); // performance time for finding MRCA of 2 authors

  // user inputted uids of both authors (extra spaces removed - from stack overflow)
  const firstAuthor = document.getElementById("mrca-start").value.replace(/\s+/g, '').trim(); // O(n), n = length of string
  const secondAuthor = document.getElementById("mrca-end").value.replace(/\s+/g, '').trim();

  // original index of both authors (in [lastname, index] form)
  const firstIndex = binarySearch(sortedGuid, firstAuthor, false); //O(logn) - no duplicates
  const secondIndex = binarySearch(sortedGuid, secondAuthor, false);

  // to display any error messages or results to html
  const errorMessage = document.getElementById("mrca-error");
  const results = document.getElementById("mrca-results");

  // resets any displayed text every time function is called
  results.innerHTML = "";
  document.getElementById("jumps").innerHTML = "";
  document.getElementById("mrca-performance").innerHTML = "";
  errorMessage.innerHTML = "";

  // checks if valid uid(s) is/are entered for both authors + displays error message if not
  // includes when nothing is entered
  if (firstIndex === null && secondIndex === null) {
    errorMessage.innerHTML = "Please enter a valid UID for both authors";
  }
  else if (firstIndex === null) {
    errorMessage.innerHTML = "Please enter a valid UID for the first author";
  }
  else if (secondIndex === null) {
    errorMessage.innerHTML = "Please enter a valid UID for the second author";
  }
  else if (firstAuthor === secondAuthor) { // checks if both uids are the same
    results.innerHTML = `Please enter different UIDs`;
  }
  else { // if both uids are valid and different    
    const authors = `${data.firstName[firstIndex[0][1]][0]} ${data.lastName[firstIndex[0][1]][0]} to ${data.firstName[secondIndex[0][1]][0]} ${data.lastName[secondIndex[0][1]][0]}`; // to display author full names
    let MRCAresults;

    try { // checks for maximum call stack error 
      MRCAresults = bfs(firstAuthor, secondAuthor); // uids connecting first and second author
      if (MRCAresults === null) { // if no references connecting authors 
        results.innerHTML = `Sorry, there are no references that connect ${authors}`;
      }
      else {
        let add = "";
        // displays all connecting authors in a numbered list 
        for (let i = 0; i < MRCAresults.length; i++) {
          add += `${i + 1}. ${findAuthor(MRCAresults[i])}\n`; // O(logn)
        }
        results.innerHTML = add; // displays results to html
        document.getElementById("jumps").innerHTML = `${MRCAresults.length} jumps to get from ${authors}`; // displays number of jumps needed
      }
    }
    catch (ex) { // assumes no connection if maximum call stack is reached (to avoid error) - from stack overflow
      results.innerHTML = `Sorry, there are no references that connect ${authors} (within ~5 jumps)`;
    }
    document.getElementById("mrca-performance").innerHTML = `MRCA found in ${performance.now() - tMRCA}ms`; // displays performance time to html
  }
}