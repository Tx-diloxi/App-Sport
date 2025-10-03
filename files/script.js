
// Programme d'entraînement complet
const workoutProgram = {
    'Lundi': {
        name: 'Cardio',
        type: 'cardio',
        exercises: [
            { name: 'Course à pied', icon: '🏃', duration: '30-45 min' }
        ]
    },
    'Mardi': {
        name: 'Badminton',
        type: 'badminton',
        exercises: [
            { name: 'Badminton', icon: '🏸', duration: '1h30' }
        ]
    },
    'Mercredi': {
        name: 'Cardio',
        type: 'cardio',
        exercises: [
            { name: 'Course à pied', icon: '🏃', duration: '30-45 min' }
        ]
    },
    'Jeudi': {
        name: 'Repos',
        type: 'rest',
        exercises: []
    },
    'Vendredi': {
        name: 'Pecs/Épaules/Triceps',
        type: 'muscu',
        warmup: 'échauffement rameur ou vélo',
        exercises: [
            { name: 'Développé couché', icon: '🏋️', sets: 3, reps: '8-12', rest: '1 min' },
            { name: 'Développé militaire', icon: '💪', sets: 3, reps: '8-12', rest: '1 min' },
            { name: 'Élévations latérales', icon: '🦅', sets: 3, reps: '10-12', rest: '75 sec' },
            { name: 'Dips', icon: '🤸', sets: 3, reps: '10', rest: '1 min' },
            { name: 'Extension triceps', icon: '💥', sets: 3, reps: '10-12', rest: '75 sec' }
        ]
    },
    'Samedi': {
        name: 'Dos/Biceps',
        type: 'muscu',
        warmup: 'échauffement rameur',
        exercises: [
            { name: 'Tractions/Tirage vertical', icon: '🎯', sets: 3, reps: '8-12', rest: '1 min' },
            { name: 'Rowing', icon: '🚣', sets: 3, reps: '8-12', rest: '1-2 min' },
            { name: 'Tirage assis', icon: '⚡', sets: 3, reps: '10', rest: '1 min' },
            { name: 'Curl barre', icon: '💪', sets: 3, reps: '10-12', rest: '1 min' },
            { name: 'Curl marteau', icon: '🔨', sets: 2, reps: '10-12', rest: '75 sec' }
        ]
    },
    'Dimanche': {
        name: 'Jambes/Abdominaux',
        type: 'muscu',
        warmup: 'échauffement vélo',
        exercises: [
            { name: 'Squat/Presse', icon: '🦵', sets: 3, reps: '8-12', rest: '1 min' },
            { name: 'Fentes', icon: '🏃', sets: 3, reps: '10', rest: '75-90 sec' },
            { name: 'Leg curl', icon: '🦿', sets: 3, reps: '10', rest: '1 min' },
            { name: 'Mollets debout', icon: '👟', sets: 4, reps: '12-15', rest: '1 min' },
            { name: 'Crunchs', icon: '📐', sets: 3, reps: '15', rest: '30 sec' },
            { name: 'Gainage', icon: '🧘', sets: 3, reps: '30-45 sec', rest: '30 sec' }
        ]
    }
};

// Variables globales
let currentDay = '';
let currentExerciseIndex = 0;
let currentSeriesIndex = 0;
let workoutData = {};
let waterCount = 0;
let restTimer = null;
let restTimeLeft = 0;

// Initialisation
function init() {
    loadData();
    createDaySelector();
    updateWaterDisplay();
    loadMeals();
    updateStats();
    updateHistory();
    
    // Sélection automatique du jour actuel
    autoSelectDay();
}

// Sauvegarde et chargement des données
function saveData() {
    const today = new Date().toISOString().split('T')[0];
    const data = {
        workouts: workoutData,
        water: { [today]: waterCount },
        lastUpdate: today
    };
    localStorage.setItem('fitnessData', JSON.stringify(data));
}

function loadData() {
    const saved = localStorage.getItem('fitnessData');
    if (saved) {
        const data = JSON.parse(saved);
        workoutData = data.workouts || {};
        const today = new Date().toISOString().split('T')[0];
        waterCount = (data.water && data.water[today]) || 0;
    }
}

// Navigation
function showSection(section) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(section).classList.add('active');
    event.target.classList.add('active');

    if (section === 'stats') updateStats();
    if (section === 'history') updateHistory();
}

// Sélecteur de jour
function createDaySelector() {
    const selector = document.getElementById('daySelector');
    const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
    
    days.forEach(day => {
        const btn = document.createElement('button');
        btn.className = 'day-btn';
        btn.textContent = day;
        btn.onclick = () => selectDay(day);
        selector.appendChild(btn);
    });
}

