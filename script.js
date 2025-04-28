    var constraintCount = 0;
    var count = 2; // Default number of variables

$(document).ready(function() {
    const inputContainer = $('.objective-function .d-flex');
    const allInputWrappers = inputContainer.find('div:not(.plus-label)');
    const allPlusLabels = inputContainer.find('.plus-label');

    hideAllInputs();
    showInputs(count);

    $('.var').click(function(e) {
        e.preventDefault();
        const numVariables = parseInt($(this).text());
        const dropdownButton = $('#dropdownVar');

        hideAllInputs();
        showInputs(numVariables);
        dropdownButton.text(`Variables: ${numVariables}`);
        
        count = numVariables; // Update variable count

        //  Reset constraints whenever variable count is changed
        $('#constraintsContainer').empty();
        constraintCount = 0;
        $('#nonNegativityConstraint').empty()
    });

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
                <div><input id="r${constraintCount}x${i}" type="text" class="form-control variable-input m-1 w-auto" placeholder="x${i}"></div>
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
      $(`#dropdownCompare${constraintCount}`).text($(this).text());
    });

  function updateNonNegativityConstraint(varCount) {
    const constraintDiv = document.getElementById("nonNegativityConstraint");
    let variables = [];

    for (let i = 1; i <= varCount; i++) {
      variables.push(`x${i}`);
    }

    constraintDiv.innerHTML = variables.join(", ") + " ≥ 0";
  }
});



  //SOLVE BUTTON CLICKCKED
  $('#solveButton').click(function() {
  var objFunctions = new Object();
  var constraints = new Object();
  var values = new Object();
  
   for (let i = 1; i <= count; i++){
      objFunctions[`x${i}`] = document.getElementById(`x${i}`).value;
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

    var standardForm = Object.assign({}, constraints);
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


    let standardHTML = `<h5 class="bg-secondary text-white text-center mt-3">Standard Form</h5>`;

      for (let i = 1; i <= count; i++) {
        let key = `r${i}`;  // e.g., r1, r2, r3

        if (constraints.hasOwnProperty(key)) {
          let val = [...constraints[key]];  // Copy the array (to not modify original)

          // Check the last value
          if (val[val.length - 1] == 0) {
            val[val.length - 1] = `S${i}`;
          }

          if ((val[val.length - 1] == '-M') && (val[val.length - 2] == -1) && (val.length > count + 1)) {
            val[val.length - 1] = `A${i}`; 
            val[val.length - 2] = `-S${i}`; 
          }

          if (val[val.length - 1] == '-M') {
            val[val.length - 1] = `A${i}`; 
          }

          for (let j = 0; j < val.length; j++) {
            if (val[j] === "") {
              val[j] = "0";
            }
          }

          let valuesText = val.join(' + ') + ` = ${values[key]}`;

          standardHTML += `<p class="text-center">${valuesText}</p>`;
        }
      }

    document.getElementById("standardForm").innerHTML = standardHTML;
  });
