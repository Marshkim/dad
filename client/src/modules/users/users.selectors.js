import { containsWithoutAccents } from '../utils/strings';
import { sortby } from '../utils/arrays';

export const getFilteredUsers = (users, filterValue) => {
  if (!filterValue || filterValue === '') {
    return Object.values(users).sort(sortby('username'));
  } else {
    return Object.values(users).filter(user => {
      return containsWithoutAccents(JSON.stringify(Object.values(user)), filterValue);
    }).sort(sortby('username'));
  }
};

export const getUsersAsOptions = (users) => {
  return Object.values(users).map(user => {
    return { value: user.id, name: user.displayName } ;
  });
};
