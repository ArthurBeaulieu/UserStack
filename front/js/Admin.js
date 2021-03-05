import '../scss/Admin.scss';
import Kom from './utils/Kom';
import Events from "./utils/Events";
import ModalFactory from "./modal/ModalFactory";


const kom = new Kom();
window.kom = kom;
const events = new Events();
window.events = events;

// TODO add loader
const lockRegistration = document.querySelector('#lock-registration');
const usersList = document.querySelector('#users-list');
if (lockRegistration && usersList) {
  const error = document.querySelector('#error-output');

  for (let i = 0; i < usersList.children.length; ++i) {
    const roles = usersList.children[i].querySelector('.user-roles');

    for (let j = 0; j < roles.children.length; ++j) {
      const revokeRoleInput = roles.children[j].lastElementChild;
      revokeRoleInput.addEventListener('change', () => {
        const processResponse = res => {
          if (res.status === 200) {
            window.location = '/admin/users';
          }
        };

        const parameters = {
          checked: revokeRoleInput.checked,
          roleId: revokeRoleInput.dataset.id,
          userId: usersList.children[i].dataset.id
        };

        kom.post('/api/user/update/role', parameters).then(processResponse).catch(processResponse);
      });
    }

    const deleteButton = usersList.children[i].querySelector('.delete-user');

    deleteButton.addEventListener('click', () => {
      const processResponse = res => {
        if (res.status === 200) {
          window.location = '/admin/users';
        } else if (res.code === 'B_NEVER_KILL_ROOT') {
          error.innerHTML = res.message;
        }
      };

      new ModalFactory('DeleteAccount', {
        url: '/template/modal/delete/user',
        cb: () => {
          const parameters = {
            userId: usersList.children[i].dataset.id
          };
          kom.post('/api/user/delete', parameters).then(processResponse).catch(processResponse);
        }
      });
    });
  }

  lockRegistration.addEventListener('change', () => {
    const processResponse = res => {
      if (res.status === 200) {
        window.location = '/admin/users';
      } else if (res.code === 'B_NEVER_KILL_ROOT') {
        error.innerHTML = res.message;
      }
    };

    const parameters = {
      lockRegistration: lockRegistration.checked
    };
    kom.post('/api/admin/update/settings', parameters).then(processResponse).catch(processResponse);
  });
}
