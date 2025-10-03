// Programme d'entraînement
const workoutProgram = {
    'Vendredi': {
        name: 'Pecs/Épaules/Triceps',
        warmup: 'échauffement rameur ou vélo',
        exercises: [
            { name: 'Développé couché', icon: '🏋️', sets: 3, reps: '8-12', rest: '1-2 min' },
            { name: 'Développé militaire', icon: '💪', sets: 3, reps: '8-12', rest: '1 min' },
            { name: 'Élévations latérales', icon: '🦅', sets: 3, reps: '10-12', rest: '75 sec' },
            { name: 'Dips', icon: '🤸', sets: 3, reps: '10', rest: '1 min' },
            { name: 'Extension triceps', icon: '💥', sets: 3, reps: '10-12', rest: '75 sec' }
        ]
    },
    'Samedi': {
        name: 'Dos/Biceps',
        warmup: 'échauffement rameur',
        exercises: [
            { name: 'Tractions/Tirage vertical', icon: '🎯', sets: 3, reps: '8-12', rest: '1-2 min' },
            { name: 'Rowing', icon: '🚣', sets: 3, reps: '8-12', rest: '1-2 min' },
            { name: 'Tirage assis', icon: '⚡', sets: 3, reps: '10', rest: '1 min' },
            { name: 'Curl barre', icon: '💪', sets: 3, reps: '10-12', rest: '1 min' },
            { name: 'Curl marteau', icon: '🔨', sets: 2, reps: '10-12', rest: '75 sec' }
        ]
    },
    'Dimanche': {
        name: 'Jambes/Abdominaux',
        warmup: 'échauffement vélo',
        exercises: [
            { name: 'Squat/Presse', icon: '🦵', sets: 3, reps: '8-12', rest: '1-2 min' },
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
let workoutData = {};
let waterCount = 0;

// Initialisation
function init() {
    loadData();
    createDaySelector();
    updateWaterDisplay();
    loadMeals();
    updateStats();
    updateHistory();
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
    const days = ['Vendredi', 'Samedi', 'Dimanche'];
    
    days.forEach(day => {
        const btn = document.createElement('button');
        btn.className = 'day-btn';
        btn.textContent = day;
        btn.onclick = () => selectDay(day);
        selector.appendChild(btn);
    });
}

function selectDay(day) {
    currentDay = day;
    currentExerciseIndex = 0;
    
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
    const card = document.createElement('div');
    card.className = 'exercise-card';
    card.innerHTML = `
        <div class="exercise-image">${exercise.icon}</div>
        <div class="exercise-name">${exercise.name}</div>
        <div class="exercise-details">
            <p><strong>Séries:</strong> ${exercise.sets}</p>
            <p><strong>Répétitions:</strong> ${exercise.reps}</p>
            <p><strong>Repos:</strong> ${exercise.rest}</p>
        </div>
        <div class="series-input">
            <label>Poids utilisé (kg)</label>
            <input type="number" id="weight" placeholder="Ex: 20">
        </div>
        <div class="series-input">
            <label>Répétitions effectuées</label>
            <input type="number" id="reps" placeholder="Ex: 10">
        </div>
        <div class="swipe-buttons">
            <button class="swipe-btn btn-skip" onclick="skipExercise()">✕</button>
            <button class="swipe-btn btn-done" onclick="completeExercise()">✓</button>
        </div>
    `;

    container.innerHTML = '';
    container.appendChild(card);
}

function completeExercise() {
    const weight = document.getElementById('weight').value;
    const reps = document.getElementById('reps').value;
    const exercise = workoutProgram[currentDay].exercises[currentExerciseIndex];
    
    const today = new Date().toISOString().split('T')[0];
    if (!workoutData[today]) workoutData[today] = { day: currentDay, exercises: [] };
    
    workoutData[today].exercises.push({
        name: exercise.name,
        weight: weight || 0,
        reps: reps || 0,
        completed: true
    });

    saveData();
    animateSwipe('right');
}

function skipExercise() {
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

function animateSwipe(direction) {
    const card = document.querySelector('.exercise-card');
    card.classList.add(`swiped-${direction}`);
    
    setTimeout(() => {
        currentExerciseIndex++;
        displayExercise();
    }, 300);
}

function resetWorkout() {
    currentExerciseIndex = 0;
    displayExercise();
}

function saveWorkoutComplete() {
    saveData();
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

// Repas
function saveMeals() {
    const today = new Date().toISOString().split('T')[0];
    const meals = {};
    for (let i = 1; i <= 6; i++) {
        meals[`meal${i}`] = document.getElementById(`meal${i}`).checked;
    }
    localStorage.setItem(`meals_${today}`, JSON.stringify(meals));
}

function loadMeals() {
    const today = new Date().toISOString().split('T')[0];
    const saved = localStorage.getItem(`meals_${today}`);
    if (saved) {
        const meals = JSON.parse(saved);
        for (let key in meals) {
            const el = document.getElementById(key);
            if (el) el.checked = meals[key];
        }
    }
}

// Stats
function updateStats() {
    let totalWorkouts = 0;
    let totalExercises = 0;
    let totalWater = 0;
    let waterDays = 0;

    for (let date in workoutData) {
        if (workoutData[date].exercises && workoutData[date].exercises.length > 0) {
            totalWorkouts++;
            totalExercises += workoutData[date].exercises.length;
        }
    }

    const saved = localStorage.getItem('fitnessData');
    if (saved) {
        const data = JSON.parse(saved);
        if (data.water) {
            for (let date in data.water) {
                totalWater += data.water[date];
                waterDays++;
            }
        }
    }

    document.getElementById('totalWorkouts').textContent = totalWorkouts;
    document.getElementById('totalExercises').textContent = totalExercises;
    document.getElementById('avgWater').textContent = waterDays > 0 ? Math.round(totalWater / waterDays) : 0;
}

// Historique
function updateHistory() {
    const list = document.getElementById('historyList');
    const dates = Object.keys(workoutData).sort().reverse();

    if (dates.length === 0) {
        list.innerHTML = '<div class="no-data">Aucune séance enregistrée</div>';
        return;
    }

    list.innerHTML = dates.map(date => {
        const workout = workoutData[date];
        const completed = workout.exercises.filter(e => e.completed).length;
        const total = workout.exercises.length;

        return `
            <div class="history-item">
                <div class="history-date">${new Date(date).toLocaleDateString('fr-FR')} - ${workout.day}</div>
                <div class="history-details">
                    ${completed}/${total} exercices complétés
                </div>
            </div>
        `;
    }).join('');
}

// Export et réinitialisation
function exportData() {
    const data = localStorage.getItem('fitnessData');
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fitness-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
}

function clearData() {
    if (confirm('Êtes-vous sûr de vouloir effacer toutes vos données?')) {
        localStorage.clear();
        workoutData = {};
        waterCount = 0;
        location.reload();
    }
}

// Démarrage
init();