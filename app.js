// ====================================
// DOM ELEMENT REFERENCES
// ====================================
const formFields = document.getElementById('form-fields');
const workoutForm = document.getElementById('workout-form');
const workoutHistoryEl = document.getElementById('workout-history');
const workoutStatsEl = document.getElementById('workout-stats');
const tabs = document.querySelectorAll('.tab');
const views = document.querySelectorAll('.view-content');

// Timer Elements
const timerDisplay = document.getElementById('timer-display');
const increaseTimerBtn = document.getElementById('increase-timer');
const decreaseTimerBtn = document.getElementById('decrease-timer');

// ====================================
// STATE VARIABLES
// ====================================
// Get workouts from localStorage or initialize empty array
let workouts = JSON.parse(localStorage.getItem('workouts')) || [];

// Timer variables
let timerSeconds = 120; // 2 minutes default
let timerInterval;
let timerRunning = false;

// Variable to track exercise count
let exerciseCount = 1;

// ====================================
// TIMER FUNCTIONS
// ====================================
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

function updateTimerDisplay() {
    timerDisplay.textContent = formatTime(timerSeconds);
}

function startTimer() {
    if (timerRunning) return;
    
    timerRunning = true;
    timerDisplay.classList.add('timer-running');
    
    timerInterval = setInterval(() => {
        timerSeconds--;
        updateTimerDisplay();
        
        if (timerSeconds <= 0) {
            clearInterval(timerInterval);
            timerRunning = false;
            timerDisplay.classList.remove('timer-running');
            timerDisplay.classList.add('timer-finished');
        }
    }, 1000);
}

function resetTimer() {
    clearInterval(timerInterval);
    timerRunning = false;
    timerDisplay.classList.remove('timer-running');
    timerDisplay.classList.remove('timer-finished');
    updateTimerDisplay();
}

function increaseTimer() {
    if (timerRunning) return;
    timerSeconds += 30;
    timerDisplay.classList.remove('timer-finished');
    updateTimerDisplay();
}

function decreaseTimer() {
    if (timerRunning) return;
    timerSeconds = Math.max(30, timerSeconds - 30);
    timerDisplay.classList.remove('timer-finished');
    updateTimerDisplay();
}

// ====================================
// VIEW MANAGEMENT FUNCTIONS
// ====================================
function switchTab(e) {
    const clickedTab = e.target;
    const tabView = clickedTab.dataset.view;
    
    // Update active tab
    tabs.forEach(tab => {
        tab.classList.remove('active');
    });
    clickedTab.classList.add('active');
    
    // Show corresponding view
    views.forEach(view => {
        view.classList.add('hidden');
    });
    document.getElementById(`${tabView}-view`).classList.remove('hidden');
    
    // Update data if needed
    if (tabView === 'history') {
        showWorkoutHistory();
    } else if (tabView === 'stats') {
        showWorkoutStats();
    }
}

// ====================================
// FORM SETUP & TYPE FIELDS FUNCTIONS
// ====================================
function setupForm() {
    formFields.innerHTML = `
        <label for="workout-date">Date</label>
        <input type="date" id="workout-date" required>
        
        <label for="workout-type">Workout Type</label>
        <select id="workout-type">
            <option value="strength">Strength Training</option>
            <option value="walking">Walking</option>
            <option value="hiit">HIIT</option>
            <option value="yoga">Yoga</option>
        </select>
        
        <div id="type-fields"></div>
    `;
    
    // Set today's date as default
    document.getElementById('workout-date').valueAsDate = new Date();
    
    // Add event listener for workout type changes
    const workoutTypeSelect = document.getElementById('workout-type');
    workoutTypeSelect.addEventListener('change', updateTypeFields);
    
    // Initialize type fields
    updateTypeFields();
}

function updateTypeFields() {
    const workoutType = document.getElementById('workout-type').value;
    const typeFields = document.getElementById('type-fields');
    
    // Clear existing fields
    typeFields.innerHTML = '';
    
    // Load appropriate fields based on workout type
    switch (workoutType) {
        case 'strength':
            setupStrengthFields(typeFields);
            break;
        case 'walking':
            setupWalkingFields(typeFields);
            break;
        case 'hiit':
            setupHiitFields(typeFields);
            break;
        case 'yoga':
            setupYogaFields(typeFields);
            break;
    }
}

// Helper functions for specific workout type fields
function setupStrengthFields(container) {
    container.innerHTML = `
        <label for="workout-plan">Workout Plan</label>
        <select id="workout-plan">
            <option value="A">Workout A</option>
            <option value="B">Workout B</option>
            <option value="C">Workout C</option>
            <option value="D">Workout D</option>
        </select>
        
        <div id="exercises-container">
            <button type="button" id="add-exercise">Add Exercise</button>
        </div>
    `;
    
    // Add event listener for the "Add Exercise" button
    const addExerciseBtn = document.getElementById('add-exercise');
    if (addExerciseBtn) {
        addExerciseBtn.addEventListener('click', addExerciseField);
        
        // Load workout plan if available
        const workoutPlanSelect = document.getElementById('workout-plan');
        workoutPlanSelect.addEventListener('change', loadWorkoutPlan);
        
        // Initially load the first workout plan
        loadWorkoutPlan();
    }
}

function setupWalkingFields(container) {
    container.innerHTML = `
        <label for="distance">Distance (miles)</label>
        <input type="number" id="distance" step="0.1" required>
        
        <label for="duration">Duration (minutes)</label>
        <input type="number" id="duration" required>
        
        <label for="pace">Average Pace (minutes/mile)</label>
        <input type="number" id="pace" step="0.1">

        <label for="heart-rate">Average Heart Rate (BPM)</label>
        <input type="number" id="heart-rate">
    `;
}

function setupHiitFields(container) {
    container.innerHTML = `
        <label for="hiit-type">HIIT Type</label>
        <select id="hiit-type">
            <option value="Stationary Bike">Stationary Bike</option>
            <option value="Run">Run</option>
            <option value="Other">Other</option>
        </select>
        
        <div id="hiit-type-other" class="hidden">
            <label for="hiit-type-custom">Specify HIIT Type</label>
            <input type="text" id="hiit-type-custom">
        </div>
        
        <label for="intervals">Number of Intervals</label>
        <input type="number" id="intervals" required>
        
        <label for="work-time">Work Time (minutes)</label>
        <input type="number" id="work-time" step="0.1" required>
        
        <label for="rest-time">Rest Time (minutes)</label>
        <input type="number" id="rest-time" step="0.1" required>
        
        <label for="heart-rate">Average Heart Rate (BPM)</label>
        <input type="number" id="heart-rate">
        
        <div id="hiit-run-fields" class="hidden">
            <label for="hiit-distance">Distance (miles)</label>
            <input type="number" id="hiit-distance" step="0.01">
            
            <label for="work-pace">Work Pace (minutes/mile)</label>
            <input type="number" id="work-pace" step="0.1">
            
            <label for="rest-pace">Rest Pace (minutes/mile)</label>
            <input type="number" id="rest-pace" step="0.1">
            
            <label for="avg-pace">Average Pace (minutes/mile)</label>
            <input type="number" id="avg-pace" step="0.01" readonly>
        </div>
        
        <label for="total-duration">Total Duration (minutes)</label>
        <input type="number" id="total-duration" required>
    `;
    
    // Add event listeners for HIIT type changes
    const hiitTypeSelect = document.getElementById('hiit-type');
    hiitTypeSelect.addEventListener('change', function() {
        const hiitTypeOther = document.getElementById('hiit-type-other');
        const hiitRunFields = document.getElementById('hiit-run-fields');
        
        // Show/hide "Other" input field
        if (this.value === 'other') {
            hiitTypeOther.classList.remove('hidden');
        } else {
            hiitTypeOther.classList.add('hidden');
        }
        
        // Show/hide Run-specific fields
        if (this.value === 'run') {
            hiitRunFields.classList.remove('hidden');
            setupHiitRunFieldsListeners();
        } else {
            hiitRunFields.classList.add('hidden');
        }
    });
}

