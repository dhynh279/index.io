// Workout Tracker Animation
document.addEventListener('DOMContentLoaded', function() {
    // Canvas setup
    const canvas = document.getElementById('workoutCanvas');
    const ctx = canvas.getContext('2d');
    
    // Responsive canvas sizing
    function resizeCanvas() {
        const container = canvas.parentElement;
        const maxWidth = Math.min(800, container.clientWidth - 40);
        canvas.style.width = maxWidth + 'px';
        canvas.style.height = (maxWidth * 0.5) + 'px';
    }
    
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    
    // Animation variables
    let animationId = null;
    let isAnimating = false;
    let isPaused = false;
    let startTime = null;
    let elapsedTime = 0;
    let totalReps = 0;
    let currentWeight = 135;
    let caloriesBurned = 0;
    let progress = 0;
    
    // Exercise progress
    let benchSets = 0;
    let squatSets = 0;
    let deadliftSets = 0;
    let pressSets = 0;
    
    // Barbell properties
    const barbell = {
        x: canvas.width / 2,
        y: 300,
        width: 300,
        height: 10,
        plates: [],
        isLifting: false,
        liftDirection: 1,
        liftProgress: 0
    };
    
    // Add initial plates
    barbell.plates = [
        { weight: 45, color: '#e94560', width: 30, height: 60 },
        { weight: 45, color: '#e94560', width: 30, height: 60 }
    ];
    
    // DOM Elements
    const startBtn = document.getElementById('startBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    const resetBtn = document.getElementById('resetBtn');
    const addWeightBtn = document.getElementById('addWeightBtn');
    const currentWeightEl = document.getElementById('currentWeight');
    const totalRepsEl = document.getElementById('totalReps');
    const workoutTimeEl = document.getElementById('workoutTime');
    const caloriesBurnedEl = document.getElementById('caloriesBurned');
    const progressFill = document.getElementById('progressFill');
    const progressPercent = document.getElementById('progressPercent');
    
    // Exercise progress elements
    const benchProgress = document.getElementById('benchProgress');
    const squatProgress = document.getElementById('squatProgress');
    const deadliftProgress = document.getElementById('deadliftProgress');
    const pressProgress = document.getElementById('pressProgress');
    
    // Draw functions
    function drawBarbell() {
        // Draw barbell bar
        ctx.fillStyle = '#cccccc';
        ctx.fillRect(barbell.x - barbell.width/2, barbell.y, barbell.width, barbell.height);
        
        // Draw plates on both sides
        let plateOffset = barbell.width/2 - 10;
        barbell.plates.forEach((plate, index) => {
            const side = index % 2 === 0 ? -1 : 1;
            const x = barbell.x + (side * plateOffset);
            
            ctx.fillStyle = plate.color;
            ctx.fillRect(x - plate.width/2, barbell.y - plate.height, plate.width, plate.height);
            
            // Plate label
            ctx.fillStyle = 'white';
            ctx.font = 'bold 14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(plate.weight + 'lbs', x, barbell.y - plate.height/2);
            
            plateOffset -= 35;
        });
        
        // Draw lifter
        drawLifter();
    }
    
    function drawLifter() {
        const liftHeight = 50 * Math.sin(barbell.liftProgress * Math.PI);
        const y = barbell.y - 50 - liftHeight;
        
        // Head
        ctx.fillStyle = '#ffcc99';
        ctx.beginPath();
        ctx.arc(barbell.x, y - 20, 15, 0, Math.PI * 2);
        ctx.fill();
        
        // Body
        ctx.fillStyle = '#0f3460';
        ctx.fillRect(barbell.x - 10, y, 20, 60);
        
        // Arms holding barbell
        ctx.fillStyle = '#ffcc99';
        ctx.fillRect(barbell.x - barbell.width/2, y + 15, barbell.width, 10);
        
        // Legs
        ctx.fillStyle = '#16213e';
        ctx.fillRect(barbell.x - 8, y + 60, 8, 40);
        ctx.fillRect(barbell.x, y + 60, 8, 40);
    }
    
    function drawStats() {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.fillRect(20, 20, 200, 100);
        
        ctx.fillStyle = 'white';
        ctx.font = '16px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('Workout Stats', 30, 40);
        
        ctx.font = '14px Arial';
        ctx.fillText(`Weight: ${currentWeight} lbs`, 30, 65);
        ctx.fillText(`Reps: ${totalReps}`, 30, 85);
        ctx.fillText(`Sets: ${benchSets + squatSets + deadliftSets + pressSets}`, 30, 105);
    }
    
    function drawBackground() {
        // Gradient background
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#0d0d1a');
        gradient.addColorStop(1, '#1a1a2e');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Gym floor
        ctx.fillStyle = '#2a2a4a';
        ctx.fillRect(0, 350, canvas.width, 50);
        
        // Floor pattern
        ctx.strokeStyle = '#0f3460';
        ctx.lineWidth = 2;
        for(let i = 0; i < canvas.width; i += 40) {
            ctx.beginPath();
            ctx.moveTo(i, 350);
            ctx.lineTo(i, 400);
            ctx.stroke();
        }
    }
    
    function animate() {
        drawBackground();
        
        // Update barbell position if lifting
        if (barbell.isLifting && !isPaused) {
            barbell.liftProgress += 0.02 * barbell.liftDirection;
            if (barbell.liftProgress >= 1) {
                barbell.liftDirection = -1;
                totalReps++;
                updateReps();
                updateCalories();
                
                // Randomly complete exercise sets
                if (Math.random() > 0.7) {
                    completeRandomSet();
                }
            } else if (barbell.liftProgress <= 0) {
                barbell.liftDirection = 1;
            }
        }
        
        drawBarbell();
        drawStats();
        
        if (isAnimating && !isPaused) {
            animationId = requestAnimationFrame(animate);
        }
    }
    
    // Update functions
    function updateStats() {
        currentWeightEl.textContent = currentWeight;
        totalRepsEl.textContent = totalReps;
        
        // Update time
        if (startTime && !isPaused) {
            elapsedTime = Date.now() - startTime;
        }
        const minutes = Math.floor(elapsedTime / 60000);
        const seconds = Math.floor((elapsedTime % 60000) / 1000);
        workoutTimeEl.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        // Update progress
        progress = Math.min((totalReps / 50) * 100, 100);
        progressFill.style.width = `${progress}%`;
        progressPercent.textContent = `${Math.round(progress)}%`;
        
        caloriesBurnedEl.textContent = caloriesBurned;
    }
    
    function updateReps() {
        totalRepsEl.classList.add('weight-lift');
        setTimeout(() => {
            totalRepsEl.classList.remove('weight-lift');
        }, 1000);
    }
    
    function updateCalories() {
        caloriesBurned = Math.floor(totalReps * 0.5);
    }
    
    function completeRandomSet() {
        const exercises = ['bench', 'squat', 'deadlift', 'press'];
        const randomExercise = exercises[Math.floor(Math.random() * exercises.length)];
        
        switch(randomExercise) {
            case 'bench':
                benchSets = Math.min(benchSets + 1, 4);
                benchProgress.textContent = `${benchSets}/4 sets completed`;
                break;
            case 'squat':
                squatSets = Math.min(squatSets + 1, 4);
                squatProgress.textContent = `${squatSets}/4 sets completed`;
                break;
            case 'deadlift':
                deadliftSets = Math.min(deadliftSets + 1, 3);
                deadliftProgress.textContent = `${deadliftSets}/3 sets completed`;
                break;
            case 'press':
                pressSets = Math.min(pressSets + 1, 3);
                pressProgress.textContent = `${pressSets}/3 sets completed`;
                break;
        }
        
        // Add visual feedback
        const element = document.getElementById(`${randomExercise}Progress`);
        element.classList.add('pulse');
        setTimeout(() => {
            element.classList.remove('pulse');
        }, 2000);
    }
    
    // Event Handlers
    startBtn.addEventListener('click', function() {
        if (!isAnimating) {
            isAnimating = true;
            isPaused = false;
            startTime = Date.now() - elapsedTime;
            barbell.isLifting = true;
            
            startBtn.disabled = true;
            pauseBtn.disabled = false;
            addWeightBtn.disabled = false;
            
            animate();
        }
    });
    
    pauseBtn.addEventListener('click', function() {
        if (isAnimating) {
            isPaused = !isPaused;
            pauseBtn.textContent = isPaused ? 'Resume' : 'Pause';
            
            if (!isPaused) {
                startTime = Date.now() - elapsedTime;
                animate();
            }
        }
    });
    
    resetBtn.addEventListener('click', function() {
        // Reset everything
        isAnimating = false;
        isPaused = false;
        elapsedTime = 0;
        totalReps = 0;
        currentWeight = 135;
        caloriesBurned = 0;
        progress = 0;
        
        benchSets = 0;
        squatSets = 0;
        deadliftSets = 0;
        pressSets = 0;
        
        barbell.isLifting = false;
        barbell.liftProgress = 0;
        barbell.liftDirection = 1;
        barbell.plates = [
            { weight: 45, color: '#e94560', width: 30, height: 60 },
            { weight: 45, color: '#e94560', width: 30, height: 60 }
        ];
        
        // Reset UI
        startBtn.disabled = false;
        pauseBtn.disabled = true;
        pauseBtn.textContent = 'Pause';
        addWeightBtn.disabled = false;
        
        // Clear animation
        if (animationId) {
            cancelAnimationFrame(animationId);
        }
        
        // Reset progress bars
        progressFill.style.width = '0%';
        progressPercent.textContent = '0%';
        
        // Reset exercise progress
        benchProgress.textContent = '0/4 sets completed';
        squatProgress.textContent = '0/4 sets completed';
        deadliftProgress.textContent = '0/3 sets completed';
        pressProgress.textContent = '0/3 sets completed';
        
        // Update stats and redraw
        updateStats();
        drawBackground();
        drawBarbell();
        drawStats();
    });
    
    addWeightBtn.addEventListener('click', function() {
        const newWeight = currentWeight <= 315 ? 45 : 25;
        currentWeight += newWeight;
        
        // Add visual plate
        const plateColor = newWeight === 45 ? '#e94560' : '#ff6b81';
        barbell.plates.push(
            { weight: newWeight, color: plateColor, width: 30, height: 60 }
        );
        
        // Visual feedback
        currentWeightEl.classList.add('weight-lift');
        setTimeout(() => {
            currentWeightEl.classList.remove('weight-lift');
        }, 1000);
        
        // Update display
        updateStats();
    });
    
    // Initialize
    drawBackground();
    drawBarbell();
    drawStats();
    updateStats();
});