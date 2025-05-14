var constraintCount = 0;
var count = 2; // Default number of variables
  
$(document).ready(function() {
    const inputContainer = $('.objective-function .d-flex');
    const allInputWrappers = inputContainer.find('div:not(.plus-label)');
    const allPlusLabels = inputContainer.find('.plus-label');
    generateObjectiveInputs(count);

    hideAllInputs();
    showInputs(count);

    $('#numVariablesInput').on('input', function () {
    let numVariables = parseInt($(this).val());

    hideAllInputs();
    showInputs(numVariables);

    count = numVariables; // Update variable count

    // Reset constraints and regenerate objective inputs
    $('#constraintsContainer').empty();
    constraintCount = 0;
    $('#nonNegativityConstraint').empty();
    $('#standardForm').empty();
    $('#initialTable').empty();

    generateObjectiveInputs(count);
});

    function generateObjectiveInputs(numVariables) {
      const inputContainer = $('#objectiveInputs');
      inputContainer.empty(); // Clear previous inputs

      for (let i = 1; i <= numVariables; i++) {
        const inputField = `
          <div class="d-flex align-items-center m-1">
            <input id="x${i}" type="number" class="form-control variable-input w-auto">
            <span class="ml-1">x<sub>${i}</sub></span>
          </div>
        `;

        inputContainer.append(inputField);

        // Add "+" sign except after the last variable
        if (i !== numVariables) {
          inputContainer.append(`<div class="plus-label font-weight-bold m-1">+</div>`);
        }
      }
    }

    function hideAllInputs() {
        allInputWrappers.each(function() { $(this).hide(); });
        allPlusLabels.each(function() { $(this).hide(); });
    }

    function showInputs(count) {
        if (count >= 1 && allInputWrappers[0]) {
            $(allInputWrappers[0]).show();
        }
        for (let i = 1; i < count; i++) {
            if (i < allInputWrappers.length) {
                $(allInputWrappers[i]).show();
            }
            if ((i-1) < allPlusLabels.length) {
                $(allPlusLabels[i-1]).show();
            }
        }
    }

//Add Constraint Button
    $('#addConstraint').click(function() {
        constraintCount++;
        updateNonNegativityConstraint(count);

        let constraintHTML = `<div class="d-flex align-items-center mb-2 flex-wrap justify-content-center">`;
        for (let i = 1; i <= count; i++) {
            constraintHTML += `
                <div><input id="r${constraintCount}x${i}" type="number" class="form-control variable-input m-1 w-auto" placeholder="x${i}"></div>
                <span class="ml-1">x<sub>${i}</sub></span>
            `;
            if (i !== count) {
                constraintHTML += `<div class="plus-label font-weight-bold m-1">+</div>`;
            }
        }

        constraintHTML += `
            <div class="dropdown m-2">
                <button id="dropdownCompare${constraintCount}" class="btn btn-secondary dropdown-toggle" type="button" data-toggle="dropdown"> &lt;= </button>
                <div class="dropdown-menu">
                    <a class="dropdown-item compare" href="#">&lt;=</a>
                    <a class="dropdown-item compare" href="#">&gt;=</a>
                    <a class="dropdown-item compare" href="#">=</a>
                </div>
            </div>
            <div><input type="text" id="val${constraintCount}" class="form-control variable-input m-1" placeholder="value"></div>
        </div>`;

        $('#constraintsContainer').append(constraintHTML);
    });

      $(document).on('click', '.compare', function() {
      const clickedDropdown = $(this).closest('.dropdown').find('.dropdown-toggle');
      clickedDropdown.text($(this).text());
    });

  function updateNonNegativityConstraint(varCount) {
    const constraintDiv = document.getElementById("nonNegativityConstraint");
    let variables = [];

    for (let i = 1; i <= varCount; i++) {
      variables.push(`x<sub>${i}</sub>`);
    }

    constraintDiv.innerHTML = variables.join(", ") + " ≥ 0";
  }
});