function setupHiitRunFieldsListeners() {
    // Add event listeners to calculate average pace
    const intervalsInput = document.getElementById('intervals');
    const workTimeInput = document.getElementById('work-time');
    const restTimeInput = document.getElementById('rest-time');
    const distanceInput = document.getElementById('hiit-distance');
    const workPaceInput = document.getElementById('work-pace');
    const restPaceInput = document.getElementById('rest-pace');
    const avgPaceInput = document.getElementById('avg-pace');
    const totalDurationInput = document.getElementById('total-duration');
    
    const calculateAvgPace = function() {
        const distance = parseFloat(distanceInput.value) || 0;
        const totalDuration = parseFloat(totalDurationInput.value) || 0;
        
        // Only calculate if we have the minimum required values
        if (distance > 0 && totalDuration > 0) {
            // Calculate average pace based on total duration and distance
            const avgPace = totalDuration / distance;
            avgPaceInput.value = avgPace.toFixed(2);
        } else {
            avgPaceInput.value = '';
        }
    };
    
    // Add change event listeners to all inputs that affect average pace
    intervalsInput.addEventListener('input', calculateAvgPace);
    workTimeInput.addEventListener('input', calculateAvgPace);
    restTimeInput.addEventListener('input', calculateAvgPace);
    distanceInput.addEventListener('input', calculateAvgPace);
    workPaceInput.addEventListener('input', calculateAvgPace);
    restPaceInput.addEventListener('input', calculateAvgPace);
    totalDurationInput.addEventListener('input', calculateAvgPace);
}

function setupYogaFields(container) {
    container.innerHTML = `
        <label for="style">Style</label>
        <input type="text" id="style" required>
        
        <label for="poses">Number of Poses (optional)</label>
        <input type="number" id="poses">
        
        <label for="yoga-duration">Duration (minutes)</label>
        <input type="number" id="yoga-duration" required>
    `;
}

// ====================================
// STRENGTH WORKOUT FUNCTIONS
// ====================================
function addExerciseField() {
    exerciseCount++;
    
    const exercisesContainer = document.getElementById('exercises-container');
    const newExercise = document.createElement('div');
    newExercise.className = 'exercise-item';
    
    newExercise.innerHTML = `
        <label for="exercise-${exerciseCount}">Exercise ${exerciseCount}</label>
        <input type="text" id="exercise-${exerciseCount}" placeholder="e.g., Squat" required>
        
        <div id="sets-container-${exerciseCount}" class="sets-container">
            <!-- Sets will be added here dynamically -->
        </div>
        
        <button type="button" class="add-set" data-exercise="${exerciseCount}">Add Set</button>
        <button type="button" class="remove-exercise" data-id="${exerciseCount}">Remove Exercise</button>
    `;
    
    // Insert the new exercise before the "Add Exercise" button
    exercisesContainer.insertBefore(newExercise, document.getElementById('add-exercise'));
    
    // Add event listener to the remove button
    const removeBtn = newExercise.querySelector('.remove-exercise');
    removeBtn.addEventListener('click', function() {
        exercisesContainer.removeChild(newExercise);
    });
    
    // Add event listener to the add set button
    const addSetBtn = newExercise.querySelector('.add-set');
    addSetBtn.addEventListener('click', function() {
        addSetField(this.dataset.exercise);
    });
    
    // Add first set automatically
    addSetField(exerciseCount);
}

function addSetField(exerciseId) {
    const setsContainer = document.getElementById(`sets-container-${exerciseId}`);
    const setCount = setsContainer.children.length + 1;
    
    const newSet = document.createElement('div');
    newSet.className = 'set-item';
    
    newSet.innerHTML = `
        <div class="set-header">
            <span>Set ${setCount}</span>
            ${setCount > 1 ? '<button type="button" class="remove-set">Remove</button>' : ''}
        </div>
        <div class="set-inputs">
            <div>
                <label for="weight-${exerciseId}-${setCount}">Weight (lbs)</label>
                <input type="number" id="weight-${exerciseId}-${setCount}" step="any" required>
            </div>
            <div>
                <label for="reps-${exerciseId}-${setCount}">Reps</label>
                <input type="number" id="reps-${exerciseId}-${setCount}" required>
            </div>
        </div>
    `;
    
    setsContainer.appendChild(newSet);
    
    // Add event listener to the remove set button
    if (setCount > 1) {
        const removeSetBtn = newSet.querySelector('.remove-set');
        removeSetBtn.addEventListener('click', function() {
            setsContainer.removeChild(newSet);
            // Update set numbers
            updateSetNumbers(setsContainer);
        });
    }
}

function updateSetNumbers(setsContainer) {
    const setItems = setsContainer.querySelectorAll('.set-item');
    setItems.forEach((item, index) => {
        const setNumber = index + 1;
        item.querySelector('.set-header span').textContent = `Set ${setNumber}`;
    });
}

function loadWorkoutPlan() {
    const workoutPlan = document.getElementById('workout-plan').value;
    
    // Reset the exercise count
    exerciseCount = 0;
    
    // Clear existing exercises
    const exercisesContainer = document.getElementById('exercises-container');
    
    // Keep only the add button
    exercisesContainer.innerHTML = `
        <button type="button" id="add-exercise">Add Exercise</button>
    `;
    
    // Re-add event listener to the add button
    document.getElementById('add-exercise').addEventListener('click', addExerciseField);
    
    // Get workout data from localStorage
    const workoutPlans = JSON.parse(localStorage.getItem('workoutPlans')) || {};
    const planData = workoutPlans[workoutPlan] || [];
    
    if (planData.length > 0) {
        // Create exercise fields for each exercise in the plan
        planData.forEach(exercise => {
            exerciseCount++;
            createExerciseFromPlan(exercisesContainer, exercise, exerciseCount);
        });
    } else {
        // Add a default empty exercise field
        addExerciseField();
    }
}

function createExerciseFromPlan(container, exercise, exerciseId) {
    const newExercise = document.createElement('div');
    newExercise.className = 'exercise-item';
    
    newExercise.innerHTML = `
        <label for="exercise-${exerciseId}">Exercise ${exerciseId}</label>
        <input type="text" id="exercise-${exerciseId}" value="${exercise.name}" placeholder="e.g., Bench Press" required>
        
        <div id="sets-container-${exerciseId}" class="sets-container">
            <!-- Sets will be added here dynamically -->
        </div>
        
        <button type="button" class="add-set" data-exercise="${exerciseId}">Add Set</button>
        <button type="button" class="remove-exercise" data-id="${exerciseId}">Remove Exercise</button>
        
        <div class="previous-data">
            <p>Previous: ${exercise.sets ? exercise.sets.length : 0} sets</p>
        </div>
    `;
    
    // Insert the new exercise before the "Add Exercise" button
    container.insertBefore(newExercise, document.getElementById('add-exercise'));
    
    // Add event listener to the remove button
    const removeBtn = newExercise.querySelector('.remove-exercise');
    removeBtn.addEventListener('click', function() {
        container.removeChild(newExercise);
    });
    
    // Add event listener to the add set button
    const addSetBtn = newExercise.querySelector('.add-set');
    addSetBtn.addEventListener('click', function() {
        addSetField(this.dataset.exercise);
    });
    
    // Add saved sets or default set
    const setData = exercise.sets || [];
    if (setData.length > 0) {
        createSetsFromPlan(exerciseId, setData);
    } else {
        // Add first set automatically
        addSetField(exerciseId);
    }
}

