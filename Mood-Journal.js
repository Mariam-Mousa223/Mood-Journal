let journalEntries = JSON.parse(localStorage.getItem('moodEntries')) || [];
let selectedRating = 3;
let editIndex = null;
let currentFilter = 'all';

const ratingBtns = document.querySelectorAll('.rate-btn');
const noteInput = document.getElementById('noteInput');
const saveBtn = document.getElementById('saveBtn');
const saveBtnText = document.getElementById('saveBtnText');
const cancelBtn = document.getElementById('cancelBtn');
const formTitle = document.getElementById('formTitle');
const journalList = document.getElementById('journalList');
const countBadge = document.getElementById('countBadge');
const filterBtns = document.querySelectorAll('.filter-btn');

const emojis = { 1: '😢', 2: '😕', 3: '😐', 4: '🙂', 5: '😄' };

// Handle Rating Button Click
ratingBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        ratingBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedRating = parseInt(btn.dataset.value);
    });
});

// Render Journal Entries (Sorted by Date - Latest First)
function renderEntries() {
    journalList.innerHTML = '';

    // Sort by timestamp descending
    let sorted = [...journalEntries].sort((a, b) => b.timestamp - a.timestamp);

    // Apply Filter
    const filtered = sorted.filter(entry => {
        if (currentFilter === 'good') return entry.rating >= 4;
        if (currentFilter === 'neutral') return entry.rating === 3;
        if (currentFilter === 'low') return entry.rating <= 2;
        return true;
    });

    countBadge.textContent = filtered.length;

    if (filtered.length === 0) {
        journalList.innerHTML = `<div style="text-align:center; color:#64748b; padding:40px; font-size:14px;">No mood entries found.</div>`;
        return;
    }

    filtered.forEach((entry) => {
        // Find original index for editing/deleting correctly
        const originalIndex = journalEntries.indexOf(entry);
        
        const card = document.createElement('div');
        card.className = 'entry-card';

        let badgeClass = 'bg-neutral';
        if (entry.rating >= 4) badgeClass = 'bg-good';
        if (entry.rating <= 2) badgeClass = 'bg-low';

        card.innerHTML = `
            <div class="entry-left">
                <div class="mood-badge ${badgeClass}">${emojis[entry.rating]} ${entry.rating}</div>
                <div class="entry-body">
                    <span class="entry-date">${entry.date}</span>
                    <p class="entry-note">${entry.note || '<em>No notes added.</em>'}</p>
                </div>
            </div>
            <div class="entry-actions">
                <button onclick="editEntry(${originalIndex})" class="btn-edit">✏️ Edit</button>
                <button onclick="deleteEntry(${originalIndex})" class="btn-delete">🗑️ Delete</button>
            </div>
        `;
        journalList.appendChild(card);
    });
}

// Save or Update Entry
function saveEntry() {
    const note = noteInput.value.trim();
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', { 
        month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' 
    });

    if (editIndex !== null) {
        journalEntries[editIndex] = { 
            rating: selectedRating, 
            note, 
            date: dateStr, 
            timestamp: journalEntries[editIndex].timestamp || Date.now() 
        };
        editIndex = null;
    } else {
        journalEntries.push({ 
            rating: selectedRating, 
            note, 
            date: dateStr, 
            timestamp: Date.now() 
        });
    }

    localStorage.setItem('moodEntries', JSON.stringify(journalEntries));
    resetForm();
    renderEntries();
}

// Edit Entry
window.editEntry = function(index) {
    editIndex = index;
    const entry = journalEntries[index];
    
    selectedRating = entry.rating;
    ratingBtns.forEach(b => {
        b.classList.toggle('active', parseInt(b.dataset.value) === selectedRating);
    });

    noteInput.value = entry.note;
    formTitle.textContent = 'Edit Mood Entry';
    saveBtnText.textContent = 'Update Entry';
    cancelBtn.classList.remove('hidden');
    noteInput.focus();
};

// Delete Entry
window.deleteEntry = function(index) {
    journalEntries.splice(index, 1);
    localStorage.setItem('moodEntries', JSON.stringify(journalEntries));
    renderEntries();
};

// Reset Form
function resetForm() {
    selectedRating = 3;
    ratingBtns.forEach(b => b.classList.toggle('active', parseInt(b.dataset.value) === 3));
    noteInput.value = '';
    editIndex = null;
    formTitle.textContent = "Log Today's Mood";
    saveBtnText.textContent = 'Save Entry';
    cancelBtn.classList.add('hidden');
}

// Event Listeners
saveBtn.addEventListener('click', saveEntry);
cancelBtn.addEventListener('click', resetForm);

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        renderEntries();
    });
});

// Initial Render
renderEntries();