function reset() {
  // Clear DOM elements
  $("#standardForm").empty();
  $("#initialTable").empty();
  $("#otherTables").empty();
  $("#found").empty();

  // Reset main data structures
  objFunctions = {};
  constraints = {};
  values = {};
  addedVars = {};

  // Reset tableau-related variables
  ZjMinusCj = [];
  Ci = [];
  soln = [];
  columns = [];
  inVariable = null;
  inVal = null;
  pivotElement = null;
  pivotRow = null;
  pivotColumn = null;
  computedZj = [];
  cjValues = [];
  cjValuesAndVariables = {};
  slackCount = [];
  aCount = [];
  exitVariable;
  exitValue;
}


  var objFunctions = new Object();
  var constraints = new Object();
  var values = new Object();
  var addedVars = {};
  var ZjMinusCj = [];
  var Ci = [];
  var soln = [];
  var columns = [];
  var inVariable;
  var inVal;
  var pivotElement;
  var pivotRow;
  var pivotColumn;
  var computedZj;
  var cjValues = [];
  var cjValuesAndVariables = {};
  var slackCount = [];
  var aCount = [];
  var exitVariable;
  var exitValue;
  var headerCount = 0;

  //SOLVE BUTTON CLICKCKED
  $('#solveButton').click(function() {
  reset();
   for (let i = 1; i <= count; i++){
      objFunctions[`x${i}`] = document.getElementById(`x${i}`).value || "0";
   }

   //Checking the inside of the array
   for (x in objFunctions){
    console.log(`VALUES: ${x} is ${objFunctions[x]}`);
   }

  for (let i = 1; i <= constraintCount; i++) {
    for (let j = 1; j <= count; j++) {
      if (!constraints[`r${i}`]) {
        constraints[`r${i}`] = [];
      }

      // Now you can safely push the value to the array
      constraints[`r${i}`].push(document.getElementById(`r${i}x${j}`).value);
    }
    //Adding the value 2nd to the last in the array and the comparison operator in the last one.
    values[`r${i}`] = document.getElementById(`val${i}`).value;
    constraints[`r${i}`].push(document.getElementById(`dropdownCompare${i}`).textContent);
  }


   for (let key in constraints) {
      console.log(`${key}: ${constraints[key]}`)
    }

    for(let key in values){
      console.log(`${key}: ${values[key]}`)
    }

    var standardForm = JSON.parse(JSON.stringify(constraints));
       for (let key in constraints) {
      if (constraints.hasOwnProperty(key)) {
        let lastValue = constraints[key][constraints[key].length - 1];
        if (lastValue.trim() === "<=") {
          constraints[key][constraints[key].length - 1] = 1;
        }
        if(lastValue.trim() === ">=") {
          constraints[key][constraints[key].length - 1] = -1;
          constraints[key].push('-M')
        }
        if(lastValue.trim() === "=") {
          constraints[key][constraints[key].length - 1] = '-M';
        }
      }
    }

    for(let key in constraints){
      console.log(constraints[key])
    }


    let standardHTML = `
    <h5 class="bg-secondary text-white text-center mt-3 py-2">Standard Form: </h5>`;
  
    let arbitraryCounter = 1;

    var standardForm = JSON.parse(JSON.stringify(constraints)); // deep copy

    for (let i = 1; i <= constraintCount; i++) {
      let key = `r${i}`;
      addedVars[key] = [];

      if (standardForm.hasOwnProperty(key)) {
        let val = [...standardForm[key]];

        // Replace empty inputs with "0"
        for (let j = 0; j < val.length; j++) {
          if (val[j] === "") {
            val[j] = "0";
          }
        }

          // Apply transformations and track added vars
        if (val[val.length - 1] === "1" || val[val.length - 1] === 1) {
          val[val.length - 1] = `S<sub>${i}</sub>`;
          addedVars[key].push(val[val.length - 1]);
        } else if (
          (val[val.length - 1] === "-M" || val[val.length - 1] === -'M') &&
          (val[val.length - 2] === -1 || val[val.length - 2] === "-1") &&
          val.length > count + 1
        ) {
          val[val.length - 1] = `A<sub>${arbitraryCounter++}</sub>`;
          val[val.length - 2] = `-S<sub>${i}</sub>`;
          addedVars[key].push(val[val.length - 2]);
          addedVars[key].push(val[val.length - 1]);
        } else if (val[val.length - 1] === "-M" || val[val.length - 1] === -'M') {
          val[val.length - 1] = `A<sub>${arbitraryCounter++}</sub>`;
          addedVars[key].push(val[val.length - 1]);
        }


        //Use to add labels to the standard form
        let expressionParts = [];
        for (let j = 0; j < count; j++) {
          let coeff = val[j] || "0";
          expressionParts.push(`${coeff}x<sub>${j+1}</sub>`);
        }

        // Add slack, surplus, or arbitrary variables (e.g., S1, -S2, A1)
        for (let j = count; j < val.length; j++) {
          expressionParts.push(`${val[j]}`);
        }

        let valuesText = expressionParts.join(' + ') + ` = ${values[key] || "0"}`;
        standardHTML += `<h4 class="text-center">${valuesText}</h4>`;
              }
            }
    document.getElementById("standardForm").innerHTML = standardHTML;

    initialTable();
    let iteration = 1;
    let continueLoop = createSimplexTable(iteration);

    // Loop until solution is found
    while (continueLoop  && iteration < 20) {
      iteration++;
      continueLoop = createSimplexTable(iteration);
    }

    if(iteration === 20){
      document.getElementById("found").innerHTML = `
      <div class="alert alert-danger text-center" role="alert">
        Error! The solution may not be feasible or is too large.
      </div>
    `;
    }


  });