function createSetsFromPlan(exerciseId, setData) {
    const setsContainer = document.getElementById(`sets-container-${exerciseId}`);
    
    setData.forEach((set, setIndex) => {
        const setCount = setIndex + 1;
        
        const newSet = document.createElement('div');
        newSet.className = 'set-item';
        
        newSet.innerHTML = `
            <div class="set-header">
                <span>Set ${setCount}</span>
                ${setCount > 1 ? '<button type="button" class="remove-set">Remove</button>' : ''}
            </div>
            <div class="set-inputs">
                <div>
                    <label for="weight-${exerciseId}-${setCount}">Weight (lbs)</label>
                    <input type="number" id="weight-${exerciseId}-${setCount}" value="${set.weight}" step="any" required>
                </div>
                <div>
                    <label for="reps-${exerciseId}-${setCount}">Reps</label>
                    <input type="number" id="reps-${exerciseId}-${setCount}" value="${set.reps}" required>
                </div>
            </div>
        `;
        
        setsContainer.appendChild(newSet);
        
        // Add event listener to the remove set button
        if (setCount > 1) {
            const removeSetBtn = newSet.querySelector('.remove-set');
            removeSetBtn.addEventListener('click', function() {
                setsContainer.removeChild(newSet);
                // Update set numbers
                updateSetNumbers(setsContainer);
            });
        }
    });
}

// ====================================
// DATA MANAGEMENT FUNCTIONS
// ====================================
function saveWorkout(e) {
    e.preventDefault();
    
    const date = document.getElementById('workout-date').value;
    const type = document.getElementById('workout-type').value;
    let data = {};
    
    // Get type-specific data
    switch (type) {
        case 'strength':
            data = collectStrengthData();
            break;
        case 'walking':
            data = collectWalkingData();
            break;
        case 'hiit':
            data = collectHiitData();
            break;
        case 'yoga':
            data = collectYogaData();
            break;
    }
    
    // Create workout object
    const workout = {
        id: Date.now(),
        date,
        type,
        data
    };
    
    // Add to workouts array
    workouts.push(workout);
    
    // Save to localStorage
    localStorage.setItem('workouts', JSON.stringify(workouts));

    // Reset form
    workoutForm.reset();
    document.getElementById('workout-date').valueAsDate = new Date();
    updateTypeFields();
    
    // Update views
    showWorkoutHistory();
    showWorkoutStats();
    
    alert('Workout saved!');
}

function collectStrengthData() {
    const workoutPlan = document.getElementById('workout-plan').value;
    const exerciseItems = document.querySelectorAll('.exercise-item');
    
    // Prepare array to store exercises for this workout
    const exercises = [];
    
    // Process each exercise
    exerciseItems.forEach(item => {
        const exerciseId = item.querySelector('input[id^="exercise-"]').id.split('-')[1];
        const exerciseName = document.getElementById(`exercise-${exerciseId}`).value;
        
        // Get sets data
        const setsContainer = document.getElementById(`sets-container-${exerciseId}`);
        const setItems = setsContainer.querySelectorAll('.set-item');
        
        const sets = [];
        setItems.forEach((setItem, setIndex) => {
            const setNumber = setIndex + 1;
            const weight = document.getElementById(`weight-${exerciseId}-${setNumber}`).value;
            const reps = document.getElementById(`reps-${exerciseId}-${setNumber}`).value;
            
            sets.push({
                weight,
                reps
            });
        });
        
        exercises.push({
            name: exerciseName,
            sets: sets
        });
    });
    
    // Update workout plans in localStorage
    const workoutPlans = JSON.parse(localStorage.getItem('workoutPlans')) || {};
    
    // Update each exercise with the latest data
    workoutPlans[workoutPlan] = exercises.map(exercise => ({
        name: exercise.name,
        sets: exercise.sets
    }));
    
    localStorage.setItem('workoutPlans', JSON.stringify(workoutPlans));
    
    return {
        plan: workoutPlan,
        exercises: exercises
    };
}

function collectWalkingData() {
    return {
        distance: document.getElementById('distance').value,
        duration: document.getElementById('duration').value,
        pace: document.getElementById('pace').value,
        heartRate: document.getElementById('heart-rate').value || 'N/A'
    };
}

function collectHiitData() {
    const hiitType = document.getElementById('hiit-type').value;

    // Get the HIIT type value (either from dropdown or custom input)
    let typeValue = hiitType === 'other' ? document.getElementById('hiit-type-custom').value : hiitType;
    
    // Capitalize first letter
    typeValue = typeValue.charAt(0).toUpperCase() + typeValue.slice(1);

    const data = {
        hiitType: typeValue,  // Use the capitalized value
        intervals: document.getElementById('intervals').value,
        workTime: document.getElementById('work-time').value,
        restTime: document.getElementById('rest-time').value,
        heartRate: document.getElementById('heart-rate').value || 'N/A',
        totalDuration: document.getElementById('total-duration').value
    };
    
    // Add run-specific data if applicable
    if (hiitType === 'Run') {
        data.distance = document.getElementById('hiit-distance').value || 'N/A';
        data.workPace = document.getElementById('work-pace').value || 'N/A';
        data.restPace = document.getElementById('rest-pace').value || 'N/A';
        data.avgPace = document.getElementById('avg-pace').value || 'N/A';
    }
    
    return data;
}

function collectYogaData() {
    return {
        style: document.getElementById('style').value,
        poses: document.getElementById('poses').value || 'N/A',
        duration: document.getElementById('yoga-duration').value
    };
}

function deleteWorkout(id) {
    workouts = workouts.filter(workout => workout.id !== id);
    localStorage.setItem('workouts', JSON.stringify(workouts));
    showWorkoutHistory();
    showWorkoutStats();
}

// ====================================
// WORKOUT DISPLAY FUNCTIONS
// ====================================
function showWorkoutHistory() {
    // Ensure we have the latest data from localStorage
    workouts = JSON.parse(localStorage.getItem('workouts')) || [];

    if (workouts.length === 0) {
        workoutHistoryEl.innerHTML = '<p>No workouts recorded yet.</p>';
        return;
    }
    
    // Sort by date (newest first)
    const sortedWorkouts = [...workouts].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    let html = '';
    sortedWorkouts.forEach(workout => {
        html += `
            <div class="workout-item">
                <p>
                    <span class="workout-type ${workout.type}">${workout.type}</span>
                    <span>${workout.date}</span>
                    <button onclick="deleteWorkout(${workout.id})">Delete</button>
                </p>
                <p>${formatWorkoutData(workout.type, workout.data)}</p>
            </div>
        `;
    });
    
    workoutHistoryEl.innerHTML = html;
}

function formatWorkoutData(type, data) {
    if (!data) return 'No data available';
    
    switch(type) {
        case 'strength':
            return formatStrengthData(data);
        case 'walking':
            return formatWalkingData(data);
        case 'hiit':
            return formatHiitData(data);
        case 'yoga':
            return formatYogaData(data);
        default:
            return 'Unknown workout type';
    }
}

function formatStrengthData(data) {
    // Check if data has required properties
    if (!data.plan || !data.exercises) {
        return 'Invalid strength data';
    }
    
    let strengthDetails = `Plan: ${data.plan}<br>`;
    data.exercises.forEach((exercise, index) => {
        strengthDetails += `${index + 1}. ${exercise.name}:<br>`;
        if (exercise.sets && Array.isArray(exercise.sets)) {
            exercise.sets.forEach((set, setIndex) => {
                strengthDetails += `&nbsp;&nbsp;&nbsp;Set ${setIndex + 1}: ${set.weight} lbs × ${set.reps} reps<br>`;
            });
        } else {
            strengthDetails += `&nbsp;&nbsp;&nbsp;No sets recorded<br>`;
        }
    });
    return strengthDetails;
}

function formatWalkingData(data) {
    if (!data.distance || !data.duration) {
        return 'Invalid walking data';
    }
    return `Distance: ${data.distance} miles, Duration: ${data.duration} min, Pace: ${data.pace || 'N/A'} min/mile, HR: ${data.heartRate || 'N/A'} BPM`;
}

