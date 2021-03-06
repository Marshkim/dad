// import constants
import ExportConstants from './export.constants';

const initialState = {
  isFetching: false,
};

// The export reducer
const exportReducer = (state = initialState, action) => {
  switch (action.type) {
  case ExportConstants.EXPORT_ALL_REQUEST:
    return Object.assign({}, state, {
      isFetching: true,
      errorMessage: '',
    });
  case ExportConstants.EXPORT_ALL_SUCCESS:
    return Object.assign({}, state, {
      isFetching: false,
      errorMessage: '',
    });
  case ExportConstants.EXPORT_ALL_INVALID_REQUEST:
    return Object.assign({}, state, {
      isFetching: false,
      errorMessage: action.error,
    });
  default:
    return state;
  }
};

export default exportReducer;