//Can take in variable, in value as a parameter
function createSimplexTable(iteration){
  console.log(`========= ITERATION ${iteration} =========`)

  let tableHTML = `<h5 class="text-centered mt-2"> <b>Iteration ${iteration}</b> </h5>
    <table id="iteration${iteration}" class="table table-bordered mt-2 w-100 text-nowrap text-center hover">
      <thead>
        <tr class="obj">
          <th colspan="3">C<sub>j</sub></th>`;

  console.log(`cjValues: ${cjValues}`)
  let columnCounter = 1;

// Add cjValues row (first row of the table)
  let xKeys = getSortedKeysByPrefix(cjValuesAndVariables, 'x');
  let sKeys = getSortedKeysByPrefix(cjValuesAndVariables, 's');
  let aKeys = getSortedKeysByPrefix(cjValuesAndVariables, 'a');

  for (const key of xKeys) {
    tableHTML += `<td class="c${columnCounter}">${cjValuesAndVariables[key]}</td>`;
    columnCounter++;
  }
  for (const key of sKeys) {
    tableHTML += `<td class="c${columnCounter}">${cjValuesAndVariables[key]}</td>`;
    columnCounter++;
  }
  for (const key of aKeys) {
    tableHTML += `<td class="c${columnCounter}">${cjValuesAndVariables[key]}</td>`;
    columnCounter++;
  }

  tableHTML += `<th class="text-center align-middle" rowspan='2'> Q<sub>i</sub> </th> </tr>`;


  // Second row (headers for Xi, Si, Ai, etc.)
  columnCounter = 1;
  tableHTML += `<tr class="headerRow"><th class=""> C<sub>i</sub> </th> <th> Sol </th> <th> Q </th>`;

  for (const key of xKeys) {
    let index = key.slice(1); // Get the numeric part
    tableHTML += `<th class="c${columnCounter}"> x<sub>${index}</sub> </th>`;
    columnCounter++;
  }

  for (const key of sKeys) {
    let index = key.slice(1);
    tableHTML += `<th class="c${columnCounter}"> S<sub>${index}</sub> </th>`;
    columnCounter++;
  }

  for (const key of aKeys) {
    let index = key.slice(1);
    tableHTML += `<th class="c${columnCounter}"> A<sub>${index}</sub> </th>`;
    columnCounter++;
  }

  tableHTML += `</tr>`;

  sortCjValuesAndVariables(cjValuesAndVariables);
  console.log(cjValuesAndVariables);

  //Changing the Exit Variable
  Ci[pivotRow] = inVal;
  soln[pivotRow] = inVariable;

  //Normalizing the pivotRow
  console.log(`ITERATION ${iteration}`)
  console.log("columns: ", columns)
  console.log(`pivotRow: ${pivotRow}, pivotColumn: ${pivotColumn}`)
  pivotElement = columns[pivotRow][pivotColumn+1]
  console.log(`Pivot Element: ${pivotElement}`);
  let newRow = normalize(columns[pivotRow], pivotElement)
  columns[pivotRow] = newRow;

  //Normalizing the other row using the normalized pivot row
  for (let i = 0; i < constraintCount; i++) {
    let key = `r${i+1}`
    if (i !== pivotRow) {
      let updatedRow = [];
      let multiplier = columns[i][pivotColumn+1]
      console.log(`R${i+1} multiplier:${multiplier}`)
      for(let j = 0; j < columns[i].length; j++){
        let val = columns[i][j] - (multiplier*columns[pivotRow][j]);
        console.log(`${columns[i][j]} - (${multiplier}*${columns[pivotRow][j]}) = ${val};`)
        updatedRow.push(val.toFixed(2));
      }
      console.log(`Row ${i+1}: ${updatedRow}`)
      columns[i] = updatedRow;
      console.log(columns[i])
    }
    values[key] = columns[i][0]
  }
  console.log(values)


  for(let i = 1; i <= constraintCount; i++){
    tableHTML += `<tr class="row${i}"> <td class="varInitialValue"> ${Ci[i-1]} </td> <td class="varShow">${soln[i-1]} </td> <td class="varValue"> ${columns[i-1][0]} </td>`;
    for(let j = 1; j < columns[0].length; j++){
      tableHTML += `<td class="c${j}"> ${columns[i-1][j]} </td>`;
    }
    tableHTML += `<td id="i${iteration}qi${i}"> </td>`
  }

  
  //ZJ Row
  tableHTML += `<tr> <th colspan="3">Z<sub>j</sub> </th>`

  computedZj = computeZj(Ci,columns)
  console.log(`computedZj: ${cjValues}`)
  for(let i = 0; i < columns[0].length-1; i++){
    tableHTML += `<td class="c${i+1}"> ${computedZj[i]} </td>`
  }


  //Zj-Cj Row
  tableHTML += `<tr><th colspan="3">Z<sub>j</sub> - C<sub>j</sub></th>`;

  console.log(`Cj Values: ${cjValues}`)
  cjValues = [];
  for(let i = 0; i < Object.keys(cjValuesAndVariables).length; i++){
     const key = Object.keys(cjValuesAndVariables)[i];
     const value = cjValuesAndVariables[key];
     cjValues.push(value)
  }


  ZjMinusCj = computeZjMinusCj(computedZj, cjValues)
  console.log(`ZjMinusCj: ${ZjMinusCj}`)
  for (let i = 0; i < ZjMinusCj.length; i++) {
    tableHTML += `<td class="c${i + 1}">${ZjMinusCj[i]}</td>`;
  }

  tableHTML += ` </tr> </thead> </table>`

  document.getElementById("otherTables").innerHTML += tableHTML;
  pivotColumn = getIndexOfMostNegativeZjCj(ZjMinusCj)

  if(pivotColumn !== null){
    highlightPivotColumn(pivotColumn, `iteration${iteration}`)
    var qi = [];
    for (let i = 1; i <= constraintCount; i++) {
      let key = `r${i}`;
      let cell = document.querySelector(`#iteration${iteration} tr.row${i} td.c${pivotColumn + 1}`);
      let val = 0;

      if (cell && cell.textContent.trim() !== "") {
        let parsed = parseFloat(cell.textContent.trim());
        val = isNaN(parsed) ? 0 : parsed;
      }

      let quotient;
      if (val === 0 || isNaN(val)) {
        quotient = "—"; // Invalid division or negative result
      } else {
        quotient = (values[key] / val).toFixed(2);
      }
      console.log(`quotient: ${quotient}`)

      qi.push(quotient);
      if(quotient === "—" || quotient < 0){
        document.getElementById(`i${iteration}qi${i}`).textContent = `—`
      }
      else {
		 
        document.getElementById(`i${iteration}qi${i}`).textContent = `${values[key]} / ${val}`
      }
    }


    pivotRow = findLowestPositiveWithIndex(qi)
    console.log(`pivotColumn: ${pivotColumn}`)
    console.log(`Pivot row: ${pivotRow}`)
    highlightPivotRow(pivotRow, `iteration${iteration}`)

    inVariable = document.querySelector(`tr.headerRow th.c${pivotColumn+1}`).innerHTML.trim();
    inVal = document.querySelector(`tr.obj td.c${pivotColumn+1}`).innerHTML.trim();
    console.log(`In Variable: ${inVariable}`);
    console.log(`In Value: ${inVal}`);

    exitVariable = document.querySelector(`#iteration${iteration} tr.row${pivotRow+1} td.varShow`).innerHTML.trim();
    exitValue = document.querySelector(`#iteration${iteration} tr.row${pivotRow+1} td.varInitialValue`).innerHTML.trim();
    console.log(`Exit Variable: ${exitVariable}`);
    console.log(`Exit Value: ${exitValue}`);

    console.log(JSON.stringify(cjValuesAndVariables, null, 2));
    console.log(`Column before deletion: ${JSON.stringify(columns, null, 2)}`);

    const match = exitVariable.match(/([aA])<sub>(\d+)<\/sub>/);
      if (match) {
        const letter = match[1].toLowerCase(); // e.g., 'a'
        const index = match[2];                // e.g., '2'
        const key = `${letter}${index}`;       // 'a2'
        removeColumn(key)
        delete cjValuesAndVariables[key];
      }
    console.log(`Column after deletion: ${JSON.stringify(columns, null, 2)}`);

    console.log(JSON.stringify(cjValuesAndVariables, null, 2));

    return true;
  }
  else {
    document.getElementById("found").innerHTML += `<h1 class="text-center mt-3"> Solution is found. </h1>`

    let solution = [];
    const rows = document.querySelectorAll(`#iteration${iteration} tr`);

    rows.forEach(row => {
      const varShowElem = row.querySelector("td.varShow");
      const varValueElem = row.querySelector("td.varValue");

      if (varShowElem && varValueElem) {
        const varShowText = varShowElem.textContent.trim();
        const varValueText = varValueElem.textContent.trim();

        console.log(varShowText, varValueText);

        if (varShowText.startsWith("x")) {
          solution.push([varShowText, varValueText]);
        }
      }
    });

  
	let xVars = getSortedKeysByPrefix(cjValuesAndVariables,'x')
	// Extract variable values from `solution` into a map
	const varMap = {};
	solution.forEach(([varName, varValue]) => {
	  varMap[varName] = parseFloat(varValue);
	});
		let Z = 0;
		let zTerms = [];

  for(const keys in xVars){
    const varName = xVars[keys]
    const coeff = cjValuesAndVariables[varName]
    const value = varMap[varName] || 0;

    Z += coeff * value;
    zTerms.push(`${coeff}(${value})`);
  }
    //Pa FIX na lang ako guys ng formatting, nasa loob ng solutions[] array lang 'yung mga sagot thanks!
    document.getElementById("solutions").innerHTML = "";

    solution.forEach(([varShow, varValue]) => {
    const formattedVarShow = varShow.replace(/x(\d+)/, 'x<sub>$1</sub>');

    // Create a wrapper div
    const wrapperDiv = document.createElement("div");
    wrapperDiv.className = "text-center mb-4"; // center align and spacing between sets

    // Create variable value paragraph
    const pElement = document.createElement("p");
    pElement.className = "fw-bold";
    pElement.style.fontSize = "2rem";
    pElement.innerHTML = `${formattedVarShow} = ${varValue}`;

    // Create Z expression paragraph
    const zExpression = `Z = ${zTerms.join(" + ")} = ${Z}`;
    const zElement = document.createElement("p");
    zElement.className = "fw-bold mt-2";
    zElement.style.fontSize = "2rem";
    zElement.innerHTML = zExpression;

    // Append both to wrapper
    wrapperDiv.appendChild(pElement);
    wrapperDiv.appendChild(zElement);

    // Append wrapper to main solutions container
    document.getElementById("solutions").appendChild(wrapperDiv);
    });

    return false;
  }
  
}

