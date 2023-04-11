// A global constant, to check against to see if we exeed our montly maximum budget.
const MONTHLY_MAX = 20000;

// When the browser finishes parsing the HTML and building the DOM, run the onReady function.
$(document).ready(onReady);

// This runs when the page finishes loading.
function onReady() {

    // Set the initial monthly total, based on any hardcoded employees.
    setTotalMonthly();

    // Set up a click handler on the form element.
    // When it's associate submit button is clicked, we run the anonymous callback function.
    $("form").submit(
        // This is the anonymous callback function we invoke with the click handler.
        function (event) {

            // Set up an 'empty' new employe object, to fill up with data from the form.
            let newEmployee = {
                first_name: '',
                last_name: '',
                employee_id: '',
                title: '',
                annual_salary: 0
            }

            // Stop the page form automatically reload when the form is submited.
            // We need to do this, since we have no way of keeping data around when the page resets.... yet.
            event.preventDefault();

            // Fancy way to unpack the form data, into a new_employee object.
            $(this).serializeArray().map(function (x) { newEmployee[x.name] = x.value; });

            // Fancy way to clear the whole input form.  This needs to happen after we unpack it.
            // Otherwise, it we would be unpacking something that's empty!
            $('#inputForm')[0].reset();

            // Add a new employee to the Employees table.
            addNewEmployeeToTable(newEmployee);

            // Update the "total monthly", since we've added a new employee.
            setTotalMonthly();
        }
    );

    // Set up an event handler on the <tbody> element with an id='employeeData'.
    // If an element inside it, with a class of 'delete' is clicked
    // Then run the deleteEmployee function.
    $('#employeeData').on('click', '.delete', deleteEmployee);

}

// Read the employees salaries off the DOM, add them up, and divide by 12.
// Then, update the total on the DOM.
function setTotalMonthly() {
    // Select all elments with a class of "annual_salary".
    // This creates a big object, containing several smaller objects.
    // Each of the smaller objects is a salary <td> element.
    let salary_elements = $('.annual_salary');

    // Grab the text of all the salaries, concatenating them and returning a string like: '$80,000$58,000$48,000'
    let salaries_as_string = salary_elements.text();

    // Split up the string of salaries at each $, creating an array of strings with out $'s.
    let salary_strings = salaries_as_string.split('$');

    // Since the string of salries started with $, the first element of our array is empty.
    // This gets rid of it.
    salary_strings.shift();

    // Now, we look at each element of the array, using .map
    // When you run the .map function on an array, it runs the callback function you give it as a paramater, on each element of the array.
    // We take the ',' symbols out of each string, and turn them into numbers.
    // Now, we have an array of numbers!
    let salaries = salary_strings.map(x => Number(x.replaceAll(',', '')));

    // Now, we have an array of numbers, that we want to add up.
    // Luckily, Javascript has a thing for this.
    // The .reduce function is similar to the .map function.
    // When you run .reduce on an array, it runs the callback function you give it as a paramater, on each element of the array.
    // The big difference, is that the .reduce funciton also takes an extra parameter, that will get passed along with each element.
    // This accumulator value "remembers" what happend on the previous elements.
    let initialValueForAccumulator = 0;
    let total = salaries.reduce(
        (accumulator, currentValue) => accumulator + currentValue, initialValueForAccumulator
    );

    // Take the total, and divide by 12 to get the monthly total.
    let total_monthly = total / 12;

    // Format the monthly total as currency.
    let total_monthly_string = `Total Monthly: ${totalMonthlyAsCurrency.format(total_monthly)}`;

    // Update the monthly total amount on the DOM.
    $('#totalMonthlyAmount').text(total_monthly_string);

    // Check to see if we have gone over budget, or 
    if (total_monthly > MONTHLY_MAX) {
        $('#totalMonthlyAmount').addClass('budget_exceded');
    } else {
        $('#totalMonthlyAmount').removeClass('budget_exceded');
    }
}


// Adds a new employee to the employees table.
function addNewEmployeeToTable(newEmployee) {

    // Take the annual salary, and convert it from a string to a number.
    let annual_salary_as_a_number = Number(newEmployee.annual_salary);
    // Take the salary as a number, and turn it into a string, formatted as currency.
    let formatted_annual_salary = salaryAsCurrency.format(annual_salary_as_a_number);

    // Add the new employee to the table, right before the blank row at the end.
    $('#blank_row').before(
        `<tr class=".employee">
        <td>${newEmployee.first_name}</td>
        <td>${newEmployee.last_name}</td>
        <td>${newEmployee.employee_id}</td>
        <td>${newEmployee.title}</td>
        <td class="annual_salary">${formatted_annual_salary}</td>
        <td>
            <button class="delete">Delete</button>
        </td>
    </tr>`
    )
}

// Delete an employee from the table.
function deleteEmployee() {
    // Grab the button that was clicked on.
    let delete_button = $(this);

    // Traverse the DOM to it's parent, the <td> cell.
    let table_data = delete_button.parent();

    // Traverse the DOM to the <td> cell's parent, the <tr>.
    let table_row = table_data.parent();

    // Remove that row from the DOM.
    table_row.remove();

    // Update the "total monthly", since we've delteted an employee.
    setTotalMonthly()

}

// A number format object, that lets us pass it a number and get back a well
// formatted dollar amount.  There are many ways to do this, and I'd argue this
// isn't the 'best' way, but it's a way that's interesting to learn about and
// can be reused throught the program.
const salaryAsCurrency = new Intl.NumberFormat('en-US',
    {
        style: 'currency', currency: 'USD',
        maximumFractionDigits: 0
    });

// Similar to above, but this one returns the number of pennies as well!
// Keeping track of when to use decimals and to use whole numbers is something
// you'll deal with your entire programming career, (not to mention rounding!).
const totalMonthlyAsCurrency = new Intl.NumberFormat('en-US',
    {
        style: 'currency', currency: 'USD',
        maximumFractionDigits: 2, minimumFractionDigits: 2
    });