function formatHiitData(data) {
    if (!data.intervals || !data.workTime || !data.restTime) {
        return 'Invalid HIIT data';
    }
    
    let hiitDetails = `Type: ${data.hiitType || 'Unknown'}, Intervals: ${data.intervals}, Work: ${data.workTime} min, Rest: ${data.restTime} min`;

    if (data.heartRate && data.heartRate !== 'N/A') {
        hiitDetails += `, HR: ${data.heartRate} BPM`;
    }
    
    if (data.distance) {
        hiitDetails += `, Distance: ${data.distance} miles, Avg Pace: ${data.avgPace || 'N/A'} min/mile`;
    }
    
    hiitDetails += `, Total: ${data.totalDuration || 'Unknown'} min`;
    return hiitDetails;
}

function formatYogaData(data) {
    if (!data.style || !data.duration) {
        return 'Invalid yoga data';
    }
    return `Style: ${data.style}, Poses: ${data.poses || 'N/A'}, Duration: ${data.duration} min`;
}

// ====================================
// STATISTICS AND VISUALIZATION FUNCTIONS
// ====================================
function showWorkoutStats() {
    // Ensure we have the latest data from localStorage
    workouts = JSON.parse(localStorage.getItem('workouts')) || [];
    
    if (workouts.length === 0) {
        workoutStatsEl.innerHTML = '<p>No workouts recorded yet.</p>';
        return;
    }
    
    let statsHtml = '';
    
    // Add workout type distribution
    statsHtml += generateWorkoutTypeDistribution();
    
    // Add walking progress cards if there are walking workouts
    const walkingWorkouts = workouts.filter(w => w.type === 'walking');
    if (walkingWorkouts.length > 0) {
        statsHtml += generateProgressCards(walkingWorkouts);
    }
    
    // Add HIIT progress cards if there are HIIT workouts
    const hiitWorkouts = workouts.filter(w => w.type === 'hiit');
    if (hiitWorkouts.length > 0) {
        statsHtml += generateHiitProgressCards(hiitWorkouts);
    }
    
    // Add yoga progress cards if there are yoga workouts
    const yogaWorkouts = workouts.filter(w => w.type === 'yoga');
    if (yogaWorkouts.length > 0) {
        statsHtml += generateYogaProgressCards(yogaWorkouts);
    }
    
    workoutStatsEl.innerHTML = statsHtml;
}

function generateWorkoutTypeDistribution() {
    // Count workouts by type
    const counts = {
        strength: workouts.filter(w => w.type === 'strength').length,
        walking: workouts.filter(w => w.type === 'walking').length,
        hiit: workouts.filter(w => w.type === 'hiit').length,
        yoga: workouts.filter(w => w.type === 'yoga').length
    };
    
    // Always use stat cards for consistency
    return `
        <h3>Workout Type Distribution</h3>
        <div class="stat-cards">
            ${Object.entries(counts).map(([type, count]) => `
                <div class="stat-card ${type}">
                    <div class="stat-count">${count}</div>
                    <div class="stat-label">${type}</div>
                </div>
            `).join('')}
        </div>
    `;
}



// Helper functions for chart generation

function generateProgressCards(walkingWorkouts) {
    // Group by month
    const monthlyData = {};
    
    walkingWorkouts.forEach(workout => {
        const date = new Date(workout.date);
        const yearMonth = `${date.getFullYear()}-${date.getMonth() + 1}`;
        
        if (!monthlyData[yearMonth]) {
            monthlyData[yearMonth] = {
                totalDistance: 0,
                totalDuration: 0,
                workoutCount: 0,
                paces: [],
                month: date.toLocaleString('default', { month: 'long' }),
                year: date.getFullYear()
            };
        }
        
        const distance = parseFloat(workout.data.distance || 0);
        const duration = parseFloat(workout.data.duration || 0);
        
        monthlyData[yearMonth].totalDistance += distance;
        monthlyData[yearMonth].totalDuration += duration;
        monthlyData[yearMonth].workoutCount++;
        
        if (distance > 0 && duration > 0) {
            monthlyData[yearMonth].paces.push(duration / distance);
        }
    });
    
    // Sort months by date
    const sortedMonths = Object.keys(monthlyData).sort();
    
    // Need at least 2 months of data for comparison
    if (sortedMonths.length < 2) {
        return `
            <div class="walking-progress">
                <h3>Walking Progress Summary</h3>
                <p>Need at least 2 months of data for comparison.</p>
            </div>
        `;
    }
    
    // Get current and previous month data
    const currentMonthKey = sortedMonths[sortedMonths.length - 1];
    const previousMonthKey = sortedMonths[sortedMonths.length - 2];
    
    const currentMonth = monthlyData[currentMonthKey];
    const previousMonth = monthlyData[previousMonthKey];
    
    // Calculate metrics and comparisons
    const currentDistance = currentMonth.totalDistance;
    const previousDistance = previousMonth ? previousMonth.totalDistance : 0;
    const distanceDiff = currentDistance - previousDistance;
    
    const currentAvgDistance = currentDistance / currentMonth.workoutCount;
    const previousAvgDistance = previousMonth ? 
        previousMonth.totalDistance / previousMonth.workoutCount : 0;
    const avgDistanceDiff = currentAvgDistance - previousAvgDistance;
    
    const currentAvgPace = currentMonth.paces.length ? 
        currentMonth.paces.reduce((sum, pace) => sum + pace, 0) / currentMonth.paces.length : 0;
    const previousAvgPace = previousMonth && previousMonth.paces.length ? 
        previousMonth.paces.reduce((sum, pace) => sum + pace, 0) / previousMonth.paces.length : 0;
    const paceDiff = previousAvgPace - currentAvgPace; // Negative means getting slower
    
    const workoutDiff = currentMonth.workoutCount - (previousMonth ? previousMonth.workoutCount : 0);
    
    return `
        <div class="walking-progress">
            <h3>Walking Progress Summary</h3>
            <div class="progress-cards">
                <div class="progress-card">
                    <div class="progress-title">This Month</div>
                    <div class="progress-value">${currentDistance.toFixed(1)} miles</div>
                    <div class="progress-comparison ${distanceDiff >= 0 ? 'positive' : 'negative'}">
                        <span class="arrow">${distanceDiff >= 0 ? '↑' : '↓'}</span> 
                        ${Math.abs(distanceDiff).toFixed(1)} miles ${distanceDiff >= 0 ? 'from' : 'below'} last month
                    </div>
                </div>
                
                <div class="progress-card">
                    <div class="progress-title">Avg. Distance</div>
                    <div class="progress-value">${currentAvgDistance.toFixed(1)} miles</div>
                    <div class="progress-comparison ${avgDistanceDiff >= 0 ? 'positive' : 'negative'}">
                        <span class="arrow">${avgDistanceDiff >= 0 ? '↑' : '↓'}</span> 
                        ${Math.abs(avgDistanceDiff).toFixed(1)} miles ${avgDistanceDiff >= 0 ? 'from' : 'below'} last month
                    </div>
                </div>
                
                <div class="progress-card">
                    <div class="progress-title">Avg. Pace</div>
                    <div class="progress-value">${currentAvgPace.toFixed(1)} min/mi</div>
                    <div class="progress-comparison ${paceDiff >= 0 ? 'positive' : 'negative'}">
                        <span class="arrow">${paceDiff >= 0 ? '↑' : '↓'}</span> 
                        ${Math.abs(paceDiff).toFixed(1)} min ${paceDiff >= 0 ? 'faster' : 'slower'} than last month
                    </div>
                </div>
                
                <div class="progress-card">
                    <div class="progress-title">Total Workouts</div>
                    <div class="progress-value">${currentMonth.workoutCount}</div>
                    <div class="progress-comparison ${workoutDiff >= 0 ? 'positive' : 'negative'}">
                        <span class="arrow">${workoutDiff >= 0 ? '↑' : '↓'}</span> 
                        ${Math.abs(workoutDiff)} ${workoutDiff >= 0 ? 'more' : 'fewer'} than last month
                    </div>
                </div>
            </div>
        </div>
    `;
}

