class GymJournalPro {
    constructor() {
        this.currentSplit = null;
        this.currentWorkout = null;
        this.currentExercise = null;
        this.workoutStartTime = null;
        this.durationInterval = null;
        this.autoSaveInterval = null;
        
        // Timer properties
        this.timerState = {
            isRunning: false,
            startTime: null,
            duration: 60, // default 60 seconds
            remaining: 60,
            interval: null
        };

        // Workout data
        this.workoutSplits = {
            push: [
                {name: "Pec dec fly", muscle: "Chest", tips: "Focus on the squeeze at the top"},
                {name: "Chest press machine", muscle: "Chest", tips: "Control the negative movement"}, 
                {name: "Shoulder press machine", muscle: "Shoulders", tips: "Keep core tight throughout"},
                {name: "Lateral raise", muscle: "Shoulders", tips: "Slight forward lean, pinky up"},
                {name: "Front raise", muscle: "Shoulders", tips: "Control tempo, don't swing"},
                {name: "Reverse pec dec", muscle: "Rear Delts", tips: "Squeeze shoulder blades together"},
                {name: "Rope pushdown", muscle: "Triceps", tips: "Keep elbows locked at sides"}
            ],
            pull: [
                {name: "Lat pulldown", muscle: "Lats", tips: "Pull with your back, not arms"},
                {name: "Seated cable row", muscle: "Mid Back", tips: "Squeeze shoulder blades at end"},
                {name: "Close grip lat pulldown", muscle: "Lats", tips: "Focus on lat engagement"},
                {name: "Reverse pec dec", muscle: "Rear Delts", tips: "Control the movement, don't swing"},
                {name: "Romanian deadlift", muscle: "Hamstrings", tips: "Hip hinge movement, tight core"},
                {name: "Shrugs", muscle: "Traps", tips: "Straight up and down motion"},
                {name: "Hammer curl", muscle: "Biceps", tips: "Keep wrists neutral throughout"}
            ],
            leg: [
                {name: "Squats", muscle: "Quadriceps", tips: "Hip width stance, knees track toes"},
                {name: "Leg press machine", muscle: "Quadriceps", tips: "Full range of motion"},
                {name: "Leg extensions", muscle: "Quadriceps", tips: "Control the eccentric portion"},
                {name: "Romanian deadlift", muscle: "Hamstrings", tips: "Feel the stretch in hamstrings"},
                {name: "Bulgarian squat", muscle: "Glutes", tips: "Keep front foot planted"},
                {name: "Calf raise", muscle: "Calves", tips: "Full stretch and contraction"}
            ],
            upper: [
                {name: "Lat pulldown", muscle: "Lats", tips: "Wide grip, lean back slightly"},
                {name: "Seated cable row", muscle: "Mid Back", tips: "Pull to lower chest"},
                {name: "Shoulder press machine", muscle: "Shoulders", tips: "Full range of motion"},
                {name: "Lateral raise", muscle: "Shoulders", tips: "Control the weight"},
                {name: "Reverse pec dec", muscle: "Rear Delts", tips: "Focus on rear delt contraction"},
                {name: "Chest press", muscle: "Chest", tips: "Keep shoulder blades back"},
                {name: "Pec dec fly", muscle: "Chest", tips: "Feel the stretch and squeeze"}
            ],
            lower: [
                {name: "Squats", muscle: "Quadriceps", tips: "Maintain neutral spine"},
                {name: "Leg press machine", muscle: "Quadriceps", tips: "Don't lock knees completely"},
                {name: "Leg extensions", muscle: "Quadriceps", tips: "Pause at the top"},
                {name: "Romanian deadlift", muscle: "Hamstrings", tips: "Keep bar close to body"},
                {name: "Bulgarian squat", muscle: "Glutes", tips: "Focus on working leg"},
                {name: "Calf raise", muscle: "Calves", tips: "Hold at the top for 1 second"}
            ]
        };
        
        this.splitTitles = {
            push: { title: "Push Workout", desc: "Chest • Shoulders • Triceps" },
            pull: { title: "Pull Workout", desc: "Back • Biceps • Rear Delts" },
            leg: { title: "Leg Workout", desc: "Quads • Hamstrings • Calves" },
            upper: { title: "Upper Workout", desc: "Full Upper Body" },
            lower: { title: "Lower Workout", desc: "Legs • Glutes" }
        };

        this.init();
    }

    init() {
        this.bindEvents();
        this.loadStats();
        this.showScreen('splitSelection');
        this.initializeDateTimeInputs();
        
        // Prevent accidental page refresh during workout
        window.addEventListener('beforeunload', (e) => {
            if (this.currentWorkout) {
                e.preventDefault();
                e.returnValue = 'Anda memiliki workout yang sedang berlangsung. Yakin ingin meninggalkan halaman?';
                return e.returnValue;
            }
        });
    }

