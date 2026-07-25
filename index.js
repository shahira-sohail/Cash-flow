const salaryForm = document.getElementById("salaryForm");
const salaryInput = document.getElementById("salary");

const salaryDisplay = document.getElementById("salaryDisplay");
const balanceDisplay = document.getElementById("balanceDisplay");

//expense
const expenseForm = document.getElementById("expenseForm");
const expenseNameInput = document.getElementById("expenseName");
const expenseAmountInput = document.getElementById("expenseAmount");

const expenseDisplay = document.getElementById("expenseDisplay");
const expenseList = document.getElementById("expenseList");

const salaryError = document.getElementById("salaryError");
const expenseNameError = document.getElementById("expenseNameError");
const expenseAmountError = document.getElementById("expenseAmountError");

const chartCanvas = document.getElementById("expenseChart");
let expenseChart;



let totalSalary = 0;
let totalExpenses = 0;
let remainingBalance = 0;
let expenses = [];

function updateBalanceColor() {
    if (remainingBalance < 0) {
        balanceDisplay.classList.remove("positive-balance");
        balanceDisplay.classList.add("negative-balance");
    } else {
        balanceDisplay.classList.remove("negative-balance");
        balanceDisplay.classList.add("positive-balance");
    }
}
//stopping refresh of the page when submitting a form
salaryForm.addEventListener("submit",function(event){
    event.preventDefault();

    const salary = Number(salaryInput.value);
    salaryError.textContent = "";
    if(salary <= 0){
        salaryError.textContent = "Salary must be greater than 0.";
         return;
    }
    totalSalary = salary;
    remainingBalance = totalSalary - totalExpenses;


    //updating the dashboard
    salaryDisplay.textContent = `₹${totalSalary}`;
    balanceDisplay.textContent = `₹${remainingBalance}`;
    
    updateBalanceColor();
    saveToLocalStorage();
    renderChart();
});

expenseForm.addEventListener("submit", function(event){
    event.preventDefault();
    const expenseName = expenseNameInput.value;
    const expenseAmount = Number(expenseAmountInput.value);
    expenseNameError.textContent = "";
    expenseAmountError.textContent = "";

    if(expenseName.trim() === ""){
        expenseNameError.textContent = "Expense name is required.";
        return;
    }

    if(expenseAmount <= 0){
        expenseAmountError.textContent = "Expense amount must be greater than 0.";
        return;
    }

    const expense = {
        id: Date.now(),//creating a unique id
        name: expenseName,
        amount: expenseAmount
    };
    expenses.push(expense);
    totalExpenses += expenseAmount;

    remainingBalance = totalSalary - totalExpenses;

    expenseDisplay.textContent = `₹${totalExpenses}`;
    balanceDisplay.textContent = `₹${remainingBalance}`;
    updateBalanceColor();

    saveToLocalStorage();
    renderExpenses();
    renderChart();
    expenseNameInput.value = "";
    expenseAmountInput.value = "";
});

const currentDate = document.getElementById("current-date");

function displayCurrentDate() {
    const today = new Date();

    currentDate.textContent = today.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric"
    });
}

displayCurrentDate();

function saveToLocalStorage() {
    localStorage.setItem(
        "salary",
        JSON.stringify(totalSalary)
    );

    localStorage.setItem(
        "expenses",
        JSON.stringify(expenses)
    );
}

function loadFromLocalStorage(){
    const savedSalary = JSON.parse(localStorage.getItem("salary"));
    const savedExpenses = JSON.parse(localStorage.getItem("expenses"));
    if(savedSalary){totalSalary = savedSalary;}
    if(savedExpenses){expenses = savedExpenses;}

    totalExpenses = 0;
    expenses.forEach(function(expense){totalExpenses += expense.amount;});
    remainingBalance = totalSalary - totalExpenses;
    salaryDisplay.textContent = `₹${totalSalary}`;
    expenseDisplay.textContent = `₹${totalExpenses}`;
    balanceDisplay.textContent = `₹${remainingBalance}`;
    expenseList.innerHTML = "";
    updateBalanceColor();
    renderExpenses();
    renderChart();
}

function renderExpenses() {
    expenseList.innerHTML = "";
    expenses.forEach(function(expense) {
        const expenseItem = document.createElement("div");
        expenseItem.classList.add("expense-item");
        expenseItem.innerHTML = `
            <span>${expense.name}</span>
            <div>
                <span class="expense-price">₹${expense.amount}</span>
                <button class="delete-btn" data-id="${expense.id}">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        `;
        expenseList.appendChild(expenseItem);    
    });           
} 

function renderChart() {
    if (expenseChart) {
        expenseChart.destroy();
    }

    expenseChart = new Chart(chartCanvas, {
        type: "pie",
        data: {
            labels: [
                 "Remaining Balance",
                 "Total Expenses"
            ],
            datasets: [
                {
                    data: [
                        remainingBalance,
                        totalExpenses
                    ],
                    backgroundColor: [
                         "#22c55e",
                         "#ef4444"
                    ]
                }
            ]
        }
    });
}

loadFromLocalStorage();

expenseList.addEventListener("click", function(event){
    if(event.target.closest(".delete-btn")){
       const button = event.target.closest(".delete-btn");
       const id = Number(button.dataset.id);
        expenses = expenses.filter(function(expense){
            return expense.id !== id;
        });
        totalExpenses = 0;
        expenses.forEach(function(expense){
            totalExpenses += expense.amount;
        });
        remainingBalance = totalSalary - totalExpenses;
        expenseDisplay.textContent = `₹${totalExpenses}`;
        balanceDisplay.textContent = `₹${remainingBalance}`;
        updateBalanceColor();
        saveToLocalStorage();
        renderExpenses();
        renderChart();
    }
});


