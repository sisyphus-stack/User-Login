//grabs element on the page
const form = document.querySelector('form'); 
//defines error message element
const errorElement = document.querySelector('.error-message');

const userElement = document.querySelector('.users');
const API_URL = 'http://localhost:5000/users';

errorElement.style.display = 'none';

let skip = 0;
let limit = 5;
let loading = false;
let finished = false;

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const formData = new FormData(form);
  const username = formData.get('username');
  const password = formData.get('password');

  if (username.trim() && password.trim()) {
    errorElement.style.display = 'none';

    const user = {
      username,
      password
    };
    
    fetch(API_URL, {
      method: 'POST',
      body: JSON.stringify(user),
      headers: {
        'content-type': 'application/json'
      }
    }).then(response => {      
      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType.includes('json')) {
          return response.json().then(error => Promise.reject(error.message));
        } else {
          return response.text().then(message => Promise.reject(message));
        }
      }
    }).then(() => {
      form.reset();
      setTimeout(() => {
        form.style.display = '';
      }, 30000);
      listAllUsers();
    }).catch(errorMessage => {
      form.style.display = '';
      errorElement.textContent = errorMessage;
      errorElement.style.display = '';
    });
  } else {
    errorElement.textContent = 'Content are required!';
    errorElement.style.display = '';
  }
});

function listAllUsers(reset = true) {
  loading = true;
  if (reset) {
    userElement.innerHTML = '';
    skip = 0;
    finished = false;
  }
  fetch(`${API_URL}?skip=${skip}&limit=${limit}`)
    .then(response => response.json())
    .then(result => {
      result.users.forEach(user => {
        const div = document.createElement('div');

        const header = document.createElement('p');
        header.textContent = user.username;
        
        const contents = document.createElement('p');
        contents.textContent = user.password;

        const date = document.createElement('small');
        date.textContent = new Date(user.created);

        div.appendChild(username);
        div.appendChild(password);
        div.appendChild(date);

        userElement.appendChild(div);
      });
      loading = false;
    });
}
