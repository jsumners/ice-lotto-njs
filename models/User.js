'use strict';

/**
 * Defines a basic user object.
 *
 * @returns {User}
 * @class User
 */
function User() {
  if (!(this instanceof User)) {
    return new User();
  }
}

User.prototype = {
  /**
   * Retrieve the database identifier for the user.
   * @returns {integer} An integer identifier. If it has not been set, -1 will
   * be returned.
   */
  get id() {
    return this._id || -1;
  },
  /**
   * Set the database identifier for the user.
   * @param {integer} id The integer identifier.
   */
  set id(id) {
    this._id = id;
  },

  /**
   * Retrieve the Guild Wars 2 display name for the user.
   * @returns {string}
   */
  get gw2DisplayName() {
    return this._gw2DisplayName || '';
  },
  /**
   * Set the user's Guild Wars 2 display name to the specified value.
   * @param {string} name The display name for the user (e.g. 'Morhyn.8032').
   */
  set gw2DisplayName(name) {
    this._gw2DisplayName = name;
  },

  /**
   * Get the user's local display name (i.e. the name that will be shown to them
   * and other user's of the application).
   * @returns {string} A user's set display name (e.g. "James Sumners"), or
   * their {@link User#gw2DisplayName} if a localized one has not been set.
   */
  get displayName() {
    return this._displayName || this.gw2DisplayName;
  },
  /**
   * Set the user's local display name.
   * @param {string} name The user's local display name to use.
   */
  set displayName(name) {
    this._displayName = name;
  },

  /**
   * Get the user's email address.
   * @returns {string} The user's email address.
   */
  get email() {
    return this._email || '';
  },
  /**
   * Set the user's email address.
   * @param {string} email An emails address for the user.
   */
  set email(email) {
    this._email = email;
  },

  /**
   * Retrieve the user's password hash.
   * @returns {string|undefined} The user's password hash or `undefined` if it
   * is not set.
   */
  get password() {
    return this._password;
  },
  /**
   * Set the user's password hash.
   * @param {string} password The hash to set.
   */
  set password(password) {
    // TODO: hash it with bcrypt?
    this._password = password;
  },

  /**
   * Retrieve the user's timezone preference, or the UTC timezone if not set.
   * @returns {string} A timezone string that can be used with moment-timezone.
   */
  get timeZone() {
    return this._timeZone || 'UTC';
  },
  /**
   * Set the user's timezone.
   * @param {string} tz A timezone string.
   */
  set timeZone(tz) {
    // TODO: validate against `require('moment-timezone').tz.names()`?
    this._timeZone = tz;
  },

  /**
   * Retrieve the user's preferred date time formatting string.
   * @returns {string} A string that can be used with Moment.js or a sane
   * default ('YYYY-MM-DD HH:mm Z').
   */
  get datetimeFormat() {
    return this._dtFormat || 'YYYY-MM-DD HH:mm Z';
  },
  /**
   * Set the user's preferred date time formatting string. The string should
   * meet the rules outlined at {@link http://momentjs.com/docs/#/parsing/string-format/}.
   * @param {string} dtFormat A date time format string.
   */
  set datetimeFormat(dtFormat) {
    this._dtFormat = dtFormat;
  },

  /**
   * Retrieve the user's account claiming key.
   * @returns {string} The claim key or an empty string if not set.
   */
  get claimKey() {
    return this._claimKey || '';
  },
  /**
   * Set the user's account claiming key.
   * @param {string} key The user's claim key.
   */
  set claimKey(key) {
    this._claimKey = key;
  },

  /**
   * Determines if a user has claimed their account or not.
   * @returns {boolean} True if the account has been claimed, false otherwise.
   */
  get claimed() {
    return this._claimed || false;
  },
  /**
   * Set the claim status of the user's account.
   * @param {boolean} claimed
   */
  set claimed(claimed) {
    this._claimed = claimed;
  },

  /**
   * Determines if the user's account is currently enabled or not.
   * @returns {boolean} The account activation status as `true` or `false`.
   */
  get enabled() {
    return this._enabled || false;
  },
  /**
   * Sets the user's account activation status.
   * @param {boolean} enabled
   */
  set enabled(enabled) {
    this._enabled = enabled;
  }
};

/**
 * Determines if the user's account has been claimed or not.
 * @returns {boolean} `true` if claimed, `false` otherwise.
 */
User.prototype.isClaimed = function() {
  return this.claimed;
};

/**
 * Determines if the user's account is currently active.
 * @returns {boolean} `True` if active, `false` otherwise.
 */
User.prototype.isEnabled = function() {
  return this.enabled;
};

module.exports = User;