// Sélection automatique du jour
function autoSelectDay() {
    const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    const today = new Date().getDay();
    const todayName = days[today];
    
    selectDay(todayName);
    
    // Marquer le jour actuel
    document.querySelectorAll('.day-btn').forEach(btn => {
        if (btn.textContent === todayName) {
            btn.classList.add('auto-day');
        }
    });
}

function selectDay(day) {
    currentDay = day;
    currentExerciseIndex = 0;
    currentSeriesIndex = 0;
    
    document.querySelectorAll('.day-btn').forEach(btn => {
        btn.classList.toggle('active', btn.textContent === day);
    });

    displayExercise();
}

// Affichage des exercices
function displayExercise() {
    const container = document.getElementById('swipeContainer');
    
    if (!currentDay) {
        container.innerHTML = '<div class="card no-data"><p>Sélectionnez un jour d\'entraînement</p></div>';
        return;
    }

    const workout = workoutProgram[currentDay];
    const exercises = workout.exercises;

    if (currentExerciseIndex >= exercises.length) {
        container.innerHTML = '<div class="card"><h3>✅ Séance terminée!</h3><p>Bravo! Pensez à vous hydrater et à bien récupérer.</p><button class="btn-primary" onclick="resetWorkout()">Recommencer</button></div>';
        saveWorkoutComplete();
        return;
    }

    const exercise = exercises[currentExerciseIndex];
    
    // Affichage différent selon le type d'exercice
    if (workout.type === 'cardio') {
        displayCardioExercise(exercise, container);
    } else if (workout.type === 'badminton') {
        displayBadmintonExercise(exercise, container);
    } else if (workout.type === 'muscu') {
        displayMuscuExercise(exercise, container);
    } else if (workout.type === 'rest') {
        container.innerHTML = '<div class="card"><h3>🛌 Jour de repos</h3><p>Profitez de votre journée de récupération!</p></div>';
    }
}

// Affichage d'un exercice de cardio
function displayCardioExercise(exercise, container) {
    const card = document.createElement('div');
    card.className = 'exercise-card';
    card.innerHTML = `
        <div class="exercise-image">${exercise.icon}</div>
        <div class="exercise-name">${exercise.name}</div>
        <div class="exercise-details">
            <p><strong>Durée recommandée:</strong> ${exercise.duration}</p>
        </div>
        <div class="cardio-inputs">
            <div class="cardio-input">
                <label>Durée réelle (minutes)</label>
                <input type="number" id="duration" placeholder="Ex: 35">
            </div>
            <div class="cardio-input">
                <label>Distance parcourue (km) - optionnel</label>
                <input type="number" id="distance" placeholder="Ex: 5.2">
            </div>
        </div>
        <div class="swipe-buttons">
            <button class="swipe-btn btn-skip" onclick="skipExercise()">✕</button>
            <button class="swipe-btn btn-done" onclick="completeCardio()">✓</button>
        </div>
    `;

    container.innerHTML = '';
    container.appendChild(card);
}

// Affichage d'un exercice de badminton
function displayBadmintonExercise(exercise, container) {
    const card = document.createElement('div');
    card.className = 'exercise-card';
    card.innerHTML = `
        <div class="badminton-card">
            <div class="exercise-image">${exercise.icon}</div>
            <div class="exercise-name">${exercise.name}</div>
            <div class="badminton-question">Avez-vous joué au badminton aujourd'hui?</div>
            <div class="swipe-buttons">
                <button class="swipe-btn btn-skip" onclick="skipBadminton()">✕</button>
                <button class="swipe-btn btn-done" onclick="completeBadminton()">✓</button>
            </div>
        </div>
    `;

    container.innerHTML = '';
    container.appendChild(card);
}