//INITIAL TABLE
function initialTable() {
  Ci = [];
  let cjCol = count;
  let SandA = 0;

  // For computing Cj Column
  for (let i = 1; i <= constraintCount; i++) {
    let sign = document.getElementById(`dropdownCompare${i}`).textContent.trim();

    // Add 1 to the column if signs are <= or =, add 2 if sign is >=
    cjCol += (sign === "<=" || sign === "=") ? 1 : (sign === ">=" ? 2 : 0);
    console.log(`CjCol: ${cjCol}`);
  }

  // Start HTML structure
  let initialHTML = `<h5 class="text-centered mt-2">  <b>Initial Tableau</b> </h5>
    <table id="initialTableau" class="table table-bordered mt-2 w-100 text-nowrap text-center hover">
      <thead>
        <tr class="obj">
          <th colspan="3">C<sub>j</sub></th>`;

  // Add Cj values for original decision variables
  let keys = Object.keys(objFunctions);
  cjObjValues = []
  for (let i = 0; i < keys.length; i++) {
    let key = keys[i];
    cjObjValues.push(objFunctions[key])
  }

  // Add slack and artificial variable Cj values
  for (let i = 1; i <= constraintCount; i++) {
    let sign = document.getElementById(`dropdownCompare${i}`).textContent.trim();

    if (sign === "<=") {
      slackCount.push("0");
    } else if (sign === "=") {
      aCount.push("-M");
    } else if (sign === ">=") {
      slackCount.push("0");
      aCount.push("-M");
    }
  }

  headerCount = count+cjCol;

    cjValues = [...cjObjValues, ...slackCount, ...aCount];
    for (let i = 0; i < cjValues.length; i++) {
      initialHTML += `<td class="c${i+1}">${cjValues[i]}</td>`;
    } 

  // Close header row
  initialHTML += `<th class="text-center align-middle" rowspan='2'> Q<sub>i</sub> </th> </tr>`;

  //For the Cj, Soln, Q and other labels:
  initialHTML += `<tr class="headerRow"><th class=""> C<sub>i</sub> </th> <th> Sol </th> <th> Q </th>`

  //Populating header Xi columns
  for(let i = 1; i <= keys.length; i++){
    initialHTML += `<th class="c${i}"> x<sub>${i}</sub> </th>`
    cjValuesAndVariables[`x${i}`] = cjObjValues[i-1];
  }

  //Populating the header custom variables
  for(let i = 1; i <= slackCount.length; i++){
    initialHTML += `<th class="c${keys.length+i}"> S<sub>${i}</sub> </th>`
    cjValuesAndVariables[`s${i}`] = slackCount[i-1];
  }

  for(let i = 1; i <= aCount.length; i++){
    initialHTML += `<th class="c${keys.length+slackCount.length+i}"> A<sub>${i}</sub> </th>`
    cjValuesAndVariables[`a${i}`] = aCount[i-1];
  }

  for(x in cjValuesAndVariables){
    console.log(`x: ${cjValuesAndVariables[x]}`);
  }

  sortCjValuesAndVariables(cjValuesAndVariables);

  //Adding the row depending on the constraints
  console.log(`ADDED VARS`)
  console.log(JSON.stringify(addedVars, null, 2));
  let allAddedVars = [];
  for (let k in addedVars) {
    allAddedVars = allAddedVars.concat(addedVars[k]);
  }

  // Get unique variable labels in order
  let uniqueAddedVars = [...new Set(allAddedVars)];

  for (let i = 1; i <= constraintCount; i++) {
    let key = `r${i}`;
    let varShow = "";

    if (addedVars[key].length > 1) {
      varShow = addedVars[key][addedVars[key].length - 1];
    } else {
      varShow = addedVars[key][0];
    }
    soln.push(varShow);

    let varShowValue = ""
    const match = varShow.match(/([A-Za-z])<sub>(\d+)<\/sub>/);
    if (match) {
      const letter = match[1].toLowerCase(); // e.g., 'a'
      const index = match[2];                // e.g., '2'
      const key = `${letter}${index}`;       // 'a2'
      varShowValue = cjValuesAndVariables[key];
      Ci.push(varShowValue);
    }
    console.log(`Ci${i}: ${Ci} `)
    initialHTML += `<tr class="row${i}"> <td class="varInitialValue"> ${varShowValue} </td> <td class="varShow">${varShow} </td> <td class="varValue"> ${values[key]} </td>`;
    if (!columns[i - 1]) columns[i - 1] = [];
    columns[i - 1].push(values[key]);
    console.log(`Column After Val: ${columns}`);

    // Add original decision variable coefficients
    let colIndex = 1; // Start from c1

    for (let j = 0; j < count; j++) {
      initialHTML += `<td class="c${colIndex}"> ${constraints[key][j] || 0} </td>`;
      colIndex++;
      columns[i-1].push(constraints[key][j] || 0);  
    }
    console.log(`Column After Constraints: ${columns}`);

    // Add added variables with class names
    const cjKeys = Object.keys(cjValuesAndVariables); // e.g., ["x1", "x2", "s1", "a1", ...]

    for (let keyName of cjKeys) {
      if (keyName.startsWith("x")) continue; // already added earlier

      const index = keyName.slice(1); // "1" from "s1", "a1", etc.
      const htmlLabel = keyName.startsWith("s") ? `S<sub>${index}</sub>` : `A<sub>${index}</sub>`;
      const negativeLabel = `-S<sub>${index}</sub>`;

      // Check if the current row (e.g., addedVars[r1]) contains either form
      let cellValue = "0";
      if (addedVars[key].includes(htmlLabel)) {
        cellValue = "1";
      } else if (addedVars[key].includes(negativeLabel)) {
        cellValue = "-1";
      }

      initialHTML += `<td class="c${colIndex}">${cellValue}</td>`;
      colIndex++;
      columns[i - 1].push(cellValue);
    }
    console.log(JSON.stringify(columns, null, 2));

    initialHTML += `<td id=initialqi${i}></td>` //I WANT TO ADD THE QI VALUES HERE!
    initialHTML += `</tr>`;

  }

  // Add Zj row
  computedZj = computeZj(Ci, columns);
  console.log(`Computed ZJ: ${computedZj}`);
  initialHTML += `<tr> <th colspan="3">Z<sub>j</sub> </th>`

  for(let i = 0; i < computedZj.length; i++){
    initialHTML += `<td class="c${i+1}"> ${computedZj[i]} </td>`
  }

  initialHTML += `<td rowspan='2'> </td> </tr>`;

  // Add Zj - Cj row
  ZjMinusCj = computeZjMinusCj(computedZj, cjValues);

  // Add Zj - Cj row
  initialHTML += `<tr><th colspan="3">Z<sub>j</sub> - C<sub>j</sub></th>`;

  for (let i = 0; i < ZjMinusCj.length; i++) {
    initialHTML += `<td class="c${i + 1}">${ZjMinusCj[i]}</td>`;
  }

  initialHTML += ` </tr> </thead> </table>`

  // Inject into DOM
  document.getElementById('initialTable').innerHTML = initialHTML;

  pivotColumn = getIndexOfMostNegativeZjCj(ZjMinusCj)
  console.log(`Pivot Column in Initial: ${pivotColumn}`);
  highlightPivotColumn(pivotColumn, 'initialTableau')

  var qi = [];
  for (let i = 1; i <= constraintCount; i++) {
    let key = `r${i}`;
    let cell = document.querySelector(`#initialTableau tr.row${i} td.c${pivotColumn + 1}`);
    console.log(`cell value: ${cell.textContent}`)
    let val = 0;

    if (cell && cell.textContent.trim() !== "") {
      let parsed = parseFloat(cell.textContent.trim());
      val = isNaN(parsed) ? 0 : parsed;
      console.log(`cell value to val: ${val} `)
    }

     let quotient;
      if (val === 0 || isNaN(val) ) {
        quotient = "—"; // Invalid division or negative result
      } else {
        quotient = (values[key] / val).toFixed(2);
      }
      console.log(`quotient: ${quotient}`)

      qi.push(quotient);
      if(quotient === "—" || quotient < 0){
        document.getElementById(`initialqi${i}`).textContent = `—`
      }
      else {
        document.getElementById(`initialqi${i}`).textContent = `${values[key]} / ${val}`
      }
  }
  console.log(`qi: ${qi}`)

  pivotRow = findLowestPositiveWithIndex(qi)
  console.log(`pivotColumn: ${pivotColumn}`)
  console.log(`Pivot row: ${pivotRow}`)
  highlightPivotRow(pivotRow, "initialTableau")

  inVariable = document.querySelector(`#initialTableau tr.headerRow th.c${pivotColumn+1}`).innerHTML.trim();
  inVal = document.querySelector(`#initialTableau tr.obj td.c${pivotColumn+1}`).innerHTML.trim();
  console.log(`In Variable: ${inVariable}`);
  console.log(`In Value: ${inVal}`);

  exitVariable = document.querySelector(`#initialTableau tr.row${pivotRow+1} td.varShow`).innerHTML.trim();
  exitValue = document.querySelector(`#initialTableau tr.row${pivotRow+1} td.varInitialValue`).innerHTML.trim();
  console.log(`Exit Variable: ${exitVariable}`);
  console.log(`Exit Value: ${exitValue}`);

  console.log(JSON.stringify(cjValuesAndVariables, null, 2));
  console.log(`Column before deletion: ${JSON.stringify(columns, null, 2)}`);

  const match = exitVariable.match(/([aA])<sub>(\d+)<\/sub>/);
    if (match) {
      const letter = match[1].toLowerCase(); // e.g., 'a'
      const index = match[2];                // e.g., '2'
      const key = `${letter}${index}`;       // 'a2'
      removeColumn(key)
      delete cjValuesAndVariables[key];
    }
    console.log(`Column after deletion: ${JSON.stringify(columns, null, 2)}`);

    console.log(JSON.stringify(cjValuesAndVariables, null, 2));
}

