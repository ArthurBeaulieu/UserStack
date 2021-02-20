import '../scss/Auth.scss';
import Kom from './utils/Kom';
const kom = new Kom();


const mailRegex = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;


const clearErrorClasses = obj => {
  const keys = Object.keys(obj);
  for (let i = 0; i < keys.length; ++i) {
    obj[keys[i]].classList.remove('error');
  }
};


const registerSubmit = document.querySelector('#register-submit');
if (registerSubmit) {
  const dom = {
    username: document.querySelector('#username'),
    email: document.querySelector('#email'),
    code: document.querySelector('#code'),
    pass1: document.querySelector('#pass1'),
    pass2: document.querySelector('#pass2'),
    error: document.querySelector('#error-output'),
    loading: document.querySelector('#line-loader')
  };
  // Method to check that fields are properly filled
  const validateFields = data => {
    // This validation only concerns frontend side. Same tests and other ones are performed server side
    if (data.username && data.username.length < 1) {
      dom.error.innerHTML = 'Username must at least contain one character.';
      dom.username.classList.add('error');
      return false;
    } else if (data.email && !mailRegex.test(data.email)) {
      dom.error.innerHTML = 'Provided email is invalid';
      dom.email.classList.add('error');
      return false;
    } else if (data.pass1 !== data.pass2) {
      dom.error.innerHTML = 'The two provided passwords are not matching.';
      dom.pass1.classList.add('error');
      dom.pass2.classList.add('error');
      return false;
    }
    return true;
  };
  // Method to react to the server response for a given form
  const processResponse = res => {
    dom.loading.style.opacity = '0';
    // Parse server response to react accordingly
    if (res.status === 200) {
      window.location.href = res.url;
    } else {
      // Handle backend errors
      dom.error.classList.add('error');
      dom.error.innerHTML = res.message;
      if (res.code === 'B_REGISTER_EXISTING_USERNAME') {
        dom.username.classList.add('error');
      } else if (res.code === 'B_REGISTER_EXISTING_EMAIL') {
        dom.email.classList.add('error');
      } else if (res.code === 'B_REGISTER_MISSING_FIELD') {
        if (res.missing.username) { dom.username.classList.add('error'); }
        if (res.missing.email) { dom.email.classList.add('error'); }
        if (res.missing.code) { dom.code.classList.add('error'); }
        if (res.missing.pass1) { dom.pass1.classList.add('error'); }
        if (res.missing.pass2) { dom.pass2.classList.add('error'); }
      } else if (res.code === 'B_REGISTER_DIFFERENT_PASSWORDS') {
        dom.pass1.classList.add('error');
        dom.pass2.classList.add('error');
      } else if (res.code === 'B_REGISTER_PASSWORD_TOO_SHORT') {
        dom.pass1.classList.add('error');
        dom.pass2.classList.add('error');
      } else if (res.code === 'B_REGISTER_INVALID_CODE') {
        dom.code.classList.add('error');
      }
    }
  };
  // Register submit event listener
  registerSubmit.addEventListener('click', event => {
    event.preventDefault(); // Avoid default form redirection
    const formData = new FormData(document.querySelector('#register-form'));
    const parameters = Object.fromEntries(formData.entries());
    // Remove previous error classes and feedback
    dom.error.innerHTML = '';
    clearErrorClasses(dom);
    // Only call server is front tests are ok. Same tests are performed server side
    if (validateFields(parameters)) {
      dom.loading.style.opacity = '1';
      kom.post('/api/auth/register', parameters).then(processResponse).catch(processResponse);
    }
  });
}

const loginSubmit = document.querySelector('#login-submit');
if (loginSubmit) {
  const dom = {
    username: document.querySelector('#username'),
    password: document.querySelector('#password'),
    error: document.querySelector('#error-output'),
    loading: document.querySelector('#line-loader')
  };
  // Method to react to the server response for a given form
  const processResponse = res => {
    dom.loading.style.opacity = '0';
    // Parse server response to react accordingly
    if (res.status === 200) {
      window.location.href = res.url;
    } else {
      // Handle backend errors
      dom.error.classList.add('error');
      dom.error.innerHTML = res.message;
      if (res.code === 'B_LOGIN_MISSING_FIELD') {
        if (res.missing.username) { dom.username.classList.add('error'); }
        if (res.missing.password) { dom.password.classList.add('error'); }
      } else if (res.code === 'B_LOGIN_USER_NOT_FOUND') {
        dom.username.classList.add('error');
      } else if (res.code === 'B_LOGIN_INVALID_PASSWORD') {
        dom.password.classList.add('error');
      }
    }
  };
  // Login submit event listener
  loginSubmit.addEventListener('click', event => {
    event.preventDefault(); // Avoid default form redirection
    const formData = new FormData(document.querySelector('#login-form'));
    const parameters = Object.fromEntries(formData.entries());
    dom.loading.style.opacity = '1';
    // Remove previous error classes and feedback
    dom.error.innerHTML = '';
    clearErrorClasses(dom);
    kom.post('/api/auth/login', parameters).then(processResponse).catch(processResponse);
  });
}
