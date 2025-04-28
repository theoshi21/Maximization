$(document).ready(function() {
    var constraintCount = 0;
    var count = 2; // Default number of variables

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

        // 🚨 Reset constraints whenever variable count is changed
        $('#constraintsContainer').empty();
        constraintCount = 0;
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

    $('#addConstraint').click(function() {
        constraintCount++;

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
                <button class="btn btn-secondary dropdown-toggle" type="button" data-toggle="dropdown"> &lt; </button>
                <div class="dropdown-menu">
                    <a class="dropdown-item compare" href="#">&lt;</a>
                    <a class="dropdown-item compare" href="#">&lt;=</a>
                    <a class="dropdown-item compare" href="#">&gt;</a>
                    <a class="dropdown-item compare" href="#">&gt;=</a>
                    <a class="dropdown-item compare" href="="#">=</a>
                </div>
            </div>
            <div><input type="text" class="form-control variable-input m-1" placeholder="value"></div>
        </div>`;

        $('#constraintsContainer').append(constraintHTML);
    });

    $(document).on('click', '.compare', function() {
        $(this).closest('.dropdown').find('.btn').text($(this).text());
    });
});