function countVariablePrefixes(obj, prefix = null) {
  const counts = { x: 0, s: 0, a: 0 };

  for (let key in obj) {
    const firstChar = key[0];
    if (counts.hasOwnProperty(firstChar)) {
      counts[firstChar]++;
    }
  }

  if (prefix) {
    return counts[prefix] || 0;
  }

  return counts;
}

function getSortedKeysByPrefix(obj, prefix) {
  return Object.keys(obj)
    .filter(key => key.startsWith(prefix))
    .sort((a, b) => {
      const numA = parseInt(a.slice(1));
      const numB = parseInt(b.slice(1));
      return numA - numB;
    });
}

function sortCjValuesAndVariables(obj) {
  const prefixOrder = { x: 1, s: 2, a: 3 };

  const sortedObj = Object.keys(obj)
    .sort((k1, k2) => {
      const p1 = prefixOrder[k1[0]];
      const p2 = prefixOrder[k2[0]];

      if (p1 === p2) {
        // Compare numeric parts
        const num1 = parseInt(k1.slice(1), 10);
        const num2 = parseInt(k2.slice(1), 10);
        return num1 - num2;
      }

      return p1 - p2;
    })
    .reduce((acc, key) => {
      acc[key] = obj[key];
      return acc;
    }, {});

  return sortedObj;
}