    bindEvents() {
        // Setup workout
        const setupBtn = document.getElementById('setupWorkoutBtn');
        const quickBtn = document.getElementById('quickStartBtn');
        const continueBtn = document.getElementById('continueToSplit');
        
        if (setupBtn) {
            setupBtn.addEventListener('click', () => {
                this.showScreen('workoutSetup');
                this.showBackButton();
            });
        }

        if (quickBtn) {
            quickBtn.addEventListener('click', () => {
                this.quickStart();
            });
        }

        if (continueBtn) {
            continueBtn.addEventListener('click', () => {
                this.setupWorkout();
            });
        }

        // Energy level slider
        const energySlider = document.getElementById('energyLevel');
        if (energySlider) {
            energySlider.addEventListener('input', (e) => {
                const energyValue = document.getElementById('energyValue');
                if (energyValue) {
                    energyValue.textContent = e.target.value;
                }
            });
        }

        // Session rating slider
        const sessionRating = document.getElementById('sessionRating');
        if (sessionRating) {
            sessionRating.addEventListener('input', (e) => {
                const ratingValue = document.getElementById('ratingValue');
                if (ratingValue) {
                    ratingValue.textContent = e.target.value;
                }
            });
        }

        // Split selection
        document.querySelectorAll('.split-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const split = e.currentTarget.dataset.split;
                this.startWorkout(split);
            });
        });

        // Navigation
        document.getElementById('backBtn').addEventListener('click', () => {
            this.goBack();
        });

        document.getElementById('historyBtn').addEventListener('click', () => {
            this.showHistory();
        });

        // Finish workout
        const finishBtn = document.getElementById('finishWorkoutBtn');
        if (finishBtn) {
            finishBtn.addEventListener('click', () => {
                this.finishWorkout();
            });
        }

        // Progress form
        const progressForm = document.getElementById('progressForm');
        if (progressForm) {
            progressForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveWorkout();
            });
        }

        // Modal events
        const closeModal = document.getElementById('closeModal');
        if (closeModal) {
            closeModal.addEventListener('click', () => {
                this.closeModal();
            });
        }

        const addSetBtn = document.getElementById('addSetBtn');
        if (addSetBtn) {
            addSetBtn.addEventListener('click', () => {
                this.addSet();
            });
        }

        const finishExercise = document.getElementById('finishExercise');
        if (finishExercise) {
            finishExercise.addEventListener('click', () => {
                this.finishExerciseAndStartRest();
            });
        }

        // Timer events
        this.bindTimerEvents();

        // Data management
        const exportBtn = document.getElementById('exportData');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportData();
            });
        }

        const importBtn = document.getElementById('importData');
        if (importBtn) {
            importBtn.addEventListener('click', () => {
                this.importData();
            });
        }

        const clearBtn = document.getElementById('clearHistory');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                this.clearHistory();
            });
        }

        // File input for import
        const fileInput = document.getElementById('fileInput');
        if (fileInput) {
            fileInput.addEventListener('change', (e) => {
                this.handleFileImport(e);
            });
        }

        // Confirmation modal
        const confirmCancel = document.getElementById('confirmCancel');
        if (confirmCancel) {
            confirmCancel.addEventListener('click', () => {
                this.hideConfirmModal();
            });
        }

        // Click outside modal to close
        const exerciseModal = document.getElementById('exerciseModal');
        if (exerciseModal) {
            exerciseModal.addEventListener('click', (e) => {
                if (e.target.id === 'exerciseModal') {
                    this.closeModal();
                }
            });
        }
    }

    bindTimerEvents() {
        // Timer controls
        const timerPlay = document.getElementById('timerPlay');
        const timerPause = document.getElementById('timerPause');
        const timerReset = document.getElementById('timerReset');
        const closeTimer = document.getElementById('closeTimer');

        if (timerPlay) {
            timerPlay.addEventListener('click', () => {
                this.startTimer();
            });
        }

        if (timerPause) {
            timerPause.addEventListener('click', () => {
                this.pauseTimer();
            });
        }

        if (timerReset) {
            timerReset.addEventListener('click', () => {
                this.resetTimer();
            });
        }

        if (closeTimer) {
            closeTimer.addEventListener('click', () => {
                this.hideRestTimer();
            });
        }

        // Preset buttons
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const time = parseInt(e.target.dataset.time);
                this.setTimerDuration(time);
            });
        });

        // Click outside timer to close
        const restTimer = document.getElementById('restTimer');
        if (restTimer) {
            restTimer.addEventListener('click', (e) => {
                if (e.target.id === 'restTimer') {
                    this.hideRestTimer();
                }
            });
        }
    }

    initializeDateTimeInputs() {
        const now = new Date();
        const dateInput = document.getElementById('workoutDate');
        const timeInput = document.getElementById('workoutTime');
        
        if (dateInput) {
            dateInput.value = now.toISOString().split('T')[0];
        }
        if (timeInput) {
            timeInput.value = now.toTimeString().slice(0, 5);
        }
    }

    quickStart() {
        // Use current date/time and default settings
        const now = new Date();
        this.workoutSettings = {
            date: now.toISOString(),
            time: now.toTimeString().slice(0, 5),
            location: 'gym',
            energyLevel: 7
        };
    }

    setupWorkout() {
        const dateInput = document.getElementById('workoutDate');
        const timeInput = document.getElementById('workoutTime');
        const locationInput = document.getElementById('workoutLocation');
        const energyInput = document.getElementById('energyLevel');

        const date = dateInput ? dateInput.value : '';
        const time = timeInput ? timeInput.value : '';
        const location = locationInput ? locationInput.value : 'gym';
        const energyLevel = energyInput ? energyInput.value : '7';

        if (!date || !time) {
            this.showAlert('Harap pilih tanggal dan waktu workout!');
            return;
        }

        this.workoutSettings = {
            date: new Date(date + 'T' + time).toISOString(),
            time: time,
            location: location,
            energyLevel: parseInt(energyLevel)
        };

        this.showScreen('splitSelection');
    }

    startWorkout(split) {
        this.currentSplit = split;
        this.workoutStartTime = Date.now();
        
        this.currentWorkout = {
            split: split,
            date: this.workoutSettings?.date || new Date().toISOString(),
            startTime: this.workoutStartTime,
            location: this.workoutSettings?.location || 'gym',
            energyLevel: this.workoutSettings?.energyLevel || 7,
            exercises: this.workoutSplits[split].map(exercise => ({
                ...exercise,
                sets: []
            })),
            notes: {
                highlights: '',
                weakPoints: '',
                adjustments: '',
                sessionRating: 7
            }
        };

        this.showExerciseList();
        this.updateWorkoutHeader();
        this.renderExercises();
        this.updateFinishButtonVisibility();
        this.startDurationTimer();
        this.startAutoSave();
    }

    startDurationTimer() {
        this.durationInterval = setInterval(() => {
            this.updateWorkoutDuration();
        }, 1000);
    }

    updateWorkoutDuration() {
        if (!this.workoutStartTime) return;
        
        const elapsed = Date.now() - this.workoutStartTime;
        const minutes = Math.floor(elapsed / 60000);
        const seconds = Math.floor((elapsed % 60000) / 1000);
        
        const durationElement = document.getElementById('workoutDuration');
        if (durationElement) {
            durationElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
    }

    startAutoSave() {
        this.autoSaveInterval = setInterval(() => {
            if (this.currentWorkout) {
                this.saveWorkoutToStorage(false);
                this.updateAutoSaveStatus('✅ Auto-saved');
            }
        }, 5000);
    }

    updateAutoSaveStatus(message) {
        const statusElement = document.getElementById('autoSaveStatus');
        if (statusElement) {
            statusElement.textContent = message;
            statusElement.classList.add('volume-update');
            setTimeout(() => statusElement.classList.remove('volume-update'), 300);
        }
    }

    showExerciseList() {
        this.showScreen('exerciseList');
        this.showBackButton();
        document.getElementById('headerTitle').textContent = 'Workout Session';
        
        // Update start time display
        const startTimeElement = document.getElementById('workoutStartTime');
        if (startTimeElement && this.workoutStartTime) {
            const startTime = new Date(this.workoutStartTime);
            startTimeElement.textContent = `Started: ${startTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`;
        }
    }

    updateWorkoutHeader() {
        const splitInfo = this.splitTitles[this.currentSplit];
        const titleElement = document.getElementById('currentSplitTitle');
        const descElement = document.getElementById('currentSplitDesc');
        
        if (titleElement) titleElement.textContent = splitInfo.title;
        if (descElement) descElement.textContent = splitInfo.desc;
        
        this.updateSessionVolume();
    }

    renderExercises() {
        const container = document.getElementById('exerciseContainer');
        if (!container || !this.currentWorkout) return;
        
        container.innerHTML = '';

        this.currentWorkout.exercises.forEach((exercise, index) => {
            const exerciseCard = this.createExerciseCard(exercise, index);
            container.appendChild(exerciseCard);
        });

        this.updateFinishButtonVisibility();
    }

    createExerciseCard(exercise, index) {
        const card = document.createElement('div');
        card.className = 'exercise-card';
        
        const volume = this.calculateExerciseVolume(exercise);
        const setCount = exercise.sets.length;
        const hasCompletedSets = exercise.sets.some(set => set.weight > 0 && set.reps > 0);
        
        if (hasCompletedSets) {
            card.classList.add('completed');
        }

        card.addEventListener('click', () => this.openExerciseModal(index));

        card.innerHTML = `
            <div class="exercise-header">
                <div class="exercise-info">
                    <h3>${exercise.name}</h3>
                    <div class="exercise-muscle">${exercise.muscle}</div>
                </div>
                <div class="exercise-volume">
                    <span class="volume-label">Volume</span>
                    <span class="volume-value">${volume.toFixed(1)} kg</span>
                </div>
            </div>
            <div class="exercise-stats">
                <span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                        <rect x="7" y="7" width="3" height="9"/>
                        <rect x="14" y="7" width="3" height="9"/>
                    </svg>
                    ${setCount} sets
                </span>
                <span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 2L2 7v10c0 5.55 3.84 10 9 10s9-4.5 9-10V7l-10-5z"/>
                    </svg>
                    ${hasCompletedSets ? 'Completed' : 'Tap to start'}
                </span>
            </div>
        `;

        return card;
    }

    openExerciseModal(exerciseIndex) {
        this.currentExercise = exerciseIndex;
        const exercise = this.currentWorkout.exercises[exerciseIndex];
        
        const nameElement = document.getElementById('modalExerciseName');
        const muscleElement = document.getElementById('modalExerciseMuscle');
        const modal = document.getElementById('exerciseModal');
        
        if (nameElement) nameElement.textContent = exercise.name;
        if (muscleElement) muscleElement.textContent = exercise.muscle;
        if (modal) modal.classList.remove('hidden');
        
        this.renderSets();
        this.updateExerciseVolume();
    }

    closeModal() {
        const modal = document.getElementById('exerciseModal');
        if (modal) {
            modal.classList.add('hidden');
        }
        
        this.currentExercise = null;
        this.renderExercises();
        this.updateSessionVolume();
        this.updateFinishButtonVisibility();
    }

    renderSets() {
        const container = document.getElementById('setsContainer');
        if (!container || this.currentExercise === null) return;
        
        const exercise = this.currentWorkout.exercises[this.currentExercise];
        container.innerHTML = '';

        exercise.sets.forEach((set, index) => {
            const setRow = this.createSetRow(set, index);
            container.appendChild(setRow);
        });

        if (exercise.sets.length === 0) {
            this.addSet();
        }
    }

    createSetRow(setData, index) {
        const template = document.getElementById('setRowTemplate');
        if (!template) return null;
        
        const setRow = template.content.cloneNode(true);
        
        const setElement = setRow.querySelector('.set-row');
        const setNumber = setRow.querySelector('.set-number');
        const setType = setRow.querySelector('.set-type');
        const weightInput = setRow.querySelector('.weight-input');
        const repsInput = setRow.querySelector('.reps-input');
        const rpeInput = setRow.querySelector('.rpe-input');
        const startRestBtn = setRow.querySelector('.start-rest-btn');
        const deleteBtn = setRow.querySelector('.delete-set-btn');

        if (setNumber) setNumber.textContent = index + 1;
        
        if (setData) {
            if (setType) setType.value = setData.type || 'working';
            if (weightInput) weightInput.value = setData.weight || '';
            if (repsInput) repsInput.value = setData.reps || '';
            if (rpeInput) rpeInput.value = setData.rpe || '';
        }

        // Update set type styling
        if (setType) this.updateSetTypeColor(setType);

        // Add event listeners
        [setType, weightInput, repsInput, rpeInput].forEach(input => {
            if (input) {
                input.addEventListener('input', () => {
                    this.updateSet(index, {
                        type: setType ? setType.value : 'working',
                        weight: weightInput ? parseFloat(weightInput.value) || 0 : 0,
                        reps: repsInput ? parseInt(repsInput.value) || 0 : 0,
                        rpe: rpeInput ? parseInt(rpeInput.value) || null : null
                    });
                    
                    if (input === setType) {
                        this.updateSetTypeColor(setType);
                    }
                });
            }
        });

        if (startRestBtn) {
            startRestBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.showRestTimer();
            });
        }

        if (deleteBtn) {
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.deleteSet(index);
            });
        }

        return setElement;
    }

    updateSetTypeColor(setType) {
        const colors = {
            warmup: '#10b981',
            working: '#3b82f6',
            failure: '#ef4444'
        };
        
        if (setType) {
            setType.style.borderLeftColor = colors[setType.value] || colors.working;
            setType.style.borderLeftWidth = '4px';
        }
    }

    addSet() {
        if (this.currentExercise === null) return;
        
        const exercise = this.currentWorkout.exercises[this.currentExercise];
        exercise.sets.push({
            type: 'working',
            weight: 0,
            reps: 0,
            rpe: null
        });
        
        this.renderSets();
        this.updateExerciseVolume();
        this.saveWorkoutToStorage(false);
    }

    updateSet(index, setData) {
        if (this.currentExercise === null) return;
        
        const exercise = this.currentWorkout.exercises[this.currentExercise];
        exercise.sets[index] = setData;
        this.updateExerciseVolume();
        this.saveWorkoutToStorage(false);
    }

    deleteSet(index) {
        this.showConfirmModal(
            'Hapus Set',
            'Yakin ingin menghapus set ini?',
            () => {
                if (this.currentExercise !== null) {
                    const exercise = this.currentWorkout.exercises[this.currentExercise];
                    exercise.sets.splice(index, 1);
                    this.renderSets();
                    this.updateExerciseVolume();
                    this.saveWorkoutToStorage(false);
                }
            }
        );
    }

    finishExerciseAndStartRest() {
        if (this.currentExercise === null) return;
        
        const exercise = this.currentWorkout.exercises[this.currentExercise];
        const hasValidSets = exercise.sets.some(set => set.weight > 0 && set.reps > 0);
        
        if (!hasValidSets) {
            this.showAlert('Tambahkan minimal satu set dengan berat dan reps!');
            return;
        }
        
        this.closeModal();
        this.showRestTimer();
    }

    // Timer Functions
    showRestTimer() {
        const timer = document.getElementById('restTimer');
        if (timer) {
            timer.classList.remove('hidden');
            this.resetTimer();
        }
    }

    hideRestTimer() {
        const timer = document.getElementById('restTimer');
        if (timer) {
            timer.classList.add('hidden');
        }
        
        if (this.timerState.interval) {
            clearInterval(this.timerState.interval);
        }
        this.timerState.isRunning = false;
    }

    setTimerDuration(seconds) {
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const activeBtn = document.querySelector(`[data-time="${seconds}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }
        
        this.timerState.duration = seconds;
        this.timerState.remaining = seconds;
        this.updateTimerDisplay();
    }

    startTimer() {
        if (this.timerState.isRunning) return;
        
        this.timerState.isRunning = true;
        this.timerState.startTime = Date.now();
        
        const playBtn = document.getElementById('timerPlay');
        const pauseBtn = document.getElementById('timerPause');
        
        if (playBtn) playBtn.classList.add('hidden');
        if (pauseBtn) pauseBtn.classList.remove('hidden');
        
        this.timerState.interval = setInterval(() => {
            this.updateTimer();
        }, 100); // Update every 100ms for better accuracy
    }

    pauseTimer() {
        if (!this.timerState.isRunning) return;
        
        this.timerState.isRunning = false;
        clearInterval(this.timerState.interval);
        
        const playBtn = document.getElementById('timerPlay');
        const pauseBtn = document.getElementById('timerPause');
        
        if (playBtn) playBtn.classList.remove('hidden');
        if (pauseBtn) pauseBtn.classList.add('hidden');
    }

    resetTimer() {
        this.pauseTimer();
        this.timerState.remaining = this.timerState.duration;
        this.timerState.startTime = null;
        this.updateTimerDisplay();
    }

    updateTimer() {
        if (!this.timerState.isRunning || !this.timerState.startTime) return;
        
        const elapsed = Date.now() - this.timerState.startTime;
        const elapsedSeconds = Math.floor(elapsed / 1000);
        this.timerState.remaining = Math.max(0, this.timerState.duration - elapsedSeconds);
        
        this.updateTimerDisplay();
        
        if (this.timerState.remaining <= 0) {
            this.timerComplete();
        }
    }

    updateTimerDisplay() {
        const minutes = Math.floor(this.timerState.remaining / 60);
        const seconds = this.timerState.remaining % 60;
        
        const display = minutes > 0 ? 
            `${minutes}:${seconds.toString().padStart(2, '0')}` : 
            seconds.toString();
            
        const timerTime = document.getElementById('timerTime');
        if (timerTime) {
            timerTime.textContent = display;
        }
        
        // Update circle progress
        const progress = (this.timerState.duration - this.timerState.remaining) / this.timerState.duration;
        const degrees = progress * 360;
        const timerCircle = document.getElementById('timerCircle');
        if (timerCircle) {
            timerCircle.style.background = `conic-gradient(var(--color-primary) ${degrees}deg, var(--color-secondary) ${degrees}deg)`;
        }
    }

    timerComplete() {
        this.pauseTimer();
        
        // Visual feedback
        const timerContent = document.querySelector('.timer-content');
        if (timerContent) {
            timerContent.style.animation = 'volumePulse 0.5s ease-out 3';
        }
        
        // Audio feedback (if supported)
        this.playTimerSound();
        
        // Show completion message
        const timerTime = document.getElementById('timerTime');
        if (timerTime) {
            timerTime.textContent = 'DONE!';
        }
        
        // Auto-hide after 3 seconds
        setTimeout(() => {
            this.hideRestTimer();
        }, 3000);
    }

    playTimerSound() {
        try {
            // Create audio context for beep sound
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.5);
            
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.5);
        } catch (error) {
            console.log('Audio not supported');
        }
    }

    updateExerciseVolume() {
        if (this.currentExercise === null) return;
        
        const exercise = this.currentWorkout.exercises[this.currentExercise];
        const volume = this.calculateExerciseVolume(exercise);
        const volumeElement = document.getElementById('exerciseVolume');
        
        if (volumeElement) {
            volumeElement.textContent = `${volume.toFixed(1)} kg`;
            volumeElement.classList.add('volume-update');
            setTimeout(() => volumeElement.classList.remove('volume-update'), 300);
        }
    }

    updateSessionVolume() {
        if (!this.currentWorkout) return;
        
        const totalVolume = this.currentWorkout.exercises.reduce((total, exercise) => {
            return total + this.calculateExerciseVolume(exercise);
        }, 0);

        const volumeElement = document.getElementById('sessionVolume');
        if (volumeElement) {
            volumeElement.textContent = `${totalVolume.toFixed(1)} kg`;
            volumeElement.classList.add('volume-update');
            setTimeout(() => volumeElement.classList.remove('volume-update'), 300);
        }
    }

    calculateExerciseVolume(exercise) {
        return exercise.sets.reduce((volume, set) => {
            return volume + (set.weight * set.reps);
        }, 0);
    }

    updateFinishButtonVisibility() {
        const finishBtn = document.getElementById('finishWorkoutBtn');
        if (!finishBtn) return;
        
        const hasAnySets = this.currentWorkout && this.currentWorkout.exercises.some(exercise => 
            exercise.sets && exercise.sets.length > 0
        );
        
        if (hasAnySets) {
            finishBtn.classList.remove('btn--outline');
            finishBtn.classList.add('btn--primary');
            finishBtn.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="9,11 12,14 22,4"/>
                    <path d="M21,12v7a2,2,0,0,1-2,2H5a2,2,0,0,1-2-2V5a2,2,0,0,1,2-2h11"/>
                </svg>
                Selesaikan Workout
            `;
        } else {
            finishBtn.classList.add('btn--outline');
            finishBtn.classList.remove('btn--primary');
            finishBtn.innerHTML = 'Selesaikan Workout';
        }
    }

    finishWorkout() {
        const hasCompletedSets = this.currentWorkout.exercises.some(exercise => 
            exercise.sets.some(set => set.weight > 0 && set.reps > 0)
        );

        if (!hasCompletedSets) {
            this.showConfirmModal(
                'Workout Kosong',
                'Anda belum menambahkan set apapun. Yakin ingin menyelesaikan workout?',
                () => this.showProgressNotes()
            );
        } else {
            this.showProgressNotes();
        }
    }

    showProgressNotes() {
        // Stop timers
        if (this.durationInterval) {
            clearInterval(this.durationInterval);
        }
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
        }
        
        this.showScreen('progressNotes');
        document.getElementById('headerTitle').textContent = 'Progress Notes';
        
        // Calculate final duration
        const duration = this.workoutStartTime ? Date.now() - this.workoutStartTime : 0;
        const minutes = Math.floor(duration / 60000);
        const seconds = Math.floor((duration % 60000) / 1000);
        
        // Update summary stats
        const totalVolume = this.currentWorkout.exercises.reduce((total, exercise) => {
            return total + this.calculateExerciseVolume(exercise);
        }, 0);
        
        const totalSets = this.currentWorkout.exercises.reduce((total, exercise) => {
            return total + exercise.sets.length;
        }, 0);
        
        const completedExercises = this.currentWorkout.exercises.filter(exercise => 
            exercise.sets.length > 0 && exercise.sets.some(set => set.weight > 0 && set.reps > 0)
        ).length;

        const finalVolume = document.getElementById('finalVolume');
        const finalDuration = document.getElementById('finalDuration');
        const totalExercisesEl = document.getElementById('totalExercises');
        const totalSetsEl = document.getElementById('totalSets');

        if (finalVolume) finalVolume.textContent = `${totalVolume.toFixed(1)} kg`;
        if (finalDuration) finalDuration.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        if (totalExercisesEl) totalExercisesEl.textContent = completedExercises.toString();
        if (totalSetsEl) totalSetsEl.textContent = totalSets.toString();
    }

    saveWorkout() {
        // Get progress notes
        const highlightsEl = document.getElementById('highlights');
        const weakPointsEl = document.getElementById('weakPoints');
        const adjustmentsEl = document.getElementById('adjustments');
        const sessionRatingEl = document.getElementById('sessionRating');

        this.currentWorkout.notes = {
            highlights: highlightsEl ? highlightsEl.value : '',
            weakPoints: weakPointsEl ? weakPointsEl.value : '',
            adjustments: adjustmentsEl ? adjustmentsEl.value : '',
            sessionRating: sessionRatingEl ? parseInt(sessionRatingEl.value) : 7
        };

        // Calculate final stats
        this.currentWorkout.endTime = Date.now();
        this.currentWorkout.duration = this.currentWorkout.endTime - this.currentWorkout.startTime;
        this.currentWorkout.totalVolume = this.currentWorkout.exercises.reduce((total, exercise) => {
            return total + this.calculateExerciseVolume(exercise);
        }, 0);

        this.currentWorkout.totalSets = this.currentWorkout.exercises.reduce((total, exercise) => {
            return total + exercise.sets.length;
        }, 0);

        // Save to localStorage and IndexedDB
        this.saveWorkoutToStorage(true);

        // Show success message
        this.showSuccessMessage();

        // Reset and go home
        setTimeout(() => {
            this.resetWorkout();
            this.goHome();
            this.loadStats();
        }, 2000);
    }

    saveWorkoutToStorage(isComplete) {
        try {
            const workouts = this.getWorkouts();
            
            if (isComplete) {
                workouts.push(this.currentWorkout);
                localStorage.setItem('gymJournalWorkouts', JSON.stringify(workouts));
                
                // Also save to IndexedDB as backup
                this.saveToIndexedDB(this.currentWorkout);
            } else {
                // Auto-save current workout
                localStorage.setItem('gymJournalCurrentWorkout', JSON.stringify(this.currentWorkout));
            }
            
            return true;
        } catch (error) {
            console.error('Error saving workout:', error);
            this.updateAutoSaveStatus('❌ Save failed');
            return false;
        }
    }

    async saveToIndexedDB(workout) {
        try {
            const request = indexedDB.open('GymJournalDB', 1);
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains('workouts')) {
                    db.createObjectStore('workouts', { keyPath: 'startTime' });
                }
            };
            
            request.onsuccess = (event) => {
                const db = event.target.result;
                const transaction = db.transaction(['workouts'], 'readwrite');
                const store = transaction.objectStore('workouts');
                store.add(workout);
            };
        } catch (error) {
            console.error('IndexedDB error:', error);
        }
    }

    showSuccessMessage() {
        const form = document.getElementById('progressForm');
        if (!form) return;
        
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.innerHTML = `
            <h3>✅ Workout Tersimpan!</h3>
            <p>Progress Anda telah berhasil dicatat dan di-backup</p>
        `;
        
        form.insertBefore(successDiv, form.firstChild);
    }

    resetWorkout() {
        this.currentSplit = null;
        this.currentWorkout = null;
        this.currentExercise = null;
        this.workoutStartTime = null;
        
        // Clear intervals
        if (this.durationInterval) {
            clearInterval(this.durationInterval);
        }
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
        }
        
        // Clear auto-saved workout
        localStorage.removeItem('gymJournalCurrentWorkout');
        
        // Clear forms
        const progressForm = document.getElementById('progressForm');
        const sessionRating = document.getElementById('sessionRating');
        const ratingValue = document.getElementById('ratingValue');
        
        if (progressForm) progressForm.reset();
        if (sessionRating) sessionRating.value = 7;
        if (ratingValue) ratingValue.textContent = '7';
        
        // Remove success message
        const successMessage = document.querySelector('.success-message');
        if (successMessage) {
            successMessage.remove();
        }
    }

    // Data Management
    exportData() {
        try {
            const workouts = this.getWorkouts();
            const dataStr = JSON.stringify(workouts, null, 2);
            const dataBlob = new Blob([dataStr], {type: 'application/json'});
            
            const link = document.createElement('a');
            link.href = URL.createObjectURL(dataBlob);
            link.download = `gym-journal-backup-${new Date().toISOString().split('T')[0]}.json`;
            link.click();
            
            this.showAlert('Data berhasil diekspor!');
        } catch (error) {
            this.showAlert('Gagal mengekspor data: ' + error.message);
        }
    }

    importData() {
        const fileInput = document.getElementById('fileInput');
        if (fileInput) {
            fileInput.click();
        }
    }

    handleFileImport(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedWorkouts = JSON.parse(e.target.result);
                
                if (!Array.isArray(importedWorkouts)) {
                    throw new Error('Format file tidak valid');
                }
                
                this.showConfirmModal(
                    'Import Data',
                    `Import ${importedWorkouts.length} workout? Data lama akan digabung dengan data baru.`,
                    () => {
                        const existingWorkouts = this.getWorkouts();
                        const combinedWorkouts = [...existingWorkouts, ...importedWorkouts];
                        
                        localStorage.setItem('gymJournalWorkouts', JSON.stringify(combinedWorkouts));
                        this.loadStats();
                        this.showAlert('Data berhasil diimpor!');
                    }
                );
            } catch (error) {
                this.showAlert('Gagal mengimpor data: ' + error.message);
            }
        };
        reader.readAsText(file);
        
        // Reset file input
        event.target.value = '';
    }

    clearHistory() {
        this.showConfirmModal(
            'Hapus Semua Data',
            'PERINGATAN: Ini akan menghapus SEMUA riwayat workout Anda. Tindakan ini tidak dapat dibatalkan!',
            () => {
                localStorage.removeItem('gymJournalWorkouts');
                localStorage.removeItem('gymJournalCurrentWorkout');
                this.loadStats();
                this.renderHistory();
                this.showAlert('Semua data telah dihapus!');
            }
        );
    }

    // History and Stats
    showHistory() {
        this.showScreen('historyScreen');
        this.showBackButton();
        document.getElementById('headerTitle').textContent = 'Riwayat Workout';
        this.renderHistory();
    }

    renderHistory() {
        const container = document.getElementById('historyContainer');
        if (!container) return;
        
        const workouts = this.getWorkouts().reverse();
        
        if (workouts.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <h3>Belum ada riwayat workout</h3>
                    <p>Mulai workout pertama Anda untuk melihat progress</p>
                </div>
            `;
            return;
        }

        container.innerHTML = '';
        workouts.forEach(workout => {
            const historyItem = this.createHistoryItem(workout);
            container.appendChild(historyItem);
        });
    }

    createHistoryItem(workout) {
        const item = document.createElement('div');
        item.className = 'history-item';
        
        const date = new Date(workout.date || workout.startTime);
        const formattedDate = date.toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        const duration = workout.duration ? 
            `${Math.floor(workout.duration / 60000)}:${Math.floor((workout.duration % 60000) / 1000).toString().padStart(2, '0')}` : 
            '--:--';

        const completedExercises = workout.exercises.filter(exercise => 
            exercise.sets.length > 0 && exercise.sets.some(set => set.weight > 0 && set.reps > 0)
        ).length;

        item.innerHTML = `
            <div class="history-header-info">
                <div>
                    <h3>${this.splitTitles[workout.split].title}</h3>
                    <div class="history-date">${formattedDate} • ${duration}</div>
                </div>
                <div class="history-split">${workout.split.toUpperCase()}</div>
            </div>
            <div class="history-stats">
                <div class="stat-item">
                    <span class="stat-value">${workout.totalVolume?.toFixed(1) || '0.0'} kg</span>
                    <span class="stat-label">Volume</span>
                </div>
                <div class="stat-item">
                    <span class="stat-value">${completedExercises}</span>
                    <span class="stat-label">Exercises</span>
                </div>
                <div class="stat-item">
                    <span class="stat-value">${workout.totalSets || 0}</span>
                    <span class="stat-label">Sets</span>
                </div>
            </div>
        `;

        return item;
    }

    loadStats() {
        const workouts = this.getWorkouts();
        
        // Total workouts
        const totalWorkoutsEl = document.getElementById('totalWorkouts');
        if (totalWorkoutsEl) {
            totalWorkoutsEl.textContent = workouts.length.toString();
        }
        
        // This week workouts
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const thisWeekWorkouts = workouts.filter(workout => 
            new Date(workout.date || workout.startTime) >= oneWeekAgo
        );
        const thisWeekEl = document.getElementById('thisWeek');
        if (thisWeekEl) {
            thisWeekEl.textContent = thisWeekWorkouts.length.toString();
        }
        
        // Total volume
        const totalVolume = workouts.reduce((total, workout) => 
            total + (workout.totalVolume || 0), 0
        );
        
        const totalVolumeEl = document.getElementById('totalVolume');
        if (totalVolumeEl) {
            if (totalVolume >= 1000) {
                totalVolumeEl.textContent = `${(totalVolume / 1000).toFixed(1)}t`;
            } else {
                totalVolumeEl.textContent = `${totalVolume.toFixed(0)}kg`;
            }
        }
    }

    getWorkouts() {
        const workouts = localStorage.getItem('gymJournalWorkouts');
        return workouts ? JSON.parse(workouts) : [];
    }

    // UI Helpers
    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        const targetScreen = document.getElementById(screenId);
        if (targetScreen) {
            targetScreen.classList.add('active');
        }
    }

    showBackButton() {
        const backBtn = document.getElementById('backBtn');
        if (backBtn) {
            backBtn.classList.remove('hidden');
        }
    }

    hideBackButton() {
        const backBtn = document.getElementById('backBtn');
        if (backBtn) {
            backBtn.classList.add('hidden');
        }
    }

    showConfirmModal(title, message, onConfirm) {
        const titleEl = document.getElementById('confirmTitle');
        const messageEl = document.getElementById('confirmMessage');
        const modal = document.getElementById('confirmModal');
        const okBtn = document.getElementById('confirmOk');
        
        if (titleEl) titleEl.textContent = title;
        if (messageEl) messageEl.textContent = message;
        if (modal) modal.classList.remove('hidden');
        
        if (okBtn) {
            okBtn.onclick = () => {
                this.hideConfirmModal();
                onConfirm();
            };
        }
    }

    hideConfirmModal() {
        const modal = document.getElementById('confirmModal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    showAlert(message) {
        // Simple alert for now - could be enhanced with custom modal
        alert(message);
    }

    goBack() {
        const currentScreen = document.querySelector('.screen.active');
        
        if (currentScreen && currentScreen.id === 'exerciseList') {
            if (this.currentWorkout) {
                this.showConfirmModal(
                    'Keluar dari Workout',
                    'Workout sedang berlangsung dan akan auto-save. Yakin ingin kembali?',
                    () => {
                        this.saveWorkoutToStorage(false);
                        this.goHome();
                    }
                );
            } else {
                this.goHome();
            }
        } else if (currentScreen && currentScreen.id === 'progressNotes') {
            this.showExerciseList();
        } else if (currentScreen && currentScreen.id === 'historyScreen') {
            this.goHome();
        } else if (currentScreen && currentScreen.id === 'workoutSetup') {
            this.goHome();
        }
    }

    goHome() {
        this.showScreen('splitSelection');
        this.hideBackButton();
        document.getElementById('headerTitle').textContent = 'Gym Journal Pro';
        
        // Clear timers but don't reset workout data (for auto-save recovery)
        if (this.durationInterval) {
            clearInterval(this.durationInterval);
        }
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
        }
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new GymJournalPro();
});

// Service Worker registration for PWA functionality
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('SW registered: ', registration);
            })
            .catch((registrationError) => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}