const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('particles'), alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);

const particles = new THREE.BufferGeometry();
const particleCount = 1000;
const posArray = new Float32Array(particleCount * 3);

for (let i = 0; i < particleCount * 3; i++) {
    posArray[i] = (Math.random() - 0.5) * 5;
}

particles.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
const material = new THREE.PointsMaterial({ size: 0.006, color: 0x00ff00 });
const particlesMesh = new THREE.Points(particles, material);
scene.add(particlesMesh);

camera.position.z = 3;

function animateParticles() {
    requestAnimationFrame(animateParticles);
    particlesMesh.rotation.x += 0.0001;
    particlesMesh.rotation.y += 0.0001;
    renderer.render(scene, camera);
}
animateParticles();

const username = 'RocketGod-git';
let perPage = 12;
let currentPage = 1;
let allRepos = [];

async function fetchRepos() {
    try {
        let page = 1;
        let hasNextPage = true;

        while (hasNextPage) {
            const response = await fetch(`https://api.github.com/users/${username}/repos?per_page=100&page=${page}&type=owner`);
            const repos = await response.json();
            
            if (repos.length === 0) {
                hasNextPage = false;
            } else {
                allRepos = allRepos.concat(repos);
                page++;
            }
        }

        allRepos = allRepos.filter(repo => !repo.fork)
                           .sort((a, b) => b.stargazers_count - a.stargazers_count);
        updateRepoList();
        updateStats();
    } catch (error) {
        document.getElementById('loading').textContent = 'Error loading repositories. Please try again later.';
    }
}

function updateRepoList() {
    const repoList = document.getElementById('repo-list');
    repoList.innerHTML = '';
    const startIndex = (currentPage - 1) * perPage;
    const endIndex = startIndex + perPage;
    const currentRepos = allRepos.slice(startIndex, endIndex);

    if (currentRepos.length === 0) {
        document.getElementById('loading').textContent = 'No repositories found.';
        return;
    }

    currentRepos.forEach(repo => {
        const repoCard = document.createElement('div');
        repoCard.className = 'repo-card';
        repoCard.innerHTML = `
            <h3><a href="${repo.html_url}" target="_blank">${repo.name}</a></h3>
            <p>⭐ ${repo.stargazers_count} | 🍴 ${repo.forks_count}</p>
            <p>${repo.description || 'No description available.'}</p>
        `;
        repoList.appendChild(repoCard);
    });

    document.getElementById('loading').style.display = 'none';
    
    document.getElementById('prev-page').disabled = currentPage === 1;
    document.getElementById('next-page').disabled = currentPage >= Math.ceil(allRepos.length / perPage);

    document.getElementById('repo-count').textContent = `Showing ${startIndex + 1}-${Math.min(endIndex, allRepos.length)} of ${allRepos.length} repositories`;
}

function updateStats() {
    const totalStars = allRepos.reduce((sum, repo) => sum + repo.stargazers_count, 0);
    const totalForks = allRepos.reduce((sum, repo) => sum + repo.forks_count, 0);

    document.getElementById('total-stars').textContent = totalStars;
    document.getElementById('total-forks').textContent = totalForks;
}

document.getElementById('prev-page').addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        updateRepoList();
    }
});

document.getElementById('next-page').addEventListener('click', () => {
    if (currentPage < Math.ceil(allRepos.length / perPage)) {
        currentPage++;
        updateRepoList();
    }
});

document.getElementById('view-all').addEventListener('click', () => {
    perPage = allRepos.length;
    currentPage = 1;
    updateRepoList();
    document.querySelector('.pagination').style.display = 'none';
});

fetchRepos();

const bouncingImage = document.getElementById('bouncing-image');
bouncingImage.src = base64Image;
let x = Math.random() * (window.innerWidth - 150);
let y = Math.random() * (window.innerHeight - 150);
let velocityX = (Math.random() > 0.5 ? 1 : -1) * 2;
let velocityY = (Math.random() > 0.5 ? 1 : -1) * 2;
const baseSpeed = 2;
const maxSpeed = 15;
const hitForceMultiplier = 0.4;
const friction = 0.99;
const hitRadius = 100;

let lastTouchPos = { x: 0, y: 0 };
let currentTouchId = null;
let lastTime = performance.now();

function checkImageHit(clientX, clientY, velocity) {
    const imageCenter = {
        x: x + 75,
        y: y + 75
    };
    const distance = Math.sqrt(
        Math.pow(clientX - imageCenter.x, 2) +
        Math.pow(clientY - imageCenter.y, 2)
    );
    if (distance < hitRadius) {
        velocityX += velocity.x * hitForceMultiplier;
        velocityY += velocity.y * hitForceMultiplier;
        const currentSpeed = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
        if (currentSpeed > maxSpeed) {
            const scale = maxSpeed / currentSpeed;
            velocityX *= scale;
            velocityY *= scale;
        }
        return true;
    }
    return false;
}