function removeColumn(inputKey) {
  const keys = Object.keys(cjValuesAndVariables);
  const indexArtificial = keys.indexOf(inputKey);
  console.log(indexArtificial); // e.g., 5 (if it's the 6th item, since index is 0-based)
  for (let i = 0; i < columns.length; i++) {
    columns[i].splice(indexArtificial+1, 1);
  }
}

function computeZj(ciArray, columns) {
  const zjValues = [];
  const numCols = columns[0].length;
  const numRows = ciArray.length;

  for (let colIndex = 1; colIndex < numCols; colIndex++) {
    const exprParts = [];

    for (let rowIndex = 0; rowIndex < numRows; rowIndex++) {
      const ci = ciArray[rowIndex];
      const colVal = columns[rowIndex][colIndex];

      if (ci !== undefined && colVal !== undefined) {
        exprParts.push(`(${ci}) * (${colVal})`);
      }
    }

    const fullExpr = exprParts.join(" + ") || "0";
    const simplified = formatExpression(fullExpr);
    zjValues.push(simplified);
  }

  return zjValues;
}

function computeZjMinusCj(computedZj, cjValues) {
  const resultArray = [];

  for (let i = 0; i < cjValues.length; i++) {
    const zj = computedZj[i] || "0";
    const cj = cjValues[i] || "0";

    const expression = `(${zj}) - (${cj})`;
    console.log(`expression: ${expression}`)
    const result = formatExpression(expression);

    resultArray.push(result);
  }

  return resultArray;
}