// Affichage d'un exercice de musculation
function displayMuscuExercise(exercise, container) {
    const card = document.createElement('div');
    card.className = 'exercise-card';
    
    // Si on est en phase de repos
    if (restTimeLeft > 0) {
        card.innerHTML = `
            <div class="rest-timer">
                <div class="timer-label">⏱️ Temps de repos</div>
                <div class="timer-display" id="timerDisplay">${formatTime(restTimeLeft)}</div>
                <div class="timer-label">Prochain exercice: ${exercise.name}</div>
                <button class="skip-rest-btn" onclick="skipRest()">Passer le repos</button>
            </div>
        `;
        
        container.innerHTML = '';
        container.appendChild(card);
        startRestTimer();
        return;
    }
    
    // Affichage normal de l'exercice
    const totalSets = exercise.sets;
    const currentSet = currentSeriesIndex + 1;
    
    card.innerHTML = `
        <div class="exercise-image">${exercise.icon}</div>
        <div class="exercise-name">${exercise.name}</div>
        <div class="exercise-details">
            <p><strong>Séries:</strong> ${exercise.sets}</p>
            <p><strong>Répétitions:</strong> ${exercise.reps}</p>
            <p><strong>Repos:</strong> ${exercise.rest}</p>
        </div>
        <div class="series-progress">Série ${currentSet}/${totalSets}</div>
        <div class="series-inputs">
            <div class="series-input">
                <label>Poids utilisé (kg)</label>
                <input type="number" id="weight" placeholder="Ex: 20">
            </div>
            <div class="series-input">
                <label>Répétitions effectuées</label>
                <input type="number" id="reps" placeholder="Ex: 10">
            </div>
        </div>
        <div class="swipe-buttons">
            <button class="swipe-btn btn-skip" onclick="skipSeries()">✕</button>
            <button class="swipe-btn btn-done" onclick="completeSeries()">✓</button>
        </div>
    `;

    container.innerHTML = '';
    container.appendChild(card);
}

// Complétion d'un exercice de cardio
function completeCardio() {
    const duration = document.getElementById('duration').value;
    const distance = document.getElementById('distance').value;
    const exercise = workoutProgram[currentDay].exercises[currentExerciseIndex];
    
    const today = new Date().toISOString().split('T')[0];
    if (!workoutData[today]) workoutData[today] = { day: currentDay, exercises: [] };
    
    workoutData[today].exercises.push({
        name: exercise.name,
        duration: duration || 0,
        distance: distance || 0,
        completed: true
    });

    saveData();
    animateSwipe('right');
}

// Complétion d'un exercice de badminton
function completeBadminton() {
    const exercise = workoutProgram[currentDay].exercises[currentExerciseIndex];
    
    const today = new Date().toISOString().split('T')[0];
    if (!workoutData[today]) workoutData[today] = { day: currentDay, exercises: [] };
    
    workoutData[today].exercises.push({
        name: exercise.name,
        completed: true
    });

    saveData();
    animateSwipe('right');
}

function skipBadminton() {
    const exercise = workoutProgram[currentDay].exercises[currentExerciseIndex];
    const today = new Date().toISOString().split('T')[0];
    if (!workoutData[today]) workoutData[today] = { day: currentDay, exercises: [] };
    
    workoutData[today].exercises.push({
        name: exercise.name,
        skipped: true
    });

    saveData();
    animateSwipe('left');
}

// Complétion d'une série de musculation
function completeSeries() {
    const weight = document.getElementById('weight').value;
    const reps = document.getElementById('reps').value;
    const exercise = workoutProgram[currentDay].exercises[currentExerciseIndex];
    
    const today = new Date().toISOString().split('T')[0];
    if (!workoutData[today]) workoutData[today] = { day: currentDay, exercises: [] };
    
    // Chercher si l'exercice existe déjà dans les données
    let exerciseData = workoutData[today].exercises.find(e => e.name === exercise.name);
    
    if (!exerciseData) {
        exerciseData = {
            name: exercise.name,
            series: []
        };
        workoutData[today].exercises.push(exerciseData);
    }
    
    // Ajouter la série
    exerciseData.series.push({
        set: currentSeriesIndex + 1,
        weight: weight || 0,
        reps: reps || 0
    });

    saveData();
    
    // Passer à la série suivante ou à l'exercice suivant
    currentSeriesIndex++;
    
    if (currentSeriesIndex >= exercise.sets) {
        // Dernière série terminée, passer à l'exercice suivant
        currentSeriesIndex = 0;
        animateSwipe('right');
    } else {
        // Série suivante, démarrer le chrono de repos
        startRestPeriod(exercise.rest);
    }
}

function skipSeries() {
    const exercise = workoutProgram[currentDay].exercises[currentExerciseIndex];
    const today = new Date().toISOString().split('T')[0];
    if (!workoutData[today]) workoutData[today] = { day: currentDay, exercises: [] };
    
    // Chercher si l'exercice existe déjà dans les données
    let exerciseData = workoutData[today].exercises.find(e => e.name === exercise.name);
    
    if (!exerciseData) {
        exerciseData = {
            name: exercise.name,
            series: []
        };
        workoutData[today].exercises.push(exerciseData);
    }
    
    // Ajouter la série comme skip
    exerciseData.series.push({
        set: currentSeriesIndex + 1,
        skipped: true
    });

    saveData();
    
    // Passer à la série suivante ou à l'exercice suivant
    currentSeriesIndex++;
    
    if (currentSeriesIndex >= exercise.sets) {
        // Dernière série terminée, passer à l'exercice suivant
        currentSeriesIndex = 0;
        animateSwipe('left');
    } else {
        // Série suivante, démarrer le chrono de repos
        startRestPeriod(exercise.rest);
    }
}

