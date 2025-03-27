const animalInput = document.getElementById('animalInput');
const animalList = document.getElementById('animalList');
const factDisplay = document.getElementById('factDisplay');
const typeFilterButtons = document.querySelectorAll('.type-filter button');
const animalForm = document.getElementById('animalForm');
const imageInput = document.getElementById('imageInput');
const factsInput = document.getElementById('factsInput');
const typeInput = document.getElementById('typeInput');
const editForm = document.getElementById('editForm');
const editName = document.getElementById('editName');
const editImage = document.getElementById('editImage');
const editFacts = document.getElementById('editFacts');
const editType = document.getElementById('editType');
const editId = document.getElementById('editId');

let animalsData = [];
async function fetchAnimals() {
    try {
        const response = await fetch('https://my-app-backend-ziqa.onrender.com/api/animals');
        const data = await response.json();
        animalsData = data;
        renderAnimalList(animalsData);
    } catch (error) {
        console.error('Error fetching animal data:', error);
        animalList.innerHTML = '<p>Failed to load animals. Please try again later.</p>';
    }
}

function renderAnimalList(filteredAnimals) {
    animalList.innerHTML = '';
    filteredAnimals.forEach(animal => {
        const li = document.createElement('li');
        li.textContent = animal.name;
        li.dataset.id = animal.id;
        li.addEventListener('click', () => displayAnimalDetails(animal));
        animalList.appendChild(li);
    });
}

function displayAnimalDetails(animal) {
    factDisplay.innerHTML = '';
    const detailsHTML = `
        <div>
            <h2>${animal.name}</h2>
            ${animal.image ? `<img src="${animal.image}" alt="${animal.name}">` : ''}
            <h3>Interesting Facts:</h3>
            <ul>${animal.facts.map(fact => `<li>${fact}</li>`).join('')}</ul>
            <p>Type: ${animal.type.charAt(0).toUpperCase() + animal.type.slice(1)}</p>
            <p>Animal ID: ${animal.id}</p>
            <button onclick="loadEditForm(${animal.id})">Edit</button>
        </div>
    `;
    factDisplay.innerHTML = detailsHTML;
}

animalInput.addEventListener('input', () => {
    const searchTerm = animalInput.value.toLowerCase();
    const filteredAnimals = animalsData.filter(animal => 
        animal.name.toLowerCase().includes(searchTerm)
    );
    renderAnimalList(filteredAnimals);
});

typeFilterButtons.forEach(button => {
    button.addEventListener('click', () => {
        typeFilterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        const type = button.dataset.type;
        let filteredAnimals = animalsData;
        if (type !== 'all') {
            filteredAnimals = animalsData.filter(animal => animal.type === type);
        }
        renderAnimalList(filteredAnimals);
    });
});

animalForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const newId = animalsData.length > 0 ? Math.max(...animalsData.map(a => parseInt(a.id))) + 1 : 1;
    
    const newAnimal = {
        id: newId.toString(),
        name: animalInput.value,
        image: imageInput.value,
        facts: factsInput.value.split(',').map(fact => fact.trim()),
        type: typeInput.value,
    };
    
    try {
        const response = await fetch('https://my-app-backend-ziqa.onrender.com/api/animals', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newAnimal)
        });
        if (!response.ok) throw new Error('Failed to add animal');
        const addedAnimal = await response.json();
        animalsData.push(addedAnimal);
        renderAnimalList(animalsData);
        animalForm.reset();
    } catch (error) {
        console.error('Error adding animal:', error);
    }
});

function loadEditForm(animalId) {
    const animal = animalsData.find(a => a.id == animalId);
    if (!animal) return;
    editId.value = animal.id;
    editName.value = animal.name;
    editImage.value = animal.image;
    editFacts.value = animal.facts.join(', ');
    editType.value = animal.type;
    editForm.style.display = 'block';
}

editForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    
    const updatedAnimal = {
        name: editName.value,
        image: editImage.value,
        facts: editFacts.value.split(',').map(fact => fact.trim()),
        type: editType.value
    };
    
    try {
        const response = await fetch(`https://my-app-backend-ziqa.onrender.com/api/animals/${editId.value}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedAnimal)
        });
        if (!response.ok) throw new Error('Failed to update animal');
        
        animalsData = animalsData.map(a => a.id == editId.value ? { ...a, ...updatedAnimal } : a);
        renderAnimalList(animalsData);
        factDisplay.innerHTML = '';
        editForm.style.display = 'none';
    } catch (error) {
        console.error('Error updating animal:', error);
    }
});
fetchAnimals();