function animateBounce(currentTime) {
    const deltaTime = (currentTime - lastTime) / 16.67;
    lastTime = currentTime;

    x += velocityX * deltaTime;
    y += velocityY * deltaTime;

    if (x + 150 > window.innerWidth) {
        x = window.innerWidth - 150;
        velocityX = -Math.abs(velocityX) * 0.8;
    }
    if (x < 0) {
        x = 0;
        velocityX = Math.abs(velocityX) * 0.8;
    }
    if (y + 150 > window.innerHeight) {
        y = window.innerHeight - 150;
        velocityY = -Math.abs(velocityY) * 0.8;
    }
    if (y < 0) {
        y = 0;
        velocityY = Math.abs(velocityY) * 0.8;
    }

    velocityX *= friction;
    velocityY *= friction;

    const currentSpeed = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
    if (currentSpeed < baseSpeed && currentSpeed > 0.1) {
        const scale = baseSpeed / currentSpeed;
        velocityX *= scale;
        velocityY *= scale;
    }

    bouncingImage.style.transform = `translate(${x}px, ${y}px)`;
    requestAnimationFrame(animateBounce);
}

function handleTouchStart(e) {
    if (!currentTouchId) {
        const touch = e.touches[0];
        currentTouchId = touch.identifier;
        lastTouchPos.x = touch.clientX;
        lastTouchPos.y = touch.clientY;
        checkImageHit(touch.clientX, touch.clientY, { x: 0, y: 0 });
    }
}

function handleTouchMove(e) {
    const touch = Array.from(e.touches).find(t => t.identifier === currentTouchId);
    if (touch) {
        const clientX = touch.clientX;
        const clientY = touch.clientY;
        const velocity = {
            x: (clientX - lastTouchPos.x) * 0.5,
            y: (clientY - lastTouchPos.y) * 0.5
        };
        checkImageHit(clientX, clientY, velocity);
        lastTouchPos.x = clientX;
        lastTouchPos.y = clientY;
    }
}

function handleTouchEnd(e) {
    if (e.touches.length === 0 || !Array.from(e.touches).some(t => t.identifier === currentTouchId)) {
        currentTouchId = null;
    }
}

function handleMouseMove(e) {
    const clientX = e.clientX;
    const clientY = e.clientY;
    const velocity = {
        x: (clientX - lastTouchPos.x) * 0.5,
        y: (clientY - lastTouchPos.y) * 0.5
    };
    checkImageHit(clientX, clientY, velocity);
    lastTouchPos.x = clientX;
    lastTouchPos.y = clientY;
}

document.addEventListener('DOMContentLoaded', function() {
    const h1Element = document.querySelector('h1');
    const headerText = h1Element.textContent;
    h1Element.textContent = '';
    h1Element.id = 'rocketgod-header';
    
    for (let i = 0; i < headerText.length; i++) {
        const span = document.createElement('span');
        span.className = 'header-letter';
        span.textContent = headerText[i];
        h1Element.appendChild(span);
    }
    
    const letterElements = document.querySelectorAll('.header-letter');
    const letterObjects = Array.from(letterElements).map(letter => {
        const rect = letter.getBoundingClientRect();
        return {
            element: letter,
            x: rect.left,
            y: rect.top,
            width: rect.width,
            height: rect.height,
            centerX: rect.left + rect.width / 2,
            isActive: false
        };
    });
    
    function updateLetterPositions() {
        letterObjects.forEach(letter => {
            const rect = letter.element.getBoundingClientRect();
            letter.x = rect.left;
            letter.y = rect.top;
            letter.width = rect.width;
            letter.height = rect.height;
            letter.centerX = rect.left + rect.width / 2;
        });
    }
    
    window.addEventListener('resize', updateLetterPositions);
    
    function handleHeaderInteraction(clientX, clientY) {
        letterObjects.forEach(letter => {
            const distX = Math.abs(clientX - letter.centerX);
            const distY = Math.abs(clientY - letter.y);
            const interactionRadius = 80;
            
            if (distX < interactionRadius && distY < interactionRadius) {
                const strength = 1 - Math.min(1, Math.sqrt(distX * distX + distY * distY) / interactionRadius);
                const drip = 1 + strength * 1.5;
                
                letter.element.style.transform = `scaleY(${drip})`;
                letter.element.classList.add('dripping');
                letter.isActive = true;
            } else if (letter.isActive) {
                letter.element.style.transform = '';
                letter.element.classList.remove('dripping');
                letter.isActive = false;
            }
        });
    }
    
    document.addEventListener('mousemove', (e) => {
        handleHeaderInteraction(e.clientX, e.clientY);
    });
    
    document.addEventListener('touchmove', (e) => {
        Array.from(e.touches).forEach(touch => {
            handleHeaderInteraction(touch.clientX, touch.clientY);
        });
    }, { passive: true });
    
    function resetAllLetters() {
        letterObjects.forEach((letter, index) => {
            setTimeout(() => {
                letter.element.style.transform = '';
                letter.element.classList.remove('dripping');
                letter.isActive = false;
            }, index * 50);
        });
    }
    
    document.addEventListener('mouseleave', resetAllLetters);
    document.addEventListener('touchend', resetAllLetters);
    
    updateLetterPositions();
});

document.addEventListener('touchstart', handleTouchStart, { passive: true });
document.addEventListener('touchmove', handleTouchMove, { passive: true });
document.addEventListener('touchend', handleTouchEnd, { passive: true });
document.addEventListener('mousemove', handleMouseMove, { passive: true });

requestAnimationFrame(animateBounce);

window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});

gsap.fromTo('.project-card',
    { opacity: 0, y: 20 },
    { opacity: 1, y: 0, stagger: 0.05, duration: 0.5, ease: 'power2.out' }
);