function generateHiitProgressCards(hiitWorkouts) {
    // Group by month
    const monthlyData = {};
    
    hiitWorkouts.forEach(workout => {
        const date = new Date(workout.date);
        const yearMonth = `${date.getFullYear()}-${date.getMonth() + 1}`;
        const hiitType = workout.data.hiitType || 'unknown';
        
        if (!monthlyData[yearMonth]) {
            monthlyData[yearMonth] = {
                workoutCount: 0,
                totalDuration: 0,
                avgIntervals: 0,
                totalIntervals: 0,
                avgWorkTime: 0,
                avgRestTime: 0,
                avgHeartRate: 0,
                validHeartRateCount: 0,
                workoutsByType: {},
                month: date.toLocaleString('default', { month: 'long' }),
                year: date.getFullYear()
            };
        }
        
        // Count by HIIT type
        if (!monthlyData[yearMonth].workoutsByType[hiitType]) {
            monthlyData[yearMonth].workoutsByType[hiitType] = 0;
        }
        monthlyData[yearMonth].workoutsByType[hiitType]++;
        
        // Accumulate general stats
        monthlyData[yearMonth].workoutCount++;
        monthlyData[yearMonth].totalDuration += parseFloat(workout.data.totalDuration || 0);
        monthlyData[yearMonth].totalIntervals += parseInt(workout.data.intervals || 0);
        monthlyData[yearMonth].avgWorkTime += parseFloat(workout.data.workTime || 0);
        monthlyData[yearMonth].avgRestTime += parseFloat(workout.data.restTime || 0);
        
        // Handle heart rate if available
        if (workout.data.heartRate && workout.data.heartRate !== 'N/A') {
            monthlyData[yearMonth].avgHeartRate += parseFloat(workout.data.heartRate);
            monthlyData[yearMonth].validHeartRateCount++;
        }
        
        // Track run-specific data if applicable
        if (hiitType === 'run' && workout.data.distance) {
            if (!monthlyData[yearMonth].runMetrics) {
                monthlyData[yearMonth].runMetrics = {
                    totalDistance: 0,
                    workoutCount: 0,
                    avgPace: 0
                };
            }
            
            monthlyData[yearMonth].runMetrics.totalDistance += parseFloat(workout.data.distance);
            monthlyData[yearMonth].runMetrics.workoutCount++;
            
            if (workout.data.avgPace && workout.data.avgPace !== 'N/A') {
                monthlyData[yearMonth].runMetrics.avgPace += parseFloat(workout.data.avgPace);
            }
        }
    });
    
    // Calculate averages for each month
    Object.keys(monthlyData).forEach(month => {
        const data = monthlyData[month];
        if (data.workoutCount > 0) {
            data.avgIntervals = data.totalIntervals / data.workoutCount;
            data.avgWorkTime = data.avgWorkTime / data.workoutCount;
            data.avgRestTime = data.avgRestTime / data.workoutCount;
            
            // Only average heart rate if we have valid readings
            if (data.validHeartRateCount > 0) {
                data.avgHeartRate = data.avgHeartRate / data.validHeartRateCount;
            } else {
                data.avgHeartRate = 0;
            }
            
            // Calculate run averages if applicable
            if (data.runMetrics && data.runMetrics.workoutCount > 0) {
                data.runMetrics.avgDistance = data.runMetrics.totalDistance / data.runMetrics.workoutCount;
                if (data.runMetrics.avgPace > 0) {
                    data.runMetrics.avgPace = data.runMetrics.avgPace / data.runMetrics.workoutCount;
                }
            }
        }
    });
    
    // Sort months by date
    const sortedMonths = Object.keys(monthlyData).sort();
    
    // Need at least 2 months of data for comparison
    if (sortedMonths.length < 2) {
        return `
            <div class="hiit-progress">
                <h3>HIIT Workout Progress</h3>
                <p>Need at least 2 months of data for comparison.</p>
            </div>
        `;
    }
    
    // Get current and previous month data
    const currentMonthKey = sortedMonths[sortedMonths.length - 1];
    const previousMonthKey = sortedMonths[sortedMonths.length - 2];
    
    const currentMonth = monthlyData[currentMonthKey];
    const previousMonth = monthlyData[previousMonthKey];
    
    // Calculate changes between months
    const workoutCountDiff = currentMonth.workoutCount - previousMonth.workoutCount;
    const avgIntervalsDiff = currentMonth.avgIntervals - previousMonth.avgIntervals;
    const avgWorkTimeDiff = currentMonth.avgWorkTime - previousMonth.avgWorkTime;
    const avgHeartRateDiff = currentMonth.avgHeartRate - previousMonth.avgHeartRate;
    
    // Format the HIIT progress cards HTML
    let hiitProgressHTML = `
        <div class="hiit-progress">
            <h3>HIIT Progress Summary</h3>
            <div class="progress-cards">
                <div class="progress-card">
                    <div class="progress-title">HIIT Sessions</div>
                    <div class="progress-value">${currentMonth.workoutCount}</div>
                    <div class="progress-comparison ${workoutCountDiff >= 0 ? 'positive' : 'negative'}">
                        <span class="arrow">${workoutCountDiff >= 0 ? '↑' : '↓'}</span> 
                        ${Math.abs(workoutCountDiff)} ${workoutCountDiff >= 0 ? 'more' : 'fewer'} than last month
                    </div>
                </div>
                
                <div class="progress-card">
                    <div class="progress-title">Avg. Intervals</div>
                    <div class="progress-value">${currentMonth.avgIntervals.toFixed(1)}</div>
                    <div class="progress-comparison ${avgIntervalsDiff >= 0 ? 'positive' : 'negative'}">
                        <span class="arrow">${avgIntervalsDiff >= 0 ? '↑' : '↓'}</span> 
                        ${Math.abs(avgIntervalsDiff).toFixed(1)} ${avgIntervalsDiff >= 0 ? 'more' : 'fewer'} than last month
                    </div>
                </div>
                
                <div class="progress-card">
                    <div class="progress-title">Avg. Work Time</div>
                    <div class="progress-value">${currentMonth.avgWorkTime.toFixed(1)} min</div>
                    <div class="progress-comparison ${avgWorkTimeDiff >= 0 ? 'positive' : 'negative'}">
                        <span class="arrow">${avgWorkTimeDiff >= 0 ? '↑' : '↓'}</span> 
                        ${Math.abs(avgWorkTimeDiff).toFixed(1)} min ${avgWorkTimeDiff >= 0 ? 'longer' : 'shorter'} than last month
                    </div>
                </div>`;
    
    // Only show heart rate if we have valid data
    if (currentMonth.avgHeartRate > 0 && previousMonth.avgHeartRate > 0) {
        hiitProgressHTML += `
                <div class="progress-card">
                    <div class="progress-title">Avg. Heart Rate</div>
                    <div class="progress-value">${currentMonth.avgHeartRate.toFixed(0)} BPM</div>
                    <div class="progress-comparison ${avgHeartRateDiff <= 0 ? 'positive' : 'negative'}">
                        <span class="arrow">${avgHeartRateDiff <= 0 ? '↓' : '↑'}</span> 
                        ${Math.abs(avgHeartRateDiff).toFixed(0)} BPM ${avgHeartRateDiff <= 0 ? 'lower' : 'higher'} than last month
                    </div>
                </div>`;
    }
    
    // Add run-specific metrics if available
    if (currentMonth.runMetrics && previousMonth.runMetrics) {
        const avgDistanceDiff = currentMonth.runMetrics.avgDistance - previousMonth.runMetrics.avgDistance;
        const avgPaceDiff = previousMonth.runMetrics.avgPace - currentMonth.runMetrics.avgPace; // Lower is better
        
        hiitProgressHTML += `
                <div class="progress-card">
                    <div class="progress-title">Run Distance (Avg)</div>
                    <div class="progress-value">${currentMonth.runMetrics.avgDistance.toFixed(2)} mi</div>
                    <div class="progress-comparison ${avgDistanceDiff >= 0 ? 'positive' : 'negative'}">
                        <span class="arrow">${avgDistanceDiff >= 0 ? '↑' : '↓'}</span> 
                        ${Math.abs(avgDistanceDiff).toFixed(2)} mi ${avgDistanceDiff >= 0 ? 'more' : 'less'} than last month
                    </div>
                </div>`;
                
        if (currentMonth.runMetrics.avgPace > 0 && previousMonth.runMetrics.avgPace > 0) {
            hiitProgressHTML += `
                <div class="progress-card">
                    <div class="progress-title">Run Pace (Avg)</div>
                    <div class="progress-value">${currentMonth.runMetrics.avgPace.toFixed(2)} min/mi</div>
                    <div class="progress-comparison ${avgPaceDiff >= 0 ? 'positive' : 'negative'}">
                        <span class="arrow">${avgPaceDiff >= 0 ? '↑' : '↓'}</span> 
                        ${Math.abs(avgPaceDiff).toFixed(2)} min/mi ${avgPaceDiff >= 0 ? 'faster' : 'slower'} than last month
                    </div>
                </div>`;
        }
    }
    
    // Add workout type breakdown
    hiitProgressHTML += `
                <div class="progress-card full-width">
                    <div class="progress-title">Workout Types</div>
                    <div class="type-breakdown">`;
    
    // Show breakdown of workout types
    Object.entries(currentMonth.workoutsByType).forEach(([type, count]) => {
        const percentage = (count / currentMonth.workoutCount * 100).toFixed(0);
        hiitProgressHTML += `
                        <div class="type-item">
                            <div class="type-label">${type}</div>
                            <div class="type-bar">
                                <div class="type-fill" style="width: ${percentage}%;">${percentage}%</div>
                            </div>
                        </div>`;
    });
    
    hiitProgressHTML += `
                    </div>
                </div>
            </div>
        </div>`;
    
    return hiitProgressHTML;
}

