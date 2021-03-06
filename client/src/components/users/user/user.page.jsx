// React
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import DocumentTitle from 'react-document-title';
import { push } from 'react-router-redux';
import { Button, Container, Divider, Dropdown, Form, Header, Icon, Label, Segment } from 'semantic-ui-react';
import { ALL_VISIBLE_ROLES, getRoleColor, getRoleIcon, getRoleLabel } from '../../../modules/auth/auth.constants';

// Thunks / Actions
import UsersThunks from '../../../modules/users/users.thunks';
import EntitiesThunks from '../../../modules/entities/entities.thunks';
import ToastsActions from '../../../modules/toasts/toasts.actions';

import { getEntitiesAsOptions } from '../../../modules/entities/entities.selectors';

import { AUTH_ADMIN_ROLE } from '../../../modules/auth/auth.constants';

// Style
import './user.page.scss';

// User Component
class UserComponent extends React.Component {

  state = { user: {} }

  componentWillMount = () => {
    this.setState({ user: { ...this.props.user } });
  }

  componentWillReceiveProps = (nextProps) => {
    this.setState({ user: { ...nextProps.user } });
  }

  componentDidMount = () => {
    const { userId } = this.props;
    Promise.all([this.props.fetchEntities()]).then(() => {
      this.props.fetchUser(userId);
    });
  }

  handleChange = (e, { name, value, checked }) => {
    const { user } = this.state;
    const state = {
      user: { ...user, [name]: value || checked }
    };
    this.setState(state);
  }

  handleSubmit = (e) => {
    e.preventDefault();
    const stateUser = this.state.user;
    const user = { ...stateUser, entities: [...stateUser.entities] };
    this.props.onSave(user);
  }

  renderDropDownButton = (user, isFetching) => {
    return (
      <Button loading={isFetching} color={getRoleColor(user.role)} className='role' onClick={(e) => e.preventDefault()}>
        <Icon name={getRoleIcon(user.role)} />
        {getRoleLabel(user.role)}
      </Button>
    );
  }

  renderRoleDropdown = (user, isFetching, isReadOnly) => {
    const options = ALL_VISIBLE_ROLES.map((role) => {
      return {
        icon: <Icon name={getRoleIcon(role)} color={getRoleColor(role)} />,
        value: role,
        text: getRoleLabel(role)
      };
    });

    return (
      <Dropdown disabled={isReadOnly} pointing trigger={this.renderDropDownButton(user, isFetching)} onChange={this.handleChange} options={options}
        icon={null} value={user.role} name='role'
      />
    );
  }

  isReadonly = () => this.props.auth.user.role !== AUTH_ADMIN_ROLE

  render = () => {
    const readOnly = this.isReadonly();
    const { isFetching, entities, isEntitiesFetching } = this.props;
    const { user } = this.state;
    const userName = (user && user.displayName) || '';
    const title = 'D.A.D - User ' + userName;
    return (
      <DocumentTitle title={title}>
        <Container className='user-page'>
          <Segment loading={isFetching} padded>
            <Header as='h1'>
              <Link to={'/users'}>
                <Icon name='arrow left' fitted />
              </Link>
              {`${user.displayName || ''}`} {user.username ? `(${user.username})` : ''}
            </Header>
            <Divider hidden />
            <Form onSubmit={this.handleSubmit}>
              <Form.Group widths='two' >
                <Form.Input readOnly label='Username' value={user.username || ''} onChange={this.handleChange}
                  type='text' name='username' autoComplete='off' placeholder='Username'
                />
                <Form.Input readOnly label='Email Address' value={user.email || ''} onChange={this.handleChange}
                  type='text' name='email' autoComplete='off' placeholder='A valid email address'
                />
              </Form.Group>

              <Form.Group widths='two'>
                <Form.Input readOnly label='First Name' value={user.firstName || ''} onChange={this.handleChange}
                  type='text' name='firstName' autoComplete='off' placeholder='First Name'
                />
                <Form.Input readOnly label='Last Name' value={user.lastName || ''} onChange={this.handleChange}
                  type='text' name='lastName' autoComplete='off' placeholder='Last Name'
                />
              </Form.Group>

              <Divider hidden />

              <Form.Group>
                <Form.Field width='two'>
                  <Label size='large' className='form-label' content='Role' />
                </Form.Field>
                <Form.Field width='fourteen'>
                  {this.renderRoleDropdown(user, isFetching, readOnly)}
                </Form.Field>
              </Form.Group>

              <Form.Group>
                <Form.Field width='two'>
                  <Label size='large' className='form-label' content='Entities' />
                </Form.Field>
                <Form.Dropdown disabled={readOnly} width='fourteen' placeholder='Select entities' fluid multiple search selection loading={isEntitiesFetching}
                  name='entities' options={entities} value={user.entities || []} onChange={this.handleChange}
                />
              </Form.Group>

              <Divider hidden />

              {!readOnly && <Button fluid color='green' content='Save' loading={isFetching} />}
            </Form>
          </Segment>
        </Container>
      </DocumentTitle>
    );
  }
}

UserComponent.propTypes = {
  auth: PropTypes.object,
  user: PropTypes.object,
  isFetching: PropTypes.bool,
  entities: PropTypes.array,
  isEntitiesFetching: PropTypes.bool,
  userId: PropTypes.string.isRequired,
  fetchUser: PropTypes.func.isRequired,
  fetchEntities: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired
};

const mapStateToProps = (state, ownProps) => {
  const paramId = ownProps.params.id;
  const users = state.users;
  const user = users.selected;
  const emptyUser = { entities: [] };
  const isFetching = paramId && (paramId !== user.id || user.isFetching);
  const entities = Object.values(state.entities.items);
  return {
    user: users.items[user.id] || emptyUser,
    isFetching,
    userId: paramId,
    auth: state.auth,
    entities: getEntitiesAsOptions({ entities, withType: true }),
    isEntitiesFetching: state.entities.isFetching
  };
};

const mapDispatchToProps = (dispatch) => ({
  fetchUser: (id) => dispatch(UsersThunks.fetch(id)),
  fetchEntities: () => dispatch(EntitiesThunks.fetchIfNeeded()),
  onSave: (user) => dispatch(UsersThunks.save(user, () => push('/users'), ToastsActions.savedSuccessNotification('User ' + user.displayName))),
});

const UserPage = connect(
  mapStateToProps,
  mapDispatchToProps
)(UserComponent);

export default UserPage;
