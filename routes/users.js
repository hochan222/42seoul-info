const express = require('express');
const router = express.Router();
const ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn;
const axios = require('axios');
const dayjs = require('dayjs');
const User = require('../stores/User');

/* GET users listing. */
router.get('/', ensureLoggedIn('/login/42'), async function (req, res, next) {
  const username = req.query.u;
  const user = await User.findOne(username);
  console.log(user);
  if (!user) {
    const accessToken = req.session.accessToken;

    const headers = {
      'headers':
        { 'Authorization': 'Bearer ' + accessToken }
    }
    const uri = 'https://api.intra.42.fr/v2/users/' + username;
    axios.get(uri, headers)
      .then(async response => {
        const one = response.data;
        await User.save(one);
        res.render('user', { user: one, createdAt: dayjs().format('YYYY/DD/MM HH:mm:ss')  });
      })
      .catch(e => {
        const error = new Error(e.message);
        console.log(e.message);
        error.status = e.response.status;
        next(error);
      })
      .finally(() => { });
  } else {
    res.render('user', { user: user.data, createdAt: dayjs(user.createdAt).format('YYYY/DD/MM HH:mm:ss') })
  }

});

module.exports = router;