function generateYogaProgressCards(yogaWorkouts) {
    // Group by month
    const monthlyData = {};
    
    yogaWorkouts.forEach(workout => {
        const date = new Date(workout.date);
        const yearMonth = `${date.getFullYear()}-${date.getMonth() + 1}`;
        const style = workout.data.style || 'unknown';
        
        if (!monthlyData[yearMonth]) {
            monthlyData[yearMonth] = {
                workoutCount: 0,
                totalDuration: 0,
                styleCount: {},
                month: date.toLocaleString('default', { month: 'long' }),
                year: date.getFullYear()
            };
        }
        
        // Count by yoga style
        if (!monthlyData[yearMonth].styleCount[style]) {
            monthlyData[yearMonth].styleCount[style] = 0;
        }
        monthlyData[yearMonth].styleCount[style]++;
        
        // Accumulate general stats
        monthlyData[yearMonth].workoutCount++;
        monthlyData[yearMonth].totalDuration += parseFloat(workout.data.duration || 0);
    });
    
    // Calculate averages for each month
    Object.keys(monthlyData).forEach(month => {
        const data = monthlyData[month];
        if (data.workoutCount > 0) {
            data.avgDuration = data.totalDuration / data.workoutCount;
            
            // Find most practiced style
            let mostPracticedStyle = '';
            let maxCount = 0;
            Object.entries(data.styleCount).forEach(([style, count]) => {
                if (count > maxCount) {
                    maxCount = count;
                    mostPracticedStyle = style;
                }
            });
            data.mostPracticedStyle = mostPracticedStyle;
        }
    });
    
    // Sort months by date
    const sortedMonths = Object.keys(monthlyData).sort();
    
    // Need at least 2 months of data for comparison
    if (sortedMonths.length < 2) {
        return `
            <div class="yoga-progress">
                <h3>Yoga Practice Progress</h3>
                <p>Need at least 2 months of data for comparison.</p>
            </div>
        `;
    }
    
    // Get current and previous month data
    const currentMonthKey = sortedMonths[sortedMonths.length - 1];
    const previousMonthKey = sortedMonths[sortedMonths.length - 2];
    
    const currentMonth = monthlyData[currentMonthKey];
    const previousMonth = monthlyData[previousMonthKey];
    
    // Calculate changes between months
    const workoutCountDiff = currentMonth.workoutCount - previousMonth.workoutCount;
    const totalDurationDiff = currentMonth.totalDuration - previousMonth.totalDuration;
    const avgDurationDiff = currentMonth.avgDuration - previousMonth.avgDuration;
    
    // Format the yoga progress cards HTML
    let yogaProgressHTML = `
        <div class="yoga-progress">
            <h3>Yoga Progress Summary</h3>
            <div class="progress-cards">
                <div class="progress-card">
                    <div class="progress-title">Yoga Sessions</div>
                    <div class="progress-value">${currentMonth.workoutCount}</div>
                    <div class="progress-comparison ${workoutCountDiff >= 0 ? 'positive' : 'negative'}">
                        <span class="arrow">${workoutCountDiff >= 0 ? '↑' : '↓'}</span> 
                        ${Math.abs(workoutCountDiff)} ${workoutCountDiff >= 0 ? 'more' : 'fewer'} than last month
                    </div>
                </div>
                
                <div class="progress-card">
                    <div class="progress-title">Total Duration</div>
                    <div class="progress-value">${currentMonth.totalDuration.toFixed(0)} min</div>
                    <div class="progress-comparison ${totalDurationDiff >= 0 ? 'positive' : 'negative'}">
                        <span class="arrow">${totalDurationDiff >= 0 ? '↑' : '↓'}</span> 
                        ${Math.abs(totalDurationDiff).toFixed(0)} min ${totalDurationDiff >= 0 ? 'more' : 'less'} than last month
                    </div>
                </div>
                
                <div class="progress-card">
                    <div class="progress-title">Avg. Duration</div>
                    <div class="progress-value">${currentMonth.avgDuration.toFixed(0)} min</div>
                    <div class="progress-comparison ${avgDurationDiff >= 0 ? 'positive' : 'negative'}">
                        <span class="arrow">${avgDurationDiff >= 0 ? '↑' : '↓'}</span> 
                        ${Math.abs(avgDurationDiff).toFixed(0)} min ${avgDurationDiff >= 0 ? 'longer' : 'shorter'} than last month
                    </div>
                </div>
                
                <div class="progress-card">
                    <div class="progress-title">Favorite Style</div>
                    <div class="progress-value">${currentMonth.mostPracticedStyle}</div>
                    <div class="progress-comparison">
                        ${previousMonth.mostPracticedStyle === currentMonth.mostPracticedStyle ? 
                            'Same as last month' : 
                            `Changed from ${previousMonth.mostPracticedStyle}`}
                    </div>
                </div>
            </div>
            
            <!-- Style breakdown (similar to HIIT type breakdown) -->
            <div class="progress-card full-width">
                <div class="progress-title">Style Breakdown</div>
                <div class="type-breakdown">`;
    
    // Show breakdown of yoga styles
    Object.entries(currentMonth.styleCount).forEach(([style, count]) => {
        const percentage = (count / currentMonth.workoutCount * 100).toFixed(0);
        yogaProgressHTML += `
                    <div class="type-item">
                        <div class="type-label">${style}</div>
                        <div class="type-bar">
                            <div class="type-fill yoga-fill" style="width: ${percentage}%;">${percentage}%</div>
                        </div>
                    </div>`;
    });
    
    yogaProgressHTML += `
                </div>
            </div>
        </div>`;
    
    return yogaProgressHTML;
}

