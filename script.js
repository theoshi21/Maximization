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
    for(x in addedVars){
      console.log(`Added VARS: ${addedVars[x]}`);
    }
  });


  //INITIAL TABLE
function initialTable() {
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
  let initialHTML = `
    <table class="table table-bordered mt-2 w-100 text-nowrap text-center hover">
      <thead>
        <tr>
          <th colspan="3">C<sub>j</sub></th>`;

  // Add Cj values for original decision variables
  let keys = Object.keys(objFunctions);
  cjObjValues = []
  for (let i = 0; i < keys.length; i++) {
    let key = keys[i];
    cjObjValues.push(objFunctions[key])
  }

  // Add slack and artificial variable Cj values
  var slackCount = [];
  var aCount = [];
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

    let cjValues = [...cjObjValues, ...slackCount, ...aCount];
    let cjValuesAndVariables = {};
    for (let i = 0; i < cjValues.length; i++) {
      initialHTML += `<td class="c${i+1}">${cjValues[i]}</td>`;
    }

  // Close header row
  initialHTML += `<th class="text-center align-middle" rowspan='2'> Q<sub>i</sub> </th> </tr>`;

  //For the Cj, Soln, Q and other labels:
  initialHTML += `<th class=""> C<sub>i</sub> </th> <th> Soln </th> <th> Q </th>`

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

    let varShowValue = ""
    const match = varShow.match(/([A-Za-z])<sub>(\d+)<\/sub>/);
    if (match) {
      const letter = match[1].toLowerCase(); // e.g., 'a'
      const index = match[2];                // e.g., '2'
      const key = `${letter}${index}`;       // 'a2'
      varShowValue = cjValuesAndVariables[key];
    }
    initialHTML += `<tr class="row${i}"> <td> ${varShowValue} </td> <td>${varShow} </td> <td> ${values[key]} </td>`;

    // Add original decision variable coefficients
    let colIndex = 1; // Start from c1
    let rowIndex

    for (let j = 0; j < count; j++) {
      initialHTML += `<td class="c${colIndex}"> ${constraints[key][j] || 0} </td>`;
      colIndex++;
    }

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
    }

    initialHTML += `<td id=qi${i}></td>` //I WANT TO ADD THE QI VALUES HERE!
    initialHTML += `</tr>`;

  }

  // Add Zj row
  initialHTML += `<tr> <th colspan="3">Z<sub>j</sub> </th>`
  for(let i = 0; i < cjCol; i++){
    initialHTML += `<td class="c${i+1}"> 0 </td>`
  }
  initialHTML += `<td rowspan='2'> </td> </tr>`;

  // Add Zj - Cj row
  initialHTML += ` <tr> <th colspan="3">Z<sub>j</sub> - C<sub>j</sub> </th>`;
  for (let i = 0; i < cjValues.length; i++) {
  let result = cjValues[i];

  if (result !== "0" && result !== "-M") {
      let num = parseFloat(result);
      
      if (!isNaN(num)) {
        let displayValue = num >= 0 ? `-${num}` : `${-num}`;
        initialHTML += `<td class="c${i+1}"> ${displayValue} </td>`;
        ZjMinusCj.push(displayValue);
      } else {
        // Fallback if value is not a number (e.g., symbolic like "M")
        initialHTML += `<td class="c${i+1}"> ${result} </td>`;
        ZjMinusCj.push(result);
      }

    } else if (result === "-M") {
      initialHTML += `<td class="c${i+1}"> M </td>`;
      ZjMinusCj.push("M");
    } else {
      initialHTML += `<td class="c${i+1}"> 0 </td>`;
      ZjMinusCj.push("0");
    }
  }

  initialHTML += ` </tr> </thead> </table>`

  // Inject into DOM
  document.getElementById('initialTable').innerHTML = initialHTML;

  let pivotColumn = getIndexOfMostNegativeZjCj(ZjMinusCj)
  highlightPivotColumn(pivotColumn)

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
    }

    console.log(`PIVOT COL VAL: ${values[key]} / ${val} = ${quotient}`);
    qi.push(quotient);
    document.getElementById(`qi${i}`).textContent = quotient;
  }

  let pivotRow = findLowestPositiveWithIndex(qi)
  console.log(`Pivot row: ${pivotRow}`)
  highlightPivotRow(pivotRow)

}

function findLowestPositiveWithIndex(qi) {
  let minVal = Infinity;
  let minIndex = -1;

  for (let i = 0; i < qi.length; i++) {
    let val = qi[i];
    let num;

    if (val === "M") {
      num = 1e9; // Treat "M" as a large positive number
    } else if (val === "-M") {
      num = -1e9; // Treat "-M" as a large negative number
    } else {
      num = parseFloat(val); // Parse as a float if it's a number
    }

    // Check for positive and non-zero values
    if (!isNaN(num) && num > 0 && num < minVal) {
      minVal = num;
      minIndex = i;
    }
  }

  return minIndex; // Return the index of the lowest positive, non-zero value
}

function getIndexOfHighest(zjCjArray) {
  let maxVal = -Infinity;
  let maxIndex = -1;

  for (let i = 0; i < zjCjArray.length; i++) {
    let val = zjCjArray[i];
    let num;

    if (val === "M") {
      num = 1e9;
    } else if (val === "-M") {
      num = -1e9;
    } else {
      num = parseFloat(val);
    }

    if (!isNaN(num) && num > maxVal) {
      maxVal = num;
      maxIndex = i;
    }
  }

  return maxIndex;
}

function getIndexOfMostNegativeZjCj(zjCjArray) {
  let minVal = Infinity;
  let minIndex = -1;

  for (let i = 0; i < zjCjArray.length; i++) {
    let val = zjCjArray[i];
    let num;

    // Handling special cases for "M" and "-M"
    if (val === "M") {
      num = 1e9;  // Large positive value for "M"
    } else if (val === "-M") {
      num = -1e9; // Large negative value for "-M"
    } else {
      num = parseFloat(val); // Parse the numeric value from the string
    }

    // Ensure the value is a valid number and compare for the most negative value
    if (!isNaN(num) && num < minVal) {
      minVal = num;
      minIndex = i;
    }
  }

  return minIndex;
}


function highlightPivotColumn(index) {
  const colClass = `.c${index+1}`;
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


  