// Gestion du chrono de repos
function startRestPeriod(restTime) {
    // Convertir le temps de repos en secondes
    if (restTime.includes('min')) {
        restTimeLeft = parseInt(restTime) * 60;
    } else if (restTime.includes('sec')) {
        restTimeLeft = parseInt(restTime);
    } else {
        restTimeLeft = 60; // 1 minute par défaut
    }
    
    displayExercise();
}

function startRestTimer() {
    if (restTimer) clearInterval(restTimer);
    
    restTimer = setInterval(() => {
        restTimeLeft--;
        document.getElementById('timerDisplay').textContent = formatTime(restTimeLeft);
        
        if (restTimeLeft <= 0) {
            clearInterval(restTimer);
            restTimer = null;
            displayExercise();
        }
    }, 1000);
}

function skipRest() {
    if (restTimer) clearInterval(restTimer);
    restTimer = null;
    restTimeLeft = 0;
    displayExercise();
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

// Animation de swipe
function animateSwipe(direction) {
    const card = document.querySelector('.exercise-card');
    if (!card) return;
    
    card.classList.add('swiping');
    card.classList.add(direction === 'right' ? 'swiped-right' : 'swiped-left');
    
    setTimeout(() => {
        currentExerciseIndex++;
        displayExercise();
    }, 300);
}

function skipExercise() {
    animateSwipe('left');
}

function resetWorkout() {
    currentExerciseIndex = 0;
    currentSeriesIndex = 0;
    displayExercise();
}

// Hydratation
function changeWater(amount) {
    waterCount = Math.max(0, waterCount + amount);
    updateWaterDisplay();
    saveData();
}

function updateWaterDisplay() {
    document.getElementById('waterCount').textContent = waterCount;
}

// Nutrition
function saveMeals() {
    const meals = {};
    for (let i = 1; i <= 6; i++) {
        meals[`meal${i}`] = document.getElementById(`meal${i}`).checked;
    }
    localStorage.setItem('fitnessMeals', JSON.stringify(meals));
}

function loadMeals() {
    const saved = localStorage.getItem('fitnessMeals');
    if (saved) {
        const meals = JSON.parse(saved);
        for (let i = 1; i <= 6; i++) {
            document.getElementById(`meal${i}`).checked = meals[`meal${i}`] || false;
        }
    }
}

// Statistiques
function updateStats() {
    const today = new Date().toISOString().split('T')[0];
    const workouts = Object.values(workoutData).filter(w => w.completed || w.exercises?.length > 0).length;
    const exercises = Object.values(workoutData).reduce((total, w) => total + (w.exercises?.length || 0), 0);
    
    document.getElementById('totalWorkouts').textContent = workouts;
    document.getElementById('totalExercises').textContent = exercises;
    document.getElementById('avgWater').textContent = waterCount;
}

// Historique
function updateHistory() {
    const historyList = document.getElementById('historyList');
    historyList.innerHTML = '';
    
    const sortedDates = Object.keys(workoutData).sort().reverse();
    
    if (sortedDates.length === 0) {
        historyList.innerHTML = '<p class="no-data">Aucune séance enregistrée</p>';
        return;
    }
    
    sortedDates.forEach(date => {
        const workout = workoutData[date];
        const item = document.createElement('div');
        item.className = 'history-item';
        
        let content = `<div class="history-date">${date} - ${workout.day}</div>`;
        
        if (workout.exercises && workout.exercises.length > 0) {
            workout.exercises.forEach(ex => {
                if (ex.series) {
                    content += `<div class="history-details">${ex.name}: ${ex.series.length} séries</div>`;
                } else if (ex.duration) {
                    content += `<div class="history-details">${ex.name}: ${ex.duration} min</div>`;
                } else {
                    content += `<div class="history-details">${ex.name}: ${ex.completed ? '✓' : '✕'}</div>`;
                }
            });
        }
        
        item.innerHTML = content;
        historyList.appendChild(item);
    });
}

function saveWorkoutComplete() {
    const today = new Date().toISOString().split('T')[0];
    if (workoutData[today]) {
        workoutData[today].completed = true;
        saveData();
    }
}

// Export et réinitialisation
function exportData() {
    const data = {
        workouts: workoutData,
        water: waterCount,
        exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fitness-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

function clearData() {
    if (confirm('Êtes-vous sûr de vouloir réinitialiser toutes les données?')) {
        localStorage.removeItem('fitnessData');
        localStorage.removeItem('fitnessMeals');
        workoutData = {};
        waterCount = 0;
        init();
    }
}

// Initialisation au chargement
window.onload = init;