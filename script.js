const dateDisplay = document.getElementById('date-display');
const monthDisplay = document.getElementById('month-display');
const previousMonthDisplay = document.getElementById('previous-month-display');
const progressCircle = document.getElementById('progress-circle');
const progressText = document.getElementById('progress-text');
const foodListContainer = document.getElementById('food-list');

const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const currentDate = new Date();
const currentMonthIndex = currentDate.getMonth();
const currentMonthName = months[currentMonthIndex];
const currentDay = currentDate.getDate();
const currentYear = currentDate.getFullYear();

let foodsForMonth = [];
let totalFoods = 0;

function initialise() {
    updateDateDisplay();
    handleMonthTransition();
    fetchCSVData();
}

function updateDateDisplay() {
    const daysInMonth = new Date(currentYear, currentMonthIndex + 1, 0).getDate();
    dateDisplay.textContent = `Day ${currentDay} of ${daysInMonth} - ${currentMonthName} ${currentYear}`;
    monthDisplay.textContent = currentMonthName;
}

function handleMonthTransition() {
    const storedMonth = localStorage.getItem('trackedMonth');
    const storedPercentage = localStorage.getItem('currentPercentage');

    if (storedMonth && storedMonth !== currentMonthName) {
        localStorage.setItem('previousMonthPercentage', storedPercentage || '0');
        localStorage.removeItem('checkedFoods');
    }
    
    localStorage.setItem('trackedMonth', currentMonthName);
    
    const prevPercent = localStorage.getItem('previousMonthPercentage');
    if (prevPercent) {
        previousMonthDisplay.textContent = `Last Month: ${prevPercent}%`;
    }
}

async function fetchCSVData() {
    try {
        const response = await fetch('eat_the_seasons_monthly_foods_wide.csv');
        const data = await response.text();
        parseCSV(data);
    } catch (error) {
        foodListContainer.innerHTML = '<p>Error loading CSV file. Ensure it is in the root directory.</p>';
    }
}

function parseCSV(csvText) {
    const lines = csvText.trim().split('\n');
    
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        const firstCommaIndex = line.indexOf(',');
        if (firstCommaIndex === -1) continue;
        
        const rowMonth = line.substring(0, firstCommaIndex).trim();
        const rowFoods = line.substring(firstCommaIndex + 1).replace(/^"|"$/g, '').trim();

        if (rowMonth === currentMonthName) {
            foodsForMonth = rowFoods.split(',').map(f => f.trim()).filter(f => f.length > 0);
            totalFoods = foodsForMonth.length;
            renderFoodList();
            updateProgress();
            break;
        }
    }
}

function renderFoodList() {
    foodListContainer.innerHTML = '';
    const storedChecked = JSON.parse(localStorage.getItem('checkedFoods')) || [];

    foodsForMonth.forEach(food => {
        const div = document.createElement('div');
        div.className = 'food-item';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = food;
        checkbox.value = food;
        checkbox.checked = storedChecked.includes(food);
        
        checkbox.addEventListener('change', handleCheckboxChange);

        const label = document.createElement('label');
        label.htmlFor = food;
        label.textContent = food;

        div.appendChild(checkbox);
        div.appendChild(label);
        foodListContainer.appendChild(div);
    });
}

function handleCheckboxChange() {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    const checkedFoods = [];
    
    checkboxes.forEach(cb => {
        if (cb.checked) checkedFoods.push(cb.value);
    });

    localStorage.setItem('checkedFoods', JSON.stringify(checkedFoods));
    updateProgress();
}

function updateProgress() {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    const checkedCount = document.querySelectorAll('input[type="checkbox"]:checked').length;
    
    let percentage = 0;
    if (totalFoods > 0) {
        percentage = Math.round((checkedCount / totalFoods) * 100);
    }

    localStorage.setItem('currentPercentage', percentage);
    progressText.textContent = `${percentage}%`;

    const hue = (percentage / 100) * 120;
    const colour = `hsl(${hue}, 80%, 50%)`;
    
    progressCircle.style.background = `conic-gradient(${colour} ${percentage}%, #e5e7eb ${percentage}%)`;
}

initialise();