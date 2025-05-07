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
  var ZjMinusCj;

  //SOLVE BUTTON CLICKCKED
  $('#solveButton').click(function() {
  objFunctions = {};
  constraints = {};
  values = {};
  addedVars = {};
  ZjMinusCj = [];

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



   //Checking the values of constraints
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
    <h5 class="bg-secondary text-white text-center mt-3 py-2">Standard Form</h5>`;
  
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
        standardHTML += `<p class="text-center">${valuesText}</p>`;
              }
            }
    document.getElementById("standardForm").innerHTML = standardHTML;

    initialTable();
    createSimplexTable("1");
  });

function solveTable(){
  isOptimal = ZjMinusCj.every(val => parseFloat(val) >= 0);
  while(!isOptimal){
    
  }
}

//Can take in variable, in value as a parameter
function createSimplexTable(iteration){
  let tableHTML = `<h5 class="text-centered mt-2"> <b>Iteration ${iteration}</b> </h5>
    <table id="iteration${iteration}" class="table table-bordered mt-2 w-100 text-nowrap text-center hover">
      <thead>
        <tr class="obj">
          <th colspan="3">C<sub>j</sub></th>`;

  for (let i = 0; i < cjValues.length; i++) {
    tableHTML += `<td class="c${i+1}">${cjValues[i]}</td>`;
  }

  tableHTML += `<th class="text-center align-middle" rowspan='2'> Q<sub>i</sub> </th> </tr>`;

  //For the Cj, Soln, Q and other labels:
  tableHTML += `<tr class="headerRow"><th class=""> C<sub>i</sub> </th> <th> Soln </th> <th> Q </th>`

  //Populating header Xi columns
  for(let i = 1; i <= cjObjValues.length; i++){
    tableHTML += `<th class="c${i}"> x<sub>${i}</sub> </th>`
    cjValuesAndVariables[`x${i}`] = cjObjValues[i-1];
  }

  //Populating the header custom variables
  for(let i = 1; i <= slackCount.length; i++){
    tableHTML += `<th class="c${cjObjValues.length+i}"> S<sub>${i}</sub> </th>`
    cjValuesAndVariables[`s${i}`] = slackCount[i-1];
  }

  for(let i = 1; i <= aCount.length; i++){
    tableHTML += `<th class="c${cjObjValues.length+slackCount.length+i}"> A<sub>${i}</sub> </th>`
    cjValuesAndVariables[`a${i}`] = aCount[i-1];
  }

  //Changing the Exit Variable
  Ci[pivotRow] = inVal;
  soln[pivotRow] = inVariable;

  //Normalizing the pivotRow
  pivotElement = columns[pivotRow][pivotColumn+1]
  let newRow = normalize(columns[pivotRow], pivotElement)
  columns[pivotRow] = newRow;
  console.log(`Pivot Element: ${pivotElement}`);

  //Normalizing the pivotElement
  for (let i = 0; i < constraintCount; i++) {
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
    }
  }

  for(let i = 1; i <= constraintCount; i++){
    tableHTML += `<tr class="row${i}"> <td class="varInitialValue"> ${Ci[i-1]} </td> <td class="varShow">${soln[i-1]} </td> <td class="varValue"> ${columns[i-1][0]} </td>`;
    for(let j = 1; j < columns[0].length; j++){
      tableHTML += `<td class="c${j}"> ${columns[i-1][j]} </td>`;
    }
  }

  
  //ZJ ROW
  tableHTML += `<tr> <th colspan="3">Z<sub>j</sub> </th>`

  computedZj = computeZj(Ci,columns)
  console.log(`computedZj: ${cjValues}`)
  for(let i = 0; i < columns[0].length-1; i++){
    tableHTML += `<td class="c${i+1}"> ${computedZj[i]} </td>`
  }


  //Z - J
  tableHTML += `<tr><th colspan="3">Z<sub>j</sub> - C<sub>j</sub></th>`;

  console.log(`Cj Values: ${cjValues}`)
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
      let cell = document.querySelector(`table.iteration${iteration} tr.row${i} td.c${pivotColumn + 1}`);
      let val = 0;

      if (cell && cell.textContent.trim() !== "") {
        let parsed = parseFloat(cell.textContent.trim());
        val = isNaN(parsed) ? 0 : parsed;
      }

      let quotient;
      if (val === 0 || isNaN(val)) {
        quotient = "—"; // or you can use `null` or `"NaN"` depending on your logic
      } else {
        quotient = (values[key] / val).toFixed(2);
        var frac = new Fraction(quotient);
      }
      console.log(`PIVOT COL VAL: ${values[key]} / ${val} = ${frac.toFraction()}`);
      qi.push(quotient);
      document.getElementById(`qi${i}`).textContent = frac.toFraction();
    }
  }
  else {
    document.getElementById("found").innerHTML += `<h1 class="text-center"> Solution is found. </h1>`
  }
}

var cjValues = [];
var cjValuesAndVariables = {};
var slackCount = [];
var aCount = [];
//INITIAL TABLE
function initialTable() {
  Ci = [];
  let cjCol = count;
  let SandA = 0;

  // For computing Cj Column
  for (let i = 1; i <= constraintCount; i++) {
    let sign = document.getElementById(`dropdownCompare${i}`).textContent.trim();
    console.log(`Sign: ${sign}`);

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

    cjValues = [...cjObjValues, ...slackCount, ...aCount];
    for (let i = 0; i < cjValues.length; i++) {
      initialHTML += `<td class="c${i+1}">${cjValues[i]}</td>`;
    } 

  // Close header row
  initialHTML += `<th class="text-center align-middle" rowspan='2'> Q<sub>i</sub> </th> </tr>`;

  //For the Cj, Soln, Q and other labels:
  initialHTML += `<tr class="headerRow"><th class=""> C<sub>i</sub> </th> <th> Soln </th> <th> Q </th>`

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

  //Adding the row depending on the constraints
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
    for (let varLabel of uniqueAddedVars) {
      let cellValue = "0";

      if (addedVars[key].includes(varLabel)) {
        if (varLabel.startsWith("S")) {
          cellValue = "1";
        } else if (varLabel.startsWith("-S")) {
          cellValue = "-1";
        } else if (varLabel.startsWith("A")) {
          cellValue = "1";
        }
      }

      initialHTML += `<td class="c${colIndex}"> ${cellValue} </td>`;
      colIndex++;
      columns[i-1].push(cellValue);
    }
    console.log(JSON.stringify(columns, null, 2));

    initialHTML += `<td id=qi${i}></td>` //I WANT TO ADD THE QI VALUES HERE!
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
    let cell = document.querySelector(`tr.row${i} td.c${pivotColumn + 1}`);
    let val = 0;

    if (cell && cell.textContent.trim() !== "") {
      let parsed = parseFloat(cell.textContent.trim());
      val = isNaN(parsed) ? 0 : parsed;
    }

    let quotient;
    if (val === 0 || isNaN(val)) {
      quotient = "—"; // or you can use `null` or `"NaN"` depending on your logic
    } else {
      quotient = (values[key] / val).toFixed(2);
      var frac = new Fraction(quotient);
    }
    console.log(`PIVOT COL VAL: ${values[key]} / ${val} = ${frac.toFraction()}`);
    qi.push(quotient);
    document.getElementById(`qi${i}`).textContent = frac.toFraction();
  }

  pivotRow = findLowestPositiveWithIndex(qi)
  console.log(`pivotColumn: ${pivotColumn}`)
  console.log(`Pivot row: ${pivotRow}`)
  highlightPivotRow(pivotRow)

  inVariable = document.querySelector(`tr.headerRow th.c${pivotColumn+1}`).innerHTML.trim();
  inVal = document.querySelector(`tr.obj td.c${pivotColumn+1}`).innerHTML.trim();
  console.log(`In Variable: ${inVariable}`);
  console.log(`In Value: ${inVal}`);
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

  return minIndex;
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

function highlightPivotRow(index) {
  const rowClass = `.row${index + 1}`;
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


  
