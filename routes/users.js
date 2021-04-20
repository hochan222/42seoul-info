const express = require('express');
const router = express.Router();
const ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn;
const ObjectUtils = require('../common/ObjectUtils');
const DateUtils = require('../common/DateUtils');
const userService = require('../services/userService');

/* GET users listing. */
router.get('/', ensureLoggedIn('/login/42'), async function (req, res, next) {
  const username = req.query.u;
  const refresh = req.query.r;
  const user = await userService.findOne(username);
  let one;
  if (!user || refresh) {
    try {
      one = await userService.update(username, req.session.accessToken);
    } catch (err) {
      const error = new Error("[User.js] getUri, getCoalition: " + err.message);
      error.status = (err.response) ? err.response.status : 500;
      if (error.status === 401) {
        res.redirect('/login/42');
        return;
      }
      next(error);
      return;
    }
  } else {
    one = (typeof user.data === 'string') ? JSON.parse(user.data) : user.data;
    ObjectUtils.calcDiff(one.projects_users, 'marked_at');
  }
  res.render('user', {
    user: one,
    updatedAt: DateUtils.getDatetime((!user || refresh) ? undefined : user.updatedAt),
    DateUtils,
  })
});

module.exports = router;
