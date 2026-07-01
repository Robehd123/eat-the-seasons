const dateDisplay = document.getElementById('date-display');
const monthDisplay = document.getElementById('month-display');
const previousMonthDisplay = document.getElementById('previous-month-display');
const progressCircle = document.getElementById('progress-circle');
const progressText = document.getElementById('progress-text');
const foodListContainer = document.getElementById('food-list');
const searchInput = document.getElementById('search-input');

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
    setupSearch();
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
        previousMonthDisplay.textContent = `Previous Month: ${prevPercent}%`;
    }
}

async function fetchCSVData() {
    try {
        const response = await fetch('eat_the_seasons_monthly_foods_wide.csv');
        const data = await response.text();
        parseCSV(data);
    } catch (error) {
        foodListContainer.innerHTML = '<p>Error loading CSV data. Ensure local server or hosting is active.</p>';
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
            foodsForMonth = rowFoods.split(',').filter(f => f.trim().length > 0);
            totalFoods = foodsForMonth.length;
            renderCategorisedList();
            updateProgress();
            break;
        }
    }
}

function renderCategorisedList() {
    foodListContainer.innerHTML = '';
    const storedChecked = JSON.parse(localStorage.getItem('checkedFoods')) || [];

    let sanitisedFoods = foodsForMonth.map(food => food.replace(/["']/g, '').trim());
    sanitisedFoods.sort((a, b) => b.localeCompare(a));

    const categoryMap = {
        'Vegetables & Fungi': [
            'Artichoke', 'Asparagus', 'Aubergine', 'Beetroot', 'Broad Beans', 'Broccoli', 
            'Brussels Sprouts', 'Butternut Squash', 'Carrots', 'Cauliflower', 'Celeriac', 
            'Celery', 'Chicory', 'Chillies', 'Courgettes', 'Cucumber', 'Fennel', 'French Beans', 
            'Garlic', 'Horseradish', 'Jersey Royal New Potatoes', 'Jerusalem Artichoke', 'Kale', 
            'Kohlrabi', 'Leeks', 'Lettuce & Salad Leaves', 'Mangetout', 'Marrow', 'New Potatoes', 
            'Onions', 'Pak Choi', 'Parsnips', 'Peas', 'Peppers', 'Potatoes (Maincrop)', 'Pumpkin', 
            'Purple Sprouting Broccoli', 'Radishes', 'Rocket', 'Runner Beans', 'Salsify', 
            'Samphire', 'Shallots', 'Spinach', 'Spring Onions', 'Swede', 'Sweetcorn', 'Tomatoes', 
            'Truffles (Black)', 'Truffles (White)', 'Turnips', 'Watercress', 'Wild Mushrooms', 
            'Wild Nettles'
        ],
        'Fruit': [
            'Apples', 'Apricots', 'Bananas (Windward)', 'Bilberries', 'Blackberries', 
            'Blood Oranges', 'Blueberries', 'Cherries', 'Clementines', 'Cranberries', 
            'Damsons', 'Elderberries', 'Figs', 'Gooseberries', 'Grapes', 'Greengages', 
            'Kiwi Fruit', 'Lemons', 'Loganberries', 'Medlar', 'Melons', 'Nectarines', 
            'Oranges', 'Passion Fruit', 'Peaches', 'Pears', 'Pineapple', 'Plums', 
            'Pomegranate', 'Quince', 'Raspberries', 'Redcurrants', 'Rhubarb', 'Satsumas', 
            'Strawberries', 'Tangerines'
        ],
        'Seafood': [
            'Clams', 'Cockles', 'Cod', 'Coley', 'Crab', 'Dab', 'Dover Sole', 'Grey Mullet', 
            'Gurnard', 'Haddock', 'Hake', 'Halibut', 'Herring', 'Langoustine', 'Lemon Sole', 
            'Lobster', 'Mackerel', 'Monkfish', 'Mussels', 'Oysters', 'Pilchard', 'Plaice', 
            'Pollack', 'Prawns', 'Red Mullet', 'Salmon', 'Sardines', 'Scallops (Queen)', 
            'Sea Bass (Wild)', 'Sea Bream', 'Sea Trout', 'Shrimp', 'Skate', 'Squid', 
            'Turbot', 'Whelks', 'Whitebait', 'Winkles'
        ],
        'Meat & Game': [
            'Beef', 'Duck', 'Goose', 'Grouse', 'Guinea Fowl', 'Hare', 'Lamb', 'Mallard', 
            'Partridge', 'Pheasant', 'Rabbit', 'Turkey', 'Venison', 'Wood Pigeon'
        ],
        'Herbs & Nuts': [
            'Almonds', 'Basil', 'Brazil Nuts', 'Chervil', 'Chestnuts', 'Chives', 'Cob Nuts', 
            'Coriander', 'Dill', 'Elderflowers', 'Hazelnuts', 'Mint', 'Nasturtium', 'Oregano', 
            'Parsley (Curly)', 'Parsley (Flat-Leafed)', 'Rosemary', 'Sage', 'Sorrel', 
            'Tarragon', 'Thyme', 'Walnuts'
        ]
    };

    function determineCategory(item) {
        for (const [category, items] of Object.entries(categoryMap)) {
            if (items.includes(item)) return category;
        }
        return 'Vegetables & Fungi';
    }

    const groupedData = {};
    sanitisedFoods.forEach(food => {
        const category = determineCategory(food);
        if (!groupedData[category]) groupedData[category] = [];
        groupedData[category].push(food);
    });

    const categoryOrder = ['Vegetables & Fungi', 'Fruit', 'Seafood', 'Meat & Game', 'Herbs & Nuts'];

    categoryOrder.forEach(category => {
        if (groupedData[category] && groupedData[category].length > 0) {
            const details = document.createElement('details');
            
            const summary = document.createElement('summary');
            summary.textContent = category;
            details.appendChild(summary);

            const listWrapper = document.createElement('div');
            listWrapper.className = 'category-list';

            groupedData[category].forEach(food => {
                const itemDiv = document.createElement('div');
                itemDiv.className = 'food-item';
                itemDiv.dataset.name = food.toLowerCase(); 

                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.id = food;
                checkbox.value = food;
                checkbox.checked = storedChecked.includes(food);
                checkbox.addEventListener('change', handleCheckboxChange);

                const label = document.createElement('label');
                label.htmlFor = food;
                label.textContent = food;

                itemDiv.appendChild(checkbox);
                itemDiv.appendChild(label);
                listWrapper.appendChild(itemDiv);
            });
            
            details.appendChild(listWrapper);
            foodListContainer.appendChild(details);
        }
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
    const checkedCount = document.querySelectorAll('input[type="checkbox"]:checked').length;
    
    let percentage = 0;
    if (totalFoods > 0) {
        percentage = Math.round((checkedCount / totalFoods) * 100);
    }

    localStorage.setItem('currentPercentage', percentage);
    progressText.textContent = `${percentage}%`;

    const hue = (percentage / 100) * 120;
    const gradientColour = `hsl(${hue}, 80%, 45%)`;
    
    progressCircle.style.background = `conic-gradient(${gradientColour} ${percentage}%, #e5e7eb ${percentage}%)`;
}

function setupSearch() {
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const foodItems = document.querySelectorAll('.food-item');
        const detailsElements = document.querySelectorAll('details');

        foodItems.forEach(item => {
            if (item.dataset.name.includes(searchTerm)) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });

        if (searchTerm.length > 0) {
            detailsElements.forEach(detail => detail.setAttribute('open', ''));
        } else {
            detailsElements.forEach(detail => detail.removeAttribute('open'));
        }
    });
}

initialise();