function generateStrengthProgressCards(strengthWorkouts) {
    // Skip if no strength workouts
    if (strengthWorkouts.length === 0) {
        return '';
    }

    // Group workouts by month to find month-to-month changes
    const monthlyData = {};
    
    strengthWorkouts.forEach(workout => {
        const date = new Date(workout.date);
        const yearMonth = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
        const weekOfYear = getWeekNumber(date);
        const yearWeek = `${date.getFullYear()}-W${weekOfYear}`;
        
        // Initialize month data if needed
        if (!monthlyData[yearMonth]) {
            monthlyData[yearMonth] = {
                month: date.toLocaleString('default', { month: 'long' }),
                year: date.getFullYear(),
                workoutCount: 0,
                exerciseData: {},
                weeklyData: {}
            };
        }
        
        // Count this workout
        monthlyData[yearMonth].workoutCount++;
        
        // Initialize week data if needed
        if (!monthlyData[yearMonth].weeklyData[yearWeek]) {
            monthlyData[yearMonth].weeklyData[yearWeek] = {
                workoutCount: 0,
                exerciseData: {}
            };
        }
        monthlyData[yearMonth].weeklyData[yearWeek].workoutCount++;
        
        // Process exercises in this workout
        if (workout.data && workout.data.exercises) {
            workout.data.exercises.forEach(exercise => {
                const exerciseName = exercise.name;
                
                // Initialize exercise data for this month if needed
                if (!monthlyData[yearMonth].exerciseData[exerciseName]) {
                    monthlyData[yearMonth].exerciseData[exerciseName] = {
                        totalSets: 0,
                        totalReps: 0,
                        totalWeight: 0,
                        maxWeight: 0,
                        totalVolume: 0, // Sets × Reps × Weight
                        workoutCount: 0,
                        personalRecord: false
                    };
                }
                
                // Initialize exercise data for this week if needed
                if (!monthlyData[yearMonth].weeklyData[yearWeek].exerciseData[exerciseName]) {
                    monthlyData[yearMonth].weeklyData[yearWeek].exerciseData[exerciseName] = {
                        totalSets: 0,
                        totalReps: 0,
                        totalWeight: 0,
                        totalVolume: 0
                    };
                }
                
                const monthExerciseData = monthlyData[yearMonth].exerciseData[exerciseName];
                const weekExerciseData = monthlyData[yearMonth].weeklyData[yearWeek].exerciseData[exerciseName];
                
                // Count this as a workout for this exercise
                monthExerciseData.workoutCount++;
                
                // Process sets for this exercise
                if (exercise.sets && Array.isArray(exercise.sets)) {
                    // Add to total sets
                    monthExerciseData.totalSets += exercise.sets.length;
                    weekExerciseData.totalSets += exercise.sets.length;
                    
                    exercise.sets.forEach(set => {
                        const weight = parseFloat(set.weight) || 0;
                        const reps = parseInt(set.reps) || 0;
                        
                        // Update monthly data
                        monthExerciseData.totalReps += reps;
                        monthExerciseData.totalWeight += weight * reps;
                        monthExerciseData.totalVolume += weight * reps;
                        
                        // Update weekly data
                        weekExerciseData.totalReps += reps;
                        weekExerciseData.totalWeight += weight * reps;
                        weekExerciseData.totalVolume += weight * reps;
                        
                        // Track maximum weight
                        if (weight > monthExerciseData.maxWeight) {
                            monthExerciseData.maxWeight = weight;
                            // Mark as PR if this is higher than previous months
                            // Will be properly set after processing all months
                        }
                    });
                }
            });
        }
    });
    
    // Sort months chronologically
    const sortedMonths = Object.keys(monthlyData).sort();
    
    // Need at least one month of data
    if (sortedMonths.length === 0) {
        return `
            <div class="strength-progress">
                <h3>Strength Training Progress</h3>
                <p>No strength training data available.</p>
            </div>
        `;
    }
    
    // Determine personal records by comparing across months
    const allExercises = new Set();
    
    // Gather all exercise names
    sortedMonths.forEach(month => {
        Object.keys(monthlyData[month].exerciseData).forEach(exercise => {
            allExercises.add(exercise);
        });
    });
    
    // Check for PRs
    allExercises.forEach(exerciseName => {
        let maxWeightSoFar = 0;
        
        sortedMonths.forEach(month => {
            const exerciseData = monthlyData[month].exerciseData[exerciseName];
            
            if (exerciseData) {
                if (exerciseData.maxWeight > maxWeightSoFar) {
                    exerciseData.personalRecord = true;
                    maxWeightSoFar = exerciseData.maxWeight;
                }
            }
        });
    });
    
    // Get the most recent month data
    const currentMonthKey = sortedMonths[sortedMonths.length - 1];
    const currentMonth = monthlyData[currentMonthKey];
    
    // Get the previous month data if available
    let previousMonth = null;
    if (sortedMonths.length > 1) {
        const previousMonthKey = sortedMonths[sortedMonths.length - 2];
        previousMonth = monthlyData[previousMonthKey];
    }
    
    // Group exercises by type (can be customized based on user preferences)
    const exerciseGroups = {
        "Upper Body Push": ['Bench Press', 'Overhead Press', 'Incline Press', 'Dips', 'Pushups'],
        "Upper Body Pull": ['Pull Up', 'Chin Up', 'Row', 'Lat Pulldown', 'Face Pull'],
        "Lower Body": ['Squat', 'Deadlift', 'Leg Press', 'Lunge', 'Romanian Deadlift', 'Leg Extension', 'Leg Curl'],
        "Core": ['Plank', 'Ab Rollout', 'Sit Up', 'Leg Raise', 'Russian Twist'],
        "Other": [] // Catch-all for exercises that don't match predetermined categories
    };
    
    // Build HTML for strength progress
    let strengthProgressHTML = `
        <div class="strength-progress">
            <h3>Strength Training Progress</h3>
            <p>Month: ${currentMonth.month} ${currentMonth.year}</p>
            <p>Total Workouts This Month: ${currentMonth.workoutCount}</p>
    `;
    
    // Helper function to calculate averages and format data
    function calculateAverages(exerciseData) {
        const avgWeightPerRep = exerciseData.totalReps > 0 ? exerciseData.totalWeight / exerciseData.totalReps : 0;
        const setsPerWorkout = exerciseData.workoutCount > 0 ? exerciseData.totalSets / exerciseData.workoutCount : 0;
        const repsPerWorkout = exerciseData.workoutCount > 0 ? exerciseData.totalReps / exerciseData.workoutCount : 0;
        
        return {
            avgWeightPerRep,
            setsPerWorkout,
            repsPerWorkout
        };
    }
    
    // Process each exercise and place it in the appropriate group
    const groupedExercises = {};
    
    Object.keys(currentMonth.exerciseData).forEach(exerciseName => {
        let placed = false;
        
        // Check which group this exercise belongs to
        for (const [groupName, exercises] of Object.entries(exerciseGroups)) {
            if (exercises.some(ex => exerciseName.toLowerCase().includes(ex.toLowerCase()))) {
                if (!groupedExercises[groupName]) {
                    groupedExercises[groupName] = [];
                }
                groupedExercises[groupName].push(exerciseName);
                placed = true;
                break;
            }
        }
        
        // If not placed in any specific group, add to "Other"
        if (!placed) {
            if (!groupedExercises["Other"]) {
                groupedExercises["Other"] = [];
            }
            groupedExercises["Other"].push(exerciseName);
        }
    });
    
    // Generate HTML for each exercise group
    for (const [groupName, exercises] of Object.entries(groupedExercises)) {
        if (exercises.length > 0) {
            strengthProgressHTML += `
                <div class="exercise-group">
                    <h4>${groupName}</h4>
                    <div class="progress-cards">
            `;
            
            exercises.forEach(exerciseName => {
                const exerciseData = currentMonth.exerciseData[exerciseName];
                const { avgWeightPerRep, setsPerWorkout, repsPerWorkout } = calculateAverages(exerciseData);
                
                // Calculate weekly averages
                const weeksInMonth = Object.keys(currentMonth.weeklyData).length;
                const setsPerWeek = weeksInMonth > 0 ? exerciseData.totalSets / weeksInMonth : exerciseData.totalSets;
                const repsPerWeek = weeksInMonth > 0 ? exerciseData.totalReps / weeksInMonth : exerciseData.totalReps;
                
                // Get comparison data if previous month exists
                let weightChange = 0;
                let weightChangeDirection = '';
                let volumeChange = 0;
                let volumeChangeDirection = '';
                
                if (previousMonth && previousMonth.exerciseData[exerciseName]) {
                    const prevExerciseData = previousMonth.exerciseData[exerciseName];
                    const prevAvgWeight = prevExerciseData.totalReps > 0 ? 
                        prevExerciseData.totalWeight / prevExerciseData.totalReps : 0;
                    
                    weightChange = avgWeightPerRep - prevAvgWeight;
                    weightChangeDirection = weightChange >= 0 ? 'positive' : 'negative';
                    
                    // Calculate volume change (per workout to normalize)
                    const currentAvgVolume = exerciseData.workoutCount > 0 ? 
                        exerciseData.totalVolume / exerciseData.workoutCount : 0;
                    const prevAvgVolume = prevExerciseData.workoutCount > 0 ? 
                        prevExerciseData.totalVolume / prevExerciseData.workoutCount : 0;
                    
                    volumeChange = currentAvgVolume - prevAvgVolume;
                    volumeChangeDirection = volumeChange >= 0 ? 'positive' : 'negative';
                }
                
                // Create exercise card with detailed stats
                strengthProgressHTML += `
                    <div class="progress-card ${exerciseData.personalRecord ? 'pr-card' : ''}">
                        <div class="progress-title">${exerciseName} ${exerciseData.personalRecord ? '🏆' : ''}</div>
                        
                        <div class="progress-metrics">
                            <div class="metric">
                                <div class="metric-value">${setsPerWeek.toFixed(1)}</div>
                                <div class="metric-label">Sets/Week</div>
                            </div>
                            <div class="metric">
                                <div class="metric-value">${repsPerWeek.toFixed(1)}</div>
                                <div class="metric-label">Reps/Week</div>
                            </div>
                            <div class="metric">
                                <div class="metric-value">${avgWeightPerRep.toFixed(1)} lbs</div>
                                <div class="metric-label">Avg Weight</div>
                            </div>
                        </div>
                        
                        <div class="progress-volume">
                            <div class="volume-label">Total Volume: ${exerciseData.totalVolume.toFixed(0)} lbs</div>
                            <div class="volume-bar">
                                <div class="volume-fill" style="width: 100%;"></div>
                            </div>
                        </div>
                `;
                
                // Only show comparison if we have previous month data
                if (previousMonth && previousMonth.exerciseData[exerciseName]) {
                    strengthProgressHTML += `
                        <div class="progress-comparison ${weightChangeDirection}">
                            <span class="arrow">${weightChange >= 0 ? '↑' : '↓'}</span> 
                            ${Math.abs(weightChange).toFixed(1)} lbs ${weightChange >= 0 ? 'heavier' : 'lighter'} than last month
                        </div>
                        <div class="progress-comparison ${volumeChangeDirection}">
                            <span class="arrow">${volumeChange >= 0 ? '↑' : '↓'}</span> 
                            Volume ${volumeChange >= 0 ? 'increased' : 'decreased'} by ${Math.abs(volumeChange).toFixed(0)} lbs
                        </div>
                    `;
                }
                
                strengthProgressHTML += `
                    </div>
                `;
            });
            
            strengthProgressHTML += `
                    </div>
                </div>
            `;
        }
    }
    
    strengthProgressHTML += `</div>`;
    
    return strengthProgressHTML;
}

