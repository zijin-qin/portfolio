console.log('IT’S ALIVE!');

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

let pages = [
    { url: '', title: 'Home' },
    { url: 'projects/', title: 'Projects' },
    { url: 'contact/', title: 'Contact Me' },
    { url: 'resume/', title: 'Resume' },
    { url: 'meta/', title: 'Meta' },
    { url: 'https://github.com/zijin-qin', title: 'My GitHub' }
];

let nav = document.createElement('nav');
document.body.prepend(nav);

for (let p of pages) {
    let url = p.url;
    let title = p.title;

    const ARE_WE_HOME = document.documentElement.classList.contains('home');
    if (!ARE_WE_HOME && !url.startsWith('http')) {
        url = '../' + url;
    }

    let a = document.createElement('a');
    a.href = url;
    a.textContent = title;
    nav.append(a);

    if (a.host === location.host && a.pathname === location.pathname) {
        a.classList.add('current');
    }

    // Open external link in new tab
    if (a.host !== location.host) {
        a.target = "_blank";
    }      
}

document.body.insertAdjacentHTML(
    'afterbegin',
    `
      <label class="color-scheme">
          Theme:
          <select>
                <option value="light dark">Automatic</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
          </select>
      </label>`
);

let select = document.querySelector('.color-scheme');

if (localStorage.colorScheme) {
    document.documentElement.style.setProperty('color-scheme', localStorage.colorScheme);
    select.value = localStorage.colorScheme;
}

select.addEventListener('input', function (event) {
    console.log('color scheme changed to', event.target.value);
    document.documentElement.style.setProperty('color-scheme', event.target.value);

    localStorage.colorScheme = event.target.value;
});

export async function fetchJSON(url) {
    try {
        // Fetch the JSON file from the given URL
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch projects: ${response.statusText}`);
        }
        const data = await response.json();
        return data; 
    } catch (error) {
        console.error('Error fetching or parsing JSON data:', error);
    }
}

export function renderProjects(project, containerElement, headingLevel = 'h2') {
    containerElement.innerHTML = '';

    const projectsTitle = document.querySelector('.projects-title');
    if (projectsTitle) {
        projectsTitle.innerHTML = `${project.length} Projects`;
    }
    
    // Validate headingLevel
    const validHeadings = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
    if (!validHeadings.includes(headingLevel)) {
        headingLevel = 'h2';  // Default to h2 if invalid headingLevel
    }

    if (Array.isArray(project) && project.length > 0) {
        for (let i = 0; i < project.length; i++) {
            const proj = project[i];  // Accessing each project
                
            const title = proj.title;
            const image = proj.image;
            const description = proj.description;
            const year = proj.year;
            
            const article = document.createElement('article');
            article.innerHTML = `
                <${headingLevel}>${title}</${headingLevel}>
                <img src="${image}" alt="${title}">
                <div class="project-details">
                    <p>${description}</p>
                    <p class="project-year">c. ${year}</p>
                </div>
            `;
            containerElement.appendChild(article);
        }
    }
}

export async function fetchGitHubData(username) {
    return fetchJSON(`https://api.github.com/users/${username}`);
}