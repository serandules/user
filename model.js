var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var mongins = require('mongins');
var utils = require('utils');
var permission = require('permission');
var validators = require('validators');
var model = require('model');

var types = validators.types;
var values = validators.values;

var schema = Schema({
  password: {
    type: String,
    required: true,
    encrypted: true,
    validator: types.password({
      block: function (o, done) {
        done(null, {
          email: o.data.email || o.user.email
        });
      }
    })
  },
  email: {
    type: String,
    unique: true,
    required: true,
    validator: types.email(),
    searchable: true
  },
  tokens: {
    type: [Schema.Types.ObjectId],
    ref: 'tokens',
    validator: types.ref()
  },
  avatar: {
    type: Schema.Types.ObjectId,
    ref: 'binaries',
    validator: types.ref()
  },
  // TODO: check how groups: undefined resulted in database, whether empty array or null
  groups: {
    type: [Schema.Types.ObjectId],
    ref: 'groups',
    validator: types.groups(),
    value: values.groups()
  },
  alias: {
    type: String,
    required: true,
    validator: types.name({
      length: 100
    })
  },
  name: {
    type: String,
    validator: types.name({
      length: 200
    })
  },
  birthday: {
    type: Date,
    validator: types.birthday()
  },
  location: {
    type: Schema.Types.ObjectId,
    ref: 'locations',
    validator: types.ref()
  },
  contact: {
    type: Schema.Types.ObjectId,
    ref: 'contacts',
    validator: types.ref()
  }
}, {collection: 'users'});

schema.plugin(mongins());
schema.plugin(mongins.status({
  workflow: 'model-users'
}));
schema.plugin(mongins.permissions({
  workflow: 'model-users'
}));
schema.plugin(mongins.visibility({
  workflow: 'model-users'
}));
schema.plugin(mongins.createdAt());
schema.plugin(mongins.updatedAt());

model.ensureIndexes(schema, [
  {createdAt: -1, _id: -1}
]);

schema.set('toJSON', {
  getters: true,
  //virtuals: false,
  transform: function (doc, ret, options) {
    delete ret.password;
    delete ret._id;
    delete ret.__v;
  }
});

schema.statics.auth = function (user, password, done) {
  utils.compare(password, user.password, done);
};

module.exports = mongoose.model('users', schema);