// Helper function to get the week number of a date
function getWeekNumber(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    const yearStart = new Date(d.getFullYear(), 0, 1);
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

// Update the showWorkoutStats function to include the strength progress cards
function showWorkoutStats() {
    // Ensure we have the latest data from localStorage
    workouts = JSON.parse(localStorage.getItem('workouts')) || [];
    
    if (workouts.length === 0) {
        workoutStatsEl.innerHTML = '<p>No workouts recorded yet.</p>';
        return;
    }
    
    let statsHtml = '';
    
    // Add workout type distribution
    statsHtml += generateWorkoutTypeDistribution();
    
    // Add strength progress cards if there are strength workouts
    const strengthWorkouts = workouts.filter(w => w.type === 'strength');
    if (strengthWorkouts.length > 0) {
        statsHtml += generateStrengthProgressCards(strengthWorkouts);
    }
    
    // Add walking progress cards if there are walking workouts
    const walkingWorkouts = workouts.filter(w => w.type === 'walking');
    if (walkingWorkouts.length > 0) {
        statsHtml += generateProgressCards(walkingWorkouts);
    }
    
    // Add HIIT progress cards if there are HIIT workouts
    const hiitWorkouts = workouts.filter(w => w.type === 'hiit');
    if (hiitWorkouts.length > 0) {
        statsHtml += generateHiitProgressCards(hiitWorkouts);
    }
    
    // Add yoga progress cards if there are yoga workouts
    const yogaWorkouts = workouts.filter(w => w.type === 'yoga');
    if (yogaWorkouts.length > 0) {
        statsHtml += generateYogaProgressCards(yogaWorkouts);
    }
    
    workoutStatsEl.innerHTML = statsHtml;
}
// ====================================
// EVENT LISTENERS
// ====================================
function setupEventListeners() {
    // Form submit
    workoutForm.addEventListener('submit', saveWorkout);
    
    // Tab switching
    tabs.forEach(tab => tab.addEventListener('click', switchTab));
    
    // Timer controls
    timerDisplay.addEventListener('click', () => {
        if (timerRunning) {
            resetTimer();
        } else {
            if (timerSeconds <= 0) {
                timerSeconds = 120; // Reset to 2 minutes
                timerDisplay.classList.remove('timer-finished');
                updateTimerDisplay();
            }
            startTimer();
        }
    });
    
    increaseTimerBtn.addEventListener('click', increaseTimer);
    decreaseTimerBtn.addEventListener('click', decreaseTimer);
    
    // Add export/import event listeners
    const exportBtn = document.getElementById('export-data');
    const importBtn = document.getElementById('import-label');
    const importFile = document.getElementById('import-file');
    
    if (exportBtn) {
        exportBtn.addEventListener('click', exportData);
    }
    
    if (importBtn) {
        importBtn.addEventListener('click', function() {
            importFile.click();
        });
    }
    
    if (importFile) {
        importFile.addEventListener('change', importData);
    }
}

// ====================================
// DATA EXPORT/IMPORT FUNCTIONS
// ====================================
function exportData() {
    const workouts = JSON.parse(localStorage.getItem('workouts')) || [];
    const workoutPlans = JSON.parse(localStorage.getItem('workoutPlans')) || {};
    
    const exportData = {
        workouts: workouts,
        workoutPlans: workoutPlans,
        exportDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(exportData);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'workout-tracker-backup.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
}

function importData(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            
            if (data.workouts && Array.isArray(data.workouts)) {
                localStorage.setItem('workouts', JSON.stringify(data.workouts));
            }
            
            if (data.workoutPlans && typeof data.workoutPlans === 'object') {
                localStorage.setItem('workoutPlans', JSON.stringify(data.workoutPlans));
            }
            
            alert('Data imported successfully! Refreshing page...');
            location.reload();
        } catch (error) {
            alert('Error importing data: ' + error.message);
        }
    };
    reader.readAsText(file);
}

// ====================================
// INITIALIZATION
// ====================================
function init() {
    // Setup the form
    setupForm();
    
    // Setup event listeners
    setupEventListeners();
    
    // Initialize views
    showWorkoutHistory();
    showWorkoutStats();
    
    // Initialize timer display
    updateTimerDisplay();
}

// Start the application
init();