function findLowestPositiveWithIndex(qi) {
  let minVal = Infinity;
  let minIndex = -1;

  for (let i = 0; i < qi.length; i++) {
    const expr = formatExpression(qi[i]); // Clean formatting for display
    const numericExpr = expr.replace(/M/g, "1e9");

    try {
      const evaluated = math.evaluate(numericExpr);
      if (typeof evaluated === "number" && evaluated > 0 && evaluated < minVal) {
        minVal = evaluated;
        minIndex = i;
      }
    } catch {}
  }

  return minIndex !== -1 ? minIndex : qi.length-1;
}

function getPivotRow(columnIndex) {
  let minRatio = Infinity;
  let rowIndex = null;

  for (let i = 0; i < constraintCount; i++) {
    let denominator = parseFloat(columns[i][columnIndex + 1]);
    let numerator = parseFloat(columns[i][0]);

    if (denominator > 0) {
      let ratio = numerator / denominator;
      if (ratio < minRatio) {
        minRatio = ratio;
        rowIndex = i;
      }
    }
  }

  return rowIndex;
}

function getIndexOfHighest(zjCjArray) {
  let maxVal = -Infinity;
  let maxIndex = -1;

  for (let i = 0; i < zjCjArray.length; i++) {
    const expr = formatExpression(zjCjArray[i]);
    const numericExpr = expr.replace(/M/g, "1e9");

    try {
      const evaluated = math.evaluate(numericExpr);
      if (typeof evaluated === "number" && evaluated > maxVal) {
        maxVal = evaluated;
        maxIndex = i;
      }
    } catch {}
  }

  return maxIndex;
}

