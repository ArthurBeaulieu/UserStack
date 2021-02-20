import '../scss/User.scss';
import Kom from './utils/Kom';
const kom = new Kom();


const clearErrorClasses = obj => {
  const keys = Object.keys(obj);
  for (let i = 0; i < keys.length; ++i) {
    obj[keys[i]].classList.remove('error');
  }
};


const editProfileInfoSubmit = document.querySelector('#edit-profile-info-submit');
if (editProfileInfoSubmit) {
  const dom = {
    username: document.querySelector('#username'),
    email: document.querySelector('#email'),
    error: document.querySelector('#error-output'),
    loading: document.querySelector('#line-loader')
  };

  const processResponse = res => {
    dom.loading.style.opacity = '0';
    if (res.status === 200) {
      dom.username.value = res.info.username;
      dom.email.value = res.info.email;
      if (res.taken.username) { dom.username.classList.add('error'); }
      if (res.taken.email) { dom.email.classList.add('error'); }
      if (res.message) { dom.error.innerHTML = res.message; }
    } else if (res.code === 'B_USER_INFO_NO_CHANGES') {
      dom.error.innerHTML = res.message;
    }
  };

  editProfileInfoSubmit.addEventListener('click', event => {
    event.preventDefault();
    const formData = new FormData(document.querySelector('#edit-profile-info-form'));
    const parameters = Object.fromEntries(formData.entries());
    dom.loading.style.opacity = '1';
    dom.error.innerHTML = '';
    clearErrorClasses(dom);
    kom.post('/api/user/update/info', parameters).then(processResponse).catch(processResponse);
  });
}


const editProfilePasswordSubmit = document.querySelector('#edit-profile-password-submit');
if (editProfilePasswordSubmit) {
  const dom = {
    pass1: document.querySelector('#pass1'),
    pass2: document.querySelector('#pass2'),
    pass3: document.querySelector('#pass3'),
    error: document.querySelector('#error-output'),
    loading: document.querySelector('#line-loader')
  };

  const processResponse = res => {
    dom.loading.style.opacity = '0';
    dom.error.innerHTML = res.message;
    if (res.status === 200) {
      dom.pass1.value = '';
      dom.pass2.value = '';
      dom.pass3.value = '';
    } else {
      dom.error.classList.add('error');
      if (res.code === 'B_USER_PASSWORD_NO_CHANGES') {
        dom.pass1.classList.add('error');
        dom.pass2.classList.add('error');
        dom.pass3.classList.add('error');
      } else if (res.code === 'B_USER_PASSWORD_MISSING_FIELD') {
        if (res.missing.pass1) { dom.pass1.classList.add('error'); }
        if (res.missing.pass2) { dom.pass2.classList.add('error'); }
        if (res.missing.pass3) { dom.pass3.classList.add('error'); }
      } else if (res.code === 'B_USER_PASSWORD_NOT_VALID') {
        dom.pass1.classList.add('error');
      } else if (res.code === 'B_USER_PASSWORD_DIFFERENT_PASSWORDS') {
        dom.pass2.classList.add('error');
        dom.pass3.classList.add('error');
      } else if (res.code === 'B_USER_PASSWORD_TOO_SHORT') {
        dom.pass2.classList.add('error');
        dom.pass3.classList.add('error');
      }
    }
  };

  editProfilePasswordSubmit.addEventListener('click', event => {
    event.preventDefault();
    const formData = new FormData(document.querySelector('#edit-profile-password-form'));
    const parameters = Object.fromEntries(formData.entries());
    dom.loading.style.opacity = '1';
    dom.error.innerHTML = '';
    clearErrorClasses(dom);
    kom.post('/api/user/update/password', parameters).then(processResponse).catch(processResponse);
  });
}


const deleteAccount = document.querySelector('#delete-account');
if (deleteAccount) {
  const error = document.querySelector('#error-output');
  // TODO confirm modal maybe ?
  const processResponse = res => {
    if (res.status === 200) {
      window.location.href = res.url;
    } else if (res.code === 'B_NEVER_KILL_JESUS') {
      error.innerHTML = res.message;
    }
  };

  deleteAccount.addEventListener('click', () => {
    kom.get('/api/user/delete').then(processResponse).catch(processResponse);
  });
}
