export const MESSAGE_PATTERNS = {
  USERS: {
    GET_USER: 'users.get_user',
    GET_ADDRESSES: 'users.get_addresses',
    GET_DEFAULT_ADDRESS: 'users.get_default_address',
    GET_BY_IDENTITY_ID: 'users.get_by_identity_id',
    SEARCH: 'users.search',
    UPDATE_PROFILE: 'users.update_profile',
    UPDATE_AVATAR: 'users.update_avatar',
    ADD_ADDRESS: 'users.add_address',
    UPDATE_ADDRESS: 'users.update_address',
    REMOVE_ADDRESS: 'users.remove_address',
    SET_DEFAULT_ADDRESS: 'users.set_default_address',
  },
  ORDERS: {
    // TODO: add orders RPC patterns (e.g. CREATE, GET_BY_ID, LIST)
  },
  PAYMENTS: {
    // TODO: add payments RPC patterns (e.g. PROCESS, GET_BY_ID)
  },
  PRODUCTS: {
    // TODO: add products RPC patterns (e.g. CREATE, GET_BY_ID, RESERVE_STOCK)
  },
  IDENTITY: {
    REGISTER: 'identity.register',
    LOGIN: 'identity.login',
    REFRESH_TOKEN: 'identity.refresh_token',
    LOGOUT: 'identity.logout',
    VALIDATE_TOKEN: 'identity.validate_token',
    VERIFY_EMAIL: 'identity.verify_email',
    FORGOT_PASSWORD: 'identity.forgot_password',
    RESET_PASSWORD: 'identity.reset_password',
  },
} as const;