function getIndexOfMostNegativeZjCj(zjCjArray) {
  let minVal = Infinity;
  let minIndex = -1;

  for (let i = 0; i < zjCjArray.length; i++) {
    const expr = formatExpression(zjCjArray[i]);
    const numericExpr = expr.replace(/M/g, "1e9");

    try {
      const evaluated = math.evaluate(numericExpr);
      if (typeof evaluated === "number" && evaluated < minVal) {
        minVal = evaluated;
        minIndex = i;
      }
    } catch {}
  }

  // If no negative values were found, return a special value (e.g., -1 or null)
  if (minVal >= 0) {
    return null; // or -1, depending on your needs
  }

  return minIndex;
}


function highlightPivotColumn(index, table) {
  const colClass = `#${table} .c${index+1}`;
  const pivotCells = document.querySelectorAll(colClass);
  pivotCells.forEach(cell => {
    cell.classList.add("bg-info", "text-white");
  });
}

function highlightPivotRow(index, table) {
  const rowClass = `#${table} .row${index + 1}`;
  const pivotRow = document.querySelectorAll(rowClass);
  pivotRow.forEach(cell => {
    cell.classList.add("bg-info", "text-white");
  });
}

function formatExpression(expr) {
  try {
    let simplified = math.simplify(expr).toString();

    return simplified
      .replace(/(\d+)\s*\*\s*([a-zA-Z]+)/g, "$1$2")    // 3 * M => 3M
      .replace(/-\((\d+[a-zA-Z]+)\)/g, "-$1")          // -(3M) => -3M
      .replace(/\+\s*-/g, "- ")
      .replace(/-\s*-/g, "+ ")
      .replace(/^\+ /, "")
      .trim() || "0";
  } catch {
    return expr;
  }
}

function normalize(array, pivotElement) {
  if (pivotElement === 0) {
    throw new Error("Cannot divide by zero (pivotElement is 0)");
  }

  return array.map(element => parseFloat((element / pivotElement).toFixed(2)));
